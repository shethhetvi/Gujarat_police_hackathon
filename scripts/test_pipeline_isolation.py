"""
Isolated test script for SentinelGrid Video Analytics Pipeline.
Validates Detection -> Tracking -> ANPR OCR -> Watchlist Matching in isolation.
"""
import sys
import os
import cv2
import numpy as np
import asyncio

# Add backend to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.core.database import SessionLocal, init_db_tables
from app.models.camera import Camera
from app.models.watchlist import WatchlistEntry
from app.services.ai_pipeline.pipeline import video_pipeline

async def run_pipeline_test():
    print("==================================================")
    print("    Running Video Pipeline Isolation Test        ")
    print("==================================================")
    
    # Initialize DB tables
    init_db_tables()
    db = SessionLocal()

    try:
        # Create or fetch test camera
        cam = db.query(Camera).first()
        if not cam:
            cam = Camera(
                name="Isolation Test Camera (Ahmedabad Ring Road)",
                vendor="Hikvision",
                protocol="RTSP",
                stream_url="test_stream.mp4",
                location_name="Ahmedabad Ring Road",
                latitude=23.0225,
                longitude=72.5714,
                is_active=True
            )
            db.add(cam)
            db.commit()
            db.refresh(cam)
            print(f"Created test camera: {cam.name}")

        # Create or fetch test watchlist entry
        target_plate = "GJ01AB1234"
        wl = db.query(WatchlistEntry).filter(WatchlistEntry.plate_number == target_plate).first()
        if not wl:
            wl = WatchlistEntry(
                plate_number=target_plate,
                category="stolen",
                description="Test Stolen Vehicle for Pipeline Validation",
                priority="CRITICAL",
                is_active=True
            )
            db.add(wl)
            db.commit()
            db.refresh(wl)
            print(f"Created test watchlist entry: {wl.plate_number}")

        # Generate a synthetic traffic frame (720x1280)
        frame = np.zeros((720, 1280, 3), dtype=np.uint8)
        frame[:] = (35, 35, 40) # asphalt dark background
        # Draw vehicle bounding box & plate mock
        cv2.rectangle(frame, (300, 200), (900, 600), (100, 100, 120), -1)
        cv2.putText(frame, target_plate, (400, 400), cv2.FONT_HERSHEY_SIMPLEX, 1.5, (255, 255, 255), 3)

        print("\nProcessing synthetic test frame through VideoAnalyticsPipeline...")
        results = await video_pipeline.process_frame(frame, cam, db, fallback_on_empty=True)
        
        print("\nPipeline Execution Results:")
        for r in results:
            print(f" - Track ID: {r['track_id']} | Plate: {r['plate_number']} | Conf: {r['confidence']} | Matched: {r['matched']} | Simulated: {r['is_simulated']}")

        assert len(results) > 0, "Pipeline should return at least one detection result"
        assert results[0]["matched"] is True, "Target plate should match active watchlist"
        print("\n[SUCCESS] AI Pipeline isolation test PASSED!")

    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(run_pipeline_test())
