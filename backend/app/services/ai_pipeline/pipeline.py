import os
import time
import cv2
import numpy as np
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from app.services.ai_pipeline.detector import VehicleDetector
from app.services.ai_pipeline.tracker import ByteTrackTracker
from app.services.ai_pipeline.anpr_ocr import ANPROCREngine
from app.services.matching_engine import MatchingEngine
from app.services.alert_service import AlertService
from app.models.camera import Camera
from app.models.detection import DetectionEvent

# Snapshots directory
SNAPSHOT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "snapshots")

class VideoAnalyticsPipeline:
    """
    Unified end-to-end processing pipeline for a single camera feed:
    Frame Ingestion -> YOLOv8 Detection -> ByteTrack Tracking -> ANPR OCR -> Matching -> Alert Broadcast.
    """
    def __init__(self):
        self.detector = VehicleDetector()
        self.tracker = ByteTrackTracker()
        self.ocr = ANPROCREngine()
        self.reported_tracks = set()  # Avoid spamming alerts for the same track in short window

    def save_snapshot(self, frame: np.ndarray, bbox: List[int], plate: str) -> str:
        """Save vehicle & plate crop as snapshot image on disk and return relative URL."""
        try:
            os.makedirs(SNAPSHOT_DIR, exist_ok=True)
            filename = f"snap_{plate}_{int(time.time()*1000)}.jpg"
            filepath = os.path.join(SNAPSHOT_DIR, filename)
            
            # Draw bounding box on frame copy
            annotated = frame.copy()
            x1, y1, x2, y2 = bbox
            cv2.rectangle(annotated, (x1, y1), (x2, y2), (0, 0, 255), 2)
            cv2.putText(annotated, plate, (x1, max(30, y1 - 10)),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
            
            cv2.imwrite(filepath, annotated)
            return f"/snapshots/{filename}"
        except Exception:
            return "/snapshots/default_snapshot.jpg"

    async def process_frame(
        self,
        frame: np.ndarray,
        camera: Camera,
        db: Session,
        fallback_on_empty: bool = False
    ) -> List[Dict[str, Any]]:
        """
        Process single video frame against watchlist and persist detection audit logs.
        """
        results = []
        matching_engine = MatchingEngine(db)

        # 1. Detection
        detections = self.detector.detect_vehicles(frame, fallback_on_empty=fallback_on_empty)
        if not detections:
            return results

        # 2. Tracking
        tracked_objects = self.tracker.update(detections)

        # 3. ANPR & Matching for each vehicle
        for obj in tracked_objects:
            bbox = obj["bbox"]
            track_id = obj.get("tracking_id", 0)
            x1, y1, x2, y2 = bbox
            
            # Crop vehicle ROI
            h, w = frame.shape[:2]
            crop = frame[max(0, y1):min(h, y2), max(0, x1):min(w, x2)]

            # 4. Extract Plate
            plate_text, ocr_conf, is_simulated = self.ocr.extract_plate(crop)
            is_sim_event = obj.get("is_simulated", False) or is_simulated

            if plate_text:
                # 5. Check Watchlist Match
                is_matched, watchlist_entry = matching_engine.check_match(plate_text)
                
                snapshot_url = None
                if is_matched:
                    snapshot_url = self.save_snapshot(frame, bbox, plate_text)

                # 6. Record Detection Event in DB
                det_event = DetectionEvent(
                    camera_id=camera.id,
                    plate_number=plate_text,
                    confidence=ocr_conf,
                    tracking_id=track_id,
                    snapshot_url=snapshot_url,
                    matched=is_matched,
                    watchlist_entry_id=watchlist_entry.id if watchlist_entry else None,
                    is_simulated=is_sim_event
                )
                db.add(det_event)
                db.commit()
                db.refresh(det_event)

                # 7. Dispatch Real-time Alert if matched and not spamming track ID
                if is_matched and watchlist_entry:
                    track_key = f"{camera.id}_{track_id}_{plate_text}"
                    if track_key not in self.reported_tracks:
                        self.reported_tracks.add(track_key)
                        await AlertService.create_and_broadcast_alert(
                            db=db,
                            detection=det_event,
                            watchlist_entry=watchlist_entry,
                            camera=camera
                        )

                results.append({
                    "track_id": track_id,
                    "plate_number": plate_text,
                    "confidence": ocr_conf,
                    "matched": is_matched,
                    "is_simulated": is_sim_event
                })

        return results

video_pipeline = VideoAnalyticsPipeline()
