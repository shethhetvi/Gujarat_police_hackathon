from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
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
