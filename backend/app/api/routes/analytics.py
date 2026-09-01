from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.core.database import get_db
from app.models.camera import Camera
from app.models.watchlist import WatchlistEntry
from app.models.detection import DetectionEvent
from app.models.alert import Alert

router = APIRouter()

@router.get("/summary")
def get_analytics_summary(db: Session = Depends(get_db)):
    total_cameras = db.query(Camera).count()
    active_cameras = db.query(Camera).filter(Camera.is_active == True).count()
    watchlist_count = db.query(WatchlistEntry).filter(WatchlistEntry.is_active == True).count()
    total_detections = db.query(DetectionEvent).count()
    unacknowledged_alerts = db.query(Alert).filter(Alert.acknowledged == False).count()

    return {
        "total_cameras": total_cameras,
        "active_cameras": active_cameras,
        "watchlist_count": watchlist_count,
        "total_detections": total_detections,
        "unacknowledged_alerts": unacknowledged_alerts
    }

@router.get("/route/{plate_number}")
def get_vehicle_route(plate_number: str, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Reconstructs the cross-camera travel route and history for a suspect license plate.
    Returns ordered GPS checkpoints for drawing movement lines on the GIS map.
    """
    cleaned = "".join(c for c in plate_number if c.isalnum()).upper()
    
    # Query detections matching this plate
    detections = (
        db.query(DetectionEvent, Camera)
        .join(Camera, DetectionEvent.camera_id == Camera.id)
        .filter(DetectionEvent.plate_number.ilike(f"%{cleaned}%"))
        .order_by(DetectionEvent.timestamp.asc())
        .all()
    )

    if not detections:
        # Check if plate exists in watchlist to provide metadata
        wl = db.query(WatchlistEntry).filter(WatchlistEntry.plate_number.ilike(f"%{cleaned}%")).first()
        return {
            "plate_number": plate_number,
            "category": wl.category if wl else "unknown",
            "checkpoints_count": 0,
            "checkpoints": []
        }

    wl_entry = db.query(WatchlistEntry).filter(WatchlistEntry.plate_number.ilike(f"%{cleaned}%")).first()

    checkpoints = []
    for det, cam in detections:
        checkpoints.append({
            "detection_id": det.id,
            "camera_id": cam.id,
            "camera_name": cam.name,
            "location_name": cam.location_name,
            "latitude": cam.latitude,
            "longitude": cam.longitude,
            "timestamp": str(det.timestamp),
            "confidence": det.confidence,
            "snapshot_url": det.snapshot_url,
            "matched": det.matched,
            "is_simulated": det.is_simulated
        })

    return {
        "plate_number": plate_number,
        "category": wl_entry.category if wl_entry else "suspect",
        "priority": wl_entry.priority if wl_entry else "HIGH",
        "checkpoints_count": len(checkpoints),
        "checkpoints": checkpoints
    }

@router.post("/simulate-sighting")
async def simulate_sighting(
    plate_number: str = "GJ01AB1234",
    camera_id: int = None,
    db: Session = Depends(get_db)
):
    """
    Live Hackathon Demo Trigger:
    Simulates a real-time CCTV frame detection for a suspect plate at a Gujarat camera node.
    Fires AI pipeline, generates snapshot, triggers matching, and broadcasts real-time WebSocket alert.
    """
    import cv2
    import numpy as np
    from app.services.ai_pipeline.pipeline import video_pipeline

    # 1. Fetch camera
    if camera_id:
        cam = db.query(Camera).filter(Camera.id == camera_id).first()
    else:
        cam = db.query(Camera).filter(Camera.is_active == True).first()
    
    if not cam:
        cam = Camera(
            name="Ahmedabad S.G. Highway Junction",
            vendor="Hikvision",
            protocol="RTSP",
            stream_url="rtsp://demo/ahmedabad_sg.mp4",
            location_name="Ahmedabad S.G. Highway",
            latitude=23.0338,
            longitude=72.5085,
            is_active=True
        )
        db.add(cam)
        db.commit()
        db.refresh(cam)

    # 2. Ensure plate exists in watchlist
    clean_target = "".join(c for c in plate_number if c.isalnum()).upper()
    wl = db.query(WatchlistEntry).filter(WatchlistEntry.plate_number.ilike(f"%{clean_target}%")).first()
    if not wl:
        wl = WatchlistEntry(
            plate_number=clean_target,
            category="stolen",
            priority="CRITICAL",
            vehicle_make_model="White SUV / Sedan",
            description="Simulated Target Plate for Live Jury Evaluation",
            is_active=True
        )
        db.add(wl)
        db.commit()
        db.refresh(wl)

    # 3. Create synthetic traffic video frame
    frame = np.zeros((720, 1280, 3), dtype=np.uint8)
    frame[:] = (30, 32, 40)
    # Vehicle box
    cv2.rectangle(frame, (250, 220), (950, 620), (80, 85, 95), -1)
    # License plate bounding area
    cv2.rectangle(frame, (450, 480), (750, 560), (240, 240, 245), -1)
    cv2.putText(frame, clean_target, (460, 535), cv2.FONT_HERSHEY_DUPLEX, 1.3, (15, 15, 20), 3)

    # 4. Clear reported tracks buffer to ensure alert is dispatched
    video_pipeline.reported_tracks.clear()

    # 5. Process through AI pipeline
    results = await video_pipeline.process_frame(frame, cam, db, fallback_on_empty=True)

    # Fetch newly created alert
    latest_alert = db.query(Alert).filter(Alert.plate_number == clean_target).order_by(Alert.id.desc()).first()

    return {
        "status": "success",
        "message": f"Real-time sighting triggered for target {clean_target} at {cam.name}",
        "camera": {
            "id": cam.id,
            "name": cam.name,
            "location_name": cam.location_name,
            "latitude": cam.latitude,
            "longitude": cam.longitude
        },
        "detection": results[0] if results else None,
        "alert": {
            "id": latest_alert.id if latest_alert else None,
            "plate_number": clean_target,
            "severity": wl.priority,
            "timestamp": str(latest_alert.timestamp) if latest_alert else None
        }
    }

@router.post("/simulate-route")
async def simulate_route(
    plate_number: str = "GJ01AB1234",
    db: Session = Depends(get_db)
):
    """
    Live Hackathon Demo Trigger:
    Simulates a target vehicle driving through 4 major Gujarat highway checkpoints
    (Ahmedabad -> Vadodara -> Surat -> Rajkot) with sequential timestamps.
    """
    import datetime
    from app.models.detection import DetectionEvent
    from app.models.alert import Alert

    clean_target = "".join(c for c in plate_number if c.isalnum()).upper()
    
    # Ensure watchlist entry
    wl = db.query(WatchlistEntry).filter(WatchlistEntry.plate_number.ilike(f"%{clean_target}%")).first()
    if not wl:
        wl = WatchlistEntry(
            plate_number=clean_target,
            category="wanted",
            priority="CRITICAL",
            vehicle_make_model="Black SUV",
            description="Suspect Vehicle under State Surveillance",
            is_active=True
        )
        db.add(wl)
        db.commit()
        db.refresh(wl)

    cameras = db.query(Camera).all()
    if not cameras:
        return {"status": "error", "message": "No cameras in database to simulate route."}

    now = datetime.datetime.now(datetime.timezone.utc)
    created_events = []

    for idx, cam in enumerate(cameras[:5]):
        # Spaced out timestamps (e.g. 15 minutes apart)
        event_time = now - datetime.timedelta(minutes=(len(cameras[:5]) - idx) * 15)
        det = DetectionEvent(
            camera_id=cam.id,
            plate_number=clean_target,
            confidence=0.95 - (idx * 0.02),
            tracking_id=100 + idx,
            snapshot_url="/snapshots/snap_GJ01AB1234_1788281568019.jpg",
            matched=True,
            watchlist_entry_id=wl.id,
            is_simulated=True,
            timestamp=event_time
        )
        db.add(det)
        db.commit()
        db.refresh(det)

        alert = Alert(
            detection_event_id=det.id,
            camera_id=cam.id,
            watchlist_entry_id=wl.id,
            plate_number=clean_target,
            severity=wl.priority,
            location_name=cam.location_name,
            snapshot_url=det.snapshot_url,
            is_simulated=True,
            acknowledged=False,
            timestamp=event_time
        )
        db.add(alert)
        db.commit()
        created_events.append({"camera": cam.name, "time": str(event_time)})

    return {
        "status": "success",
        "message": f"Successfully plotted {len(created_events)} checkpoints across Gujarat for plate {clean_target}",
        "checkpoints": created_events
    }

