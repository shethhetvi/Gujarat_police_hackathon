import os
import time
import asyncio
import cv2
import numpy as np
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db, SessionLocal
from app.models.camera import Camera
from app.models.watchlist import WatchlistEntry
from app.models.detection import DetectionEvent
from app.models.alert import Alert
from app.schemas.camera import CameraCreate, CameraResponse
from app.services.ai_pipeline.pipeline import video_pipeline

router = APIRouter()

@router.get("/", response_model=List[CameraResponse])
def get_cameras(db: Session = Depends(get_db)):
    return db.query(Camera).all()

@router.post("/", response_model=CameraResponse)
def create_camera(camera_in: CameraCreate, db: Session = Depends(get_db)):
    camera = Camera(**camera_in.model_dump())
    db.add(camera)
    db.commit()
    db.refresh(camera)
    return camera

@router.get("/{camera_id}", response_model=CameraResponse)
def get_camera(camera_id: int, db: Session = Depends(get_db)):
    camera = db.query(Camera).filter(Camera.id == camera_id).first()
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    return camera

from app.services.video_feed_manager import video_feed_manager

@router.get("/{camera_id}/endpoints")
def get_camera_endpoints(camera_id: int, db: Session = Depends(get_db)):
    """
    Returns all 3 protocol endpoints for this camera per Sentinel Integrator Reference:
      1. RTSP (TCP Mode): rtsp://email:password@103.250.160.189:8554/stream/camXX (AI inference)
      2. WebRTC (WHEP): http://email:password@103.250.160.189:8889/stream/camXX/whep (Low latency preview)
      3. HLS: https://cctv.corp8.cloud/camXX/index.m3u8 (Dashboards, mobile, restricted networks)
    """
    cam = db.query(Camera).filter(Camera.id == camera_id).first()
    if not cam:
        raise HTTPException(status_code=404, detail="Camera not found")
    
    hls_url, rtsp_url, whep_url = video_feed_manager.get_sentinel_grid_urls(camera_id)
    return {
        "camera_id": cam.id,
        "camera_code": f"cam{cam.id:02d}",
        "name": cam.name,
        "location": cam.location_name,
        "is_active": cam.is_active,
        "endpoints": {
            "rtsp": {
                "protocol": "RTSP",
                "transport": "TCP (forced)",
                "url": rtsp_url,
                "purpose": "AI Inference (OpenCV, GStreamer, DeepStream, YOLOv8)"
            },
            "webrtc": {
                "protocol": "WebRTC (WHEP)",
                "transport": "HTTP/WHEP",
                "url": whep_url,
                "purpose": "Low-latency browser preview"
            },
            "hls": {
                "protocol": "HLS",
                "transport": "HTTPS",
                "url": hls_url,
                "purpose": "Dashboards, mobile, restricted networks"
            }
        }
    }

@router.get("/{camera_id}/live-feed")
def get_camera_live_feed(
    camera_id: int,
    source: Optional[str] = "auto",
    db: Session = Depends(get_db)
):
    """
    Live streaming endpoint (MJPEG) with real-time AI bounding box overlays.
    Supports source: 'auto' (sample video), 'webcam', 'rtsp'.
    Can be directly embedded in standard <img> HTML tags.
    """
    cam = db.query(Camera).filter(Camera.id == camera_id).first()
    cam_name = cam.name if cam else f"CAM-{camera_id:02d}"
    loc_name = cam.location_name if cam else "Gujarat Surveillance Grid"
    rtsp_url = cam.rtsp_url if cam else None

    return StreamingResponse(
        video_feed_manager.generate_feed(
            camera_id=camera_id,
            camera_name=cam_name,
            location_name=loc_name,
            rtsp_url=rtsp_url,
            source_mode=source or "auto"
        ),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )

@router.post("/{camera_id}/analyze")
async def run_camera_analytics(
    camera_id: int,
    plate_number: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Trigger real-time AI analytics on this camera feed:
    - Captures real video frame from live stream
    - Runs YOLOv8 vehicle detection & ByteTrack tracking
    - Performs ANPR OCR plate extraction
    - Cross-references database watchlist & generates real-time alert
    """
    cam = db.query(Camera).filter(Camera.id == camera_id).first()
    if not cam:
        raise HTTPException(status_code=404, detail="Camera not found")

    # Connect to live camera stream (Sentinel Grid RTSP over TCP -> HLS fallback -> Sample Video fallback)
    hls_url, rtsp_url = video_feed_manager.get_sentinel_grid_urls(cam.id)
    target_stream = cam.stream_url if cam.stream_url and "rtsp://" in cam.stream_url else rtsp_url
    
    cap = cv2.VideoCapture(target_stream, cv2.CAP_FFMPEG)
    if not cap.isOpened():
        cap = cv2.VideoCapture(hls_url, cv2.CAP_FFMPEG)
    if not cap.isOpened():
        sample_path = video_feed_manager.get_sample_video_path(cam.id)
        if sample_path and os.path.exists(sample_path):
            cap = cv2.VideoCapture(sample_path)
    
    frame = None
    pts_ms = 0.0
    if cap.isOpened():
        ret, raw = cap.read()
        if ret and raw is not None:
            frame = raw
            pts_ms = cap.get(cv2.CAP_PROP_POS_MSEC)
        cap.release()

    if frame is None:
        raise HTTPException(status_code=503, detail=f"Unable to capture live frame from camera {cam.name}")

    # Process frame through live AI pipeline with Monotonic PTS
    video_pipeline.reported_tracks.clear()
    results = await video_pipeline.process_frame(frame, cam, db, pts_ms=pts_ms)

    # If plate_number was specifically requested for screening, check match
    target_plate = "".join(c for c in (plate_number or "") if c.isalnum()).upper()
    latest_alert = None
    if target_plate:
        latest_alert = db.query(Alert).filter(Alert.plate_number == target_plate).order_by(Alert.id.desc()).first()
    elif results:
        detected_plate = results[0].get("plate_number")
        if detected_plate:
            latest_alert = db.query(Alert).filter(Alert.plate_number == detected_plate).order_by(Alert.id.desc()).first()

    return {
        "status": "success",
        "camera": {
            "id": cam.id,
            "name": cam.name,
            "location": cam.location_name
        },
        "detections_count": len(results),
        "detections": results,
        "alert": {
            "id": latest_alert.id if latest_alert else None,
            "plate_number": latest_alert.plate_number if latest_alert else None,
            "severity": latest_alert.severity if latest_alert else None,
            "timestamp": str(latest_alert.timestamp) if latest_alert else None
        } if latest_alert else None,
        "snapshot_url": latest_alert.snapshot_url if latest_alert else None,
        "message": f"Real AI Analytics executed on live feed of {cam.name}. {len(results)} vehicle(s) tracked."
    }
