"""
Database initialization and test seed script.
"""
import sys
import os
import json
from pathlib import Path

# Add backend to python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.core.database import SessionLocal, engine, Base
from app.models.camera import Camera
from app.models.watchlist import WatchlistEntry
from app.models.detection import DetectionEvent
from app.models.alert import Alert

def init_db():
    print("Creating database schema tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Check if cameras already seeded
        if db.query(Camera).count() == 0:
            mock_cam_path = Path(__file__).parent.parent / "simulation" / "mock_data" / "sample_cameras.json"
            if mock_cam_path.exists():
                with open(mock_cam_path) as f:
                    cams = json.load(f)
                    for c in cams:
                        db.add(Camera(**c))
                print(f"Seeded {len(cams)} cameras.")

        # Check if watchlist already seeded
        if db.query(WatchlistEntry).count() == 0:
            mock_wl_path = Path(__file__).parent.parent / "simulation" / "mock_data" / "sample_watchlist.json"
            if mock_wl_path.exists():
                with open(mock_wl_path) as f:
                    wls = json.load(f)
                    for w in wls:
                        db.add(WatchlistEntry(**w))
                print(f"Seeded {len(wls)} watchlist targets.")

        db.commit()
        print("Database seeded successfully.")
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
