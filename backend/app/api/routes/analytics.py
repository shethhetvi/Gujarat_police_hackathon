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
