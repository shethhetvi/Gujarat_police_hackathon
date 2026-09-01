from sqlalchemy.orm import Session
from app.models.alert import Alert
from app.models.camera import Camera
from app.models.watchlist import WatchlistEntry
from app.models.detection import DetectionEvent
from app.websocket.connection_manager import manager

class AlertService:
    @staticmethod
    async def create_and_broadcast_alert(
        db: Session,
        detection: DetectionEvent,
        watchlist_entry: WatchlistEntry,
        camera: Camera
    ) -> Alert:
        # Create database alert record
        alert = Alert(
            detection_event_id=detection.id,
            camera_id=camera.id,
            watchlist_entry_id=watchlist_entry.id,
            plate_number=watchlist_entry.plate_number,
            severity=watchlist_entry.priority or "HIGH",
            location_name=camera.location_name,
            snapshot_url=detection.snapshot_url,
            is_simulated=detection.is_simulated
        )
        db.add(alert)
        db.commit()
        db.refresh(alert)

        # Broadcast real-time alert event to connected dashboard clients
        payload = {
            "type": "NEW_ALERT",
            "alert": {
                "id": alert.id,
                "detection_event_id": alert.detection_event_id,
                "camera_id": alert.camera_id,
                "watchlist_entry_id": alert.watchlist_entry_id,
                "plate_number": alert.plate_number,
                "category": watchlist_entry.category,
                "severity": alert.severity,
                "camera_name": camera.name,
                "location_name": camera.location_name,
                "latitude": camera.latitude,
                "longitude": camera.longitude,
                "snapshot_url": alert.snapshot_url,
                "acknowledged": alert.acknowledged,
                "acknowledged_by": alert.acknowledged_by,
                "is_simulated": alert.is_simulated,
                "timestamp": str(alert.timestamp)
            }
        }
        await manager.broadcast(payload)
        return alert
