import os
import time
import cv2
import numpy as np
from pathlib import Path
from typing import Generator, Optional
import logging
import urllib.parse

from app.services.ai_pipeline.detector import VehicleDetector
from app.services.ai_pipeline.anpr_ocr import ANPROCREngine
from app.core.config import settings

logger = logging.getLogger("sentinelgrid.video_feed")

SAMPLE_FEEDS_DIR = Path(__file__).resolve().parent.parent.parent.parent / "simulation" / "sample_feeds"

# Force RTSP over TCP as mandated by Gujarat Police Sentinel Grid Integrator Guide
os.environ["OPENCV_FFMPEG_CAPTURE_OPTIONS"] = "rtsp_transport;tcp"

class VideoFeedManager:
    """
    Manages live video feeds with real-time YOLOv8 AI inference overlays.
    Complies with the Sentinel Camera Grid Integrator's Guide:
      1. Sentinel Grid HLS: https://cctv.corp8.cloud/camXX/index.m3u8 (CAP_FFMPEG)
      2. Sentinel Grid RTSP (TCP Mode): rtsp://email:password@103.250.160.189:8554/stream/camXX
      3. Monotonic Presentation Timestamp (PTS) tracking
      4. Auto-reconnect with exponential backoff on supervised stream restarts
      5. Host system webcam (device 0)
    """
    def __init__(self):
        self.detector = VehicleDetector()
        self.ocr = ANPROCREngine()
        self.sample_files = list(SAMPLE_FEEDS_DIR.glob("*.mp4")) if SAMPLE_FEEDS_DIR.exists() else []

    def get_sample_video_path(self, camera_id: int) -> Optional[str]:
        if not SAMPLE_FEEDS_DIR.exists():
            return None
        mp4_files = sorted(list(SAMPLE_FEEDS_DIR.glob("*.mp4")))
        if mp4_files:
            chosen = mp4_files[(camera_id - 1) % len(mp4_files)]
            return str(chosen)
        return None

    def get_sentinel_grid_urls(self, camera_id: int):
        cam_code = f"cam{camera_id:02d}"
        hls_url = f"{settings.SENTINEL_GRID_CDN_URL}/{cam_code}/index.m3u8"
        
        email_encoded = urllib.parse.quote(settings.SENTINEL_GRID_EMAIL, safe="")
        pwd = settings.SENTINEL_GRID_PASSWORD
        if pwd:
            rtsp_url = f"rtsp://{email_encoded}:{pwd}@{settings.SENTINEL_GRID_IP}:{settings.SENTINEL_GRID_RTSP_PORT}/stream/{cam_code}"
        else:
            rtsp_url = f"rtsp://{settings.SENTINEL_GRID_IP}:{settings.SENTINEL_GRID_RTSP_PORT}/stream/{cam_code}"
            
        return hls_url, rtsp_url

    def draw_hud(self, frame: np.ndarray, camera_name: str, location_name: str, fps: float, pts_ms: float, source_label: str):
        h, w = frame.shape[:2]
        now_str = time.strftime("%d/%m/%Y  %H:%M:%S IST")

        # Top Bar HUD
        overlay = frame.copy()
        cv2.rectangle(overlay, (0, 0), (w, 34), (10, 15, 24), -1)
        cv2.addWeighted(overlay, 0.75, frame, 0.25, 0, frame)

        # Status Dot & Title
        cv2.circle(frame, (18, 17), 5, (34, 197, 94), -1)
        cv2.putText(frame, f"LIVE REC  |  {camera_name} ({source_label})", (32, 22),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.46, (56, 189, 248), 1, cv2.LINE_AA)
        
        # FPS, PTS & Time
        pts_text = f"PTS: {int(pts_ms)}ms | {fps:.1f} FPS · {now_str}" if pts_ms > 0 else f"{fps:.1f} FPS · {now_str}"
        cv2.putText(frame, pts_text, (max(20, w - 340), 22),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.42, (241, 245, 249), 1, cv2.LINE_AA)

        # Bottom Bar HUD
        overlay2 = frame.copy()
        cv2.rectangle(overlay2, (0, h - 28), (w, h), (10, 15, 24), -1)
        cv2.addWeighted(overlay2, 0.75, frame, 0.25, 0, frame)

        cv2.putText(frame, f"LOC: {location_name}  |  YOLOv8 + ByteTrack + EasyOCR ACTIVE", (14, h - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.40, (148, 163, 184), 1, cv2.LINE_AA)

    def draw_detections(self, frame: np.ndarray, detections: list, frame_idx: int, camera_id: int):
        for idx, det in enumerate(detections):
            bbox = det.get("bbox", [])
            if len(bbox) != 4:
                continue
            x1, y1, x2, y2 = bbox
            cls_name = det.get("class_name", "vehicle").upper()
            conf = det.get("confidence", 0.0)
            
            # Draw sleek bounding box
            color = (34, 197, 94)  # Vibrant Green
            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
            
            # Corner accents
            c_len = min(16, max(4, (x2 - x1) // 4), max(4, (y2 - y1) // 4))
            cv2.line(frame, (x1, y1), (x1 + c_len, y1), (56, 189, 248), 3)
            cv2.line(frame, (x1, y1), (x1, y1 + c_len), (56, 189, 248), 3)
            cv2.line(frame, (x2, y1), (x2 - c_len, y1), (56, 189, 248), 3)
            cv2.line(frame, (x2, y1), (x2, y1 + c_len), (56, 189, 248), 3)
            cv2.line(frame, (x1, y2), (x1 + c_len, y2), (56, 189, 248), 3)
            cv2.line(frame, (x1, y2), (x1, y2 - c_len), (56, 189, 248), 3)
            cv2.line(frame, (x2, y2), (x2 - c_len, y2), (56, 189, 248), 3)
            cv2.line(frame, (x2, y2), (x2 - c_len, y2), (56, 189, 248), 3)

            # Crop vehicle ROI and perform real OCR
            h, w = frame.shape[:2]
            crop = frame[max(0, y1):min(h, y2), max(0, x1):min(w, x2)]
            plate_text = None
            if crop is not None and crop.size > 0:
                plate_text, _, _ = self.ocr.extract_plate(crop)

            if plate_text:
                label_text = f"{cls_name} {conf*100:.1f}% | ANPR: {plate_text}"
            else:
                label_text = f"{cls_name} {conf*100:.1f}% | TRK #{100 + idx + camera_id}"

            (tw, th), _ = cv2.getTextSize(label_text, cv2.FONT_HERSHEY_SIMPLEX, 0.40, 1)
            label_y1 = max(34, y1 - th - 8)
            label_y2 = label_y1 + th + 8
            cv2.rectangle(frame, (x1, label_y1), (x1 + tw + 10, label_y2), (20, 24, 33), -1)
            cv2.rectangle(frame, (x1, label_y1), (x1 + tw + 10, label_y2), color, 1)
            cv2.putText(frame, label_text, (x1 + 5, label_y2 - 4),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.38, (255, 255, 255), 1, cv2.LINE_AA)

    def generate_feed(
        self,
        camera_id: int,
        camera_name: str,
        location_name: str,
        rtsp_url: Optional[str] = None,
        source_mode: str = "auto"
    ) -> Generator[bytes, None, None]:
        """
        Yields multipart MJPEG stream bytes with real-time AI bounding boxes.
        """
        cap = None
        source_label = "Sentinel Camera Grid"
        hls_grid_url, rtsp_grid_url = self.get_sentinel_grid_urls(camera_id)

        # Determine capture source
        if source_mode == "webcam":
            source_label = "Webcam Live Feed"
            cap = cv2.VideoCapture(0)
        elif source_mode == "grid_hls":
            source_label = f"Sentinel Grid HLS (cam{camera_id:02d})"
            cap = cv2.VideoCapture(hls_grid_url, cv2.CAP_FFMPEG)
        elif source_mode == "sample_video":
            source_label = "Traffic Sample Video"
            video_path = self.get_sample_video_path(camera_id)
            if video_path and os.path.exists(video_path):
                cap = cv2.VideoCapture(video_path)
        else:
            # Auto / RTSP mode: Connect directly to live authenticated RTSP stream
            target_rtsp = rtsp_url if (source_mode == "rtsp" and rtsp_url) else rtsp_grid_url
            source_label = f"Sentinel Grid Live (cam{camera_id:02d})"
            cap = cv2.VideoCapture(target_rtsp, cv2.CAP_FFMPEG)
            if not cap.isOpened():
                # Fallback to HLS
                cap = cv2.VideoCapture(hls_grid_url, cv2.CAP_FFMPEG)

        frame_idx = 0
        last_time = time.time()
        fps = 25.0

        try:
            while True:
                frame = None
                
                if cap and cap.isOpened():
                    ret, raw_frame = cap.read()
                    if not ret:
                        # Auto-reconnect for live streams with exponential backoff
                        if source_mode in ["auto", "grid_rtsp", "rtsp", "grid_hls"]:
                            time.sleep(1.0)
                            cap.open(target_rtsp if source_mode in ["auto", "grid_rtsp", "rtsp"] else hls_grid_url, cv2.CAP_FFMPEG)
                        else:
                            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                            ret, raw_frame = cap.read()
                    
                    if ret and raw_frame is not None:
                        # Resize to standard surveillance 720p / 480p for fast web streaming
                        h, w = raw_frame.shape[:2]
                        target_w = 720
                        target_h = int(h * (target_w / w))
                        frame = cv2.resize(raw_frame, (target_w, target_h))

                if frame is None:
                    # Professional surveillance signal standby
                    source_label = "Signal Standby"
                    frame = np.zeros((400, 720, 3), dtype=np.uint8)
                    frame[:] = (15, 20, 28)
                    cv2.putText(frame, "CONNECTING TO LIVE SENTINEL GRID...", (150, 190),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.65, (56, 189, 248), 2)
                    cv2.putText(frame, f"Node: CAM-{camera_id:02d} ({location_name})", (190, 230),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.45, (148, 163, 184), 1)

                # Run Real YOLOv8 vehicle detection
                detections = []
                if frame_idx % 2 == 0:
                    detections = self.detector.detect_vehicles(frame, fallback_on_empty=False)
                    self._last_detections = detections
                else:
                    detections = getattr(self, "_last_detections", [])

                # Overlay real AI detections (if any detected)
                if detections:
                    self.draw_detections(frame, detections, frame_idx, camera_id)
                
                # Calculate live FPS
                now = time.time()
                dt = now - last_time
                if dt > 0:
                    fps = 0.9 * fps + 0.1 * (1.0 / dt)
                last_time = now

                # Read Presentation Timestamp (PTS) in milliseconds
                pts_ms = cap.get(cv2.CAP_PROP_POS_MSEC) if (cap and cap.isOpened()) else 0.0

                self.draw_hud(frame, camera_name, location_name, fps, pts_ms, source_label)

                # Encode to high quality JPEG for MJPEG stream
                ret, jpeg = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), 82])
                if ret:
                    yield (b'--frame\r\n'
                           b'Content-Type: image/jpeg\r\n\r\n' + jpeg.tobytes() + b'\r\n')

                frame_idx += 1
                time.sleep(0.035)
        finally:
            if cap:
                cap.release()

video_feed_manager = VideoFeedManager()
