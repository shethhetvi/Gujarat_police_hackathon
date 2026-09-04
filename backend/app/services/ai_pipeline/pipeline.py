import os
import time
import cv2
import hashlib
import numpy as np
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from app.services.ai_pipeline.detector import VehicleDetector
from app.services.ai_pipeline.tracker import ByteTrackTracker
from app.services.ai_pipeline.anpr_ocr import ANPROCREngine
from app.services.ai_pipeline.speed_detector import MonotonicSpeedDetector
from app.services.matching_engine import MatchingEngine
from app.services.alert_service import AlertService
from app.models.camera import Camera
from app.models.detection import DetectionEvent

# Snapshots directory
SNAPSHOT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "snapshots")

class VideoAnalyticsPipeline:
    """
    Unified end-to-end processing pipeline for traffic camera feeds:
    Frame Ingestion -> YOLOv8 Detection -> Color & Body Type Extraction ->
    ByteTrack Tracking -> Plate ROI Localization -> Indian HSRP ANPR OCR ->
    Monotonic PTS Speed Estimation -> Cryptographic SHA-256 Hashing ->
    Watchlist & Violation Matching -> Real-Time Alert Broadcast.
    """
    def __init__(self):
        self.detector = VehicleDetector()
        self.tracker = ByteTrackTracker()
        self.ocr = ANPROCREngine()
        self.speed_detector = MonotonicSpeedDetector()
        self.reported_tracks = set()  # Avoid spamming alerts for the same track in short window

    def compute_sha256_hash(self, plate: str, camera_id: int, track_id: int, speed: float, pts: float) -> str:
        """
        Generates verifiable cryptographic SHA-256 integrity hash
        for Section 65B Indian Evidence Act courtroom compliance.
        """
        raw_token = f"GUJARAT_POLICE_ICCC_{plate}_{camera_id}_{track_id}_{speed:.2f}_{pts:.6f}_{int(time.time()*1000)}"
        return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()

    def save_snapshot(
        self,
        frame: np.ndarray,
        bbox: List[int],
        plate: str,
        color: str,
        body_type: str,
        speed_kmh: float,
        pts: float,
        sha256_hash: str
    ) -> str:
        """Save annotated vehicle & plate crop as forensic snapshot on disk and return relative URL."""
        try:
            os.makedirs(SNAPSHOT_DIR, exist_ok=True)
            filename = f"snap_{plate}_{int(time.time()*1000)}.jpg"
            filepath = os.path.join(SNAPSHOT_DIR, filename)

            # Draw tactical HUD on frame copy
            annotated = frame.copy()
            x1, y1, x2, y2 = bbox

            # Bounding box with warning red
            cv2.rectangle(annotated, (x1, y1), (x2, y2), (0, 34, 230), 2)

            # Plate & Speed banner
            badge_text = f"TARGET: {plate} | {speed_kmh:.0f} km/h | {color} {body_type}"
            (tw, th), _ = cv2.getTextSize(badge_text, cv2.FONT_HERSHEY_SIMPLEX, 0.65, 2)
            cv2.rectangle(annotated, (x1, max(0, y1 - th - 12)), (x1 + tw + 16, y1), (15, 23, 42), -1)
            cv2.rectangle(annotated, (x1, max(0, y1 - th - 12)), (x1 + tw + 16, y1), (0, 34, 230), 1)
            cv2.putText(annotated, badge_text, (x1 + 8, max(20, y1 - 8)),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.65, (56, 189, 248), 2)

            # Watermark SHA-256 for Section 65B
            h, w = frame.shape[:2]
            watermark_text = f"SEC 65B EVIDENCE HASH: {sha256_hash[:16]}... | PTS: {pts:.4f}"
            cv2.putText(annotated, watermark_text, (16, h - 16),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.42, (148, 163, 184), 1)

            cv2.imwrite(filepath, annotated)
            return f"/snapshots/{filename}"
        except Exception:
            return "/snapshots/default_snapshot.jpg"

    async def process_frame(
        self,
        frame: np.ndarray,
        camera: Camera,
        db: Session,
        fallback_on_empty: bool = False,
        pts_ms: Optional[float] = None
    ) -> List[Dict[str, Any]]:
        """
        Process single video frame through complete AI pipeline,
        persisting detections with PTS speed, color, body type, and evidence hashes.
        Adheres to Sentinel Sandbox PTS timing rules for speed and dwell calculations.
        """
        results = []
        matching_engine = MatchingEngine(db)

        # 1. Detection (with Color & Body Type Attributes)
        detections = self.detector.detect_vehicles(frame, fallback_on_empty=fallback_on_empty)
        if not detections:
            return results

        # 2. Tracking with Monotonic PTS (Sentinel Sandbox Specification)
        tracked_objects = self.tracker.update(detections, pts_ms=pts_ms)

        # 3. Process each tracked vehicle
        for obj in tracked_objects:
            bbox = obj["bbox"]
            track_id = obj.get("tracking_id", 0)
            color = obj.get("color", "White")
            body_type = obj.get("body_type", "SUV")
            dwell_ms = obj.get("dwell_ms", 0.0)
            x1, y1, x2, y2 = bbox

            # 4. Monotonic PTS Speed Estimation
            is_highway = "highway" in (camera.location_name or "").lower() or "sg" in (camera.name or "").lower()
            speed_kmh, is_overspeeding, pts = self.speed_detector.update_and_calculate_speed(
                track_id=track_id,
                bbox=bbox,
                is_highway=is_highway
            )

            # 5. Crop Vehicle & Locate Dedicated Plate ROI
            h, w = frame.shape[:2]
            vehicle_crop = frame[max(0, y1):min(h, y2), max(0, x1):min(w, x2)]
            plate_crop, plate_roi = self.detector.locate_license_plate_roi(vehicle_crop)

            # 6. Extract Plate with Indian ANPR OCR & Phonetic Rectification (Two-tier fallback for extreme CCTV)
            plate_text = None
            ocr_conf = 0.0
            is_simulated = False
            if plate_crop is not None and plate_crop.shape[0] >= 20 and plate_crop.shape[1] >= 50:
                plate_text, ocr_conf, is_simulated = self.ocr.extract_plate(plate_crop, allow_fallback=False)
            
            if not plate_text:
                plate_text, ocr_conf, is_simulated = self.ocr.extract_plate(vehicle_crop, allow_fallback=fallback_on_empty)

            is_sim_event = obj.get("is_simulated", False) or is_simulated

            if plate_text:
                # 7. Check Watchlist Match
                is_matched, watchlist_entry = matching_engine.check_match(plate_text)
                should_alert = is_matched or is_overspeeding

                # 8. Compute Cryptographic Evidence Integrity Hash (Section 65B)
                sha256_hash = self.compute_sha256_hash(plate_text, camera.id, track_id, speed_kmh, pts)

                snapshot_url = None
                if should_alert:
                    snapshot_url = self.save_snapshot(
                        frame=frame,
                        bbox=bbox,
                        plate=plate_text,
                        color=color,
                        body_type=body_type,
                        speed_kmh=speed_kmh,
                        pts=pts,
                        sha256_hash=sha256_hash
                    )

                # 9. Record Detection Event in DB
                det_event = DetectionEvent(
                    camera_id=camera.id,
                    plate_number=plate_text,
                    confidence=ocr_conf,
                    tracking_id=track_id,
                    snapshot_url=snapshot_url,
                    matched=is_matched,
                    watchlist_entry_id=watchlist_entry.id if watchlist_entry else None,
                    is_simulated=is_sim_event,
                    speed_kmh=speed_kmh,
                    pts_timestamp=pts,
                    vehicle_color=color,
                    vehicle_type=body_type,
                    sha256_hash=sha256_hash
                )
                db.add(det_event)
                db.commit()
                db.refresh(det_event)

                # 10. Dispatch Real-time Alert if matched or over-speeding
                if should_alert:
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
                    "color": color,
                    "body_type": body_type,
                    "speed_kmh": speed_kmh,
                    "pts_timestamp": pts,
                    "sha256_hash": sha256_hash,
                    "matched": is_matched,
                    "is_overspeeding": is_overspeeding,
                    "is_simulated": is_sim_event
                })

        return results

video_pipeline = VideoAnalyticsPipeline()
