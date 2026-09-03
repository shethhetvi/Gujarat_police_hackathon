"""
Database initialization and test seed script for Gujarat Police CCTV Hackathon.
Seeds 50 heterogeneous cameras across Gujarat police zones, watchlist records,
and vehicle detection trajectory for evaluation test cases.
"""
import sys
import os
import json
import datetime
from pathlib import Path

# Add backend to python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.core.database import SessionLocal, engine, Base
from app.models.camera import Camera
from app.models.watchlist import WatchlistEntry
from app.models.detection import DetectionEvent
from app.models.alert import Alert

def init_db():
    print("Verifying database schema tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # 1. Seed / Update 50 Cameras
        mock_cam_path = Path(__file__).parent.parent / "simulation" / "mock_data" / "sample_cameras.json"
        if mock_cam_path.exists():
            with open(mock_cam_path) as f:
                cams_data = json.load(f)
            
            existing_names = {c.name for c in db.query(Camera).all()}
            added_cams = 0
            for c in cams_data:
                if c["name"] not in existing_names:
                    db.add(Camera(**c))
                    added_cams += 1
            db.commit()
            total_cams = db.query(Camera).count()
            print(f"Cameras updated: {added_cams} new cameras added (Total: {total_cams} cameras).")

        # 2. Seed Watchlist Entries
        mock_wl_path = Path(__file__).parent.parent / "simulation" / "mock_data" / "sample_watchlist.json"
        if mock_wl_path.exists():
            with open(mock_wl_path) as f:
                wls = json.load(f)
            existing_plates = {w.plate_number for w in db.query(WatchlistEntry).all()}
            added_wl = 0
            for w in wls:
                if w["plate_number"] not in existing_plates:
                    db.add(WatchlistEntry(**w))
                    added_wl += 1
            db.commit()
            print(f"Watchlist updated: {added_wl} new targets added.")

        # 3. Seed Designated Vehicle Multi-Camera Trajectory (e.g. GJ01AB1234)
        target_plate = "GJ01AB1234"
        wl_target = db.query(WatchlistEntry).filter(WatchlistEntry.plate_number == target_plate).first()
        if not wl_target:
            wl_target = WatchlistEntry(
                plate_number=target_plate,
                category="stolen",
                description="Stolen white SUV reported in Ahmedabad, tracked across highway checkpoints",
                vehicle_make_model="Hyundai Creta (White)",
                priority="CRITICAL",
                is_active=True
            )
            db.add(wl_target)
            db.commit()
            db.refresh(wl_target)

        # Check existing detections for this plate
        existing_dets = db.query(DetectionEvent).filter(DetectionEvent.plate_number == target_plate).count()
        if existing_dets < 5:
            # Pick sequential highway checkpoints across Gujarat (Ahmedabad -> Anand -> Vadodara -> Bharuch -> Surat)
            highway_camera_keywords = ["Ahmedabad SG", "Sanathal Toll", "Anand Express", "Vadodara Express", "Bharuch Narmada", "Surat Kamrej"]
            matched_cameras = []
            for kw in highway_camera_keywords:
                cam = db.query(Camera).filter(Camera.name.ilike(f"%{kw}%")).first()
                if cam and cam not in matched_cameras:
                    matched_cameras.append(cam)

            # Fallback to any 5 cameras if specific keywords not found
            if len(matched_cameras) < 5:
                matched_cameras = db.query(Camera).limit(6).all()

            now = datetime.datetime.now(datetime.timezone.utc)
            for idx, cam in enumerate(matched_cameras):
                event_time = now - datetime.timedelta(minutes=(len(matched_cameras) - idx) * 25)
                det = DetectionEvent(
                    camera_id=cam.id,
                    plate_number=target_plate,
                    confidence=0.96 - (idx * 0.01),
                    tracking_id=500 + idx,
                    snapshot_url="/snapshots/snap_GJ01AB1234_1788415097657.jpg",
                    matched=True,
                    watchlist_entry_id=wl_target.id,
                    is_simulated=True,
                    timestamp=event_time
                )
                db.add(det)
                db.commit()
                db.refresh(det)

                alert = Alert(
                    detection_event_id=det.id,
                    camera_id=cam.id,
                    watchlist_entry_id=wl_target.id,
                    plate_number=target_plate,
                    severity=wl_target.priority,
                    location_name=cam.location_name,
                    snapshot_url=det.snapshot_url,
                    is_simulated=True,
                    acknowledged=False,
                    timestamp=event_time
                )
                db.add(alert)
                db.commit()
            print(f"Seeded cross-camera route history for designated target {target_plate} across {len(matched_cameras)} camera checkpoints.")

        db.commit()
        print("Database initialization and seed complete!")
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
