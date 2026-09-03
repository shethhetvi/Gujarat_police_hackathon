from sqlalchemy.orm import Session
from app.models.alert import Alert
from app.models.camera import Camera
from app.models.watchlist import WatchlistEntry
from app.models.detection import DetectionEvent
from app.websocket.connection_manager import manager
from typing import Optional

class AlertService:
    @staticmethod
    def derive_classification_tag(watchlist_entry: Optional[WatchlistEntry], speed_kmh: float = 0.0) -> str:
        """
        Instant classification tag:
        STOLEN_VEHICLE, WANTED_SUSPECT_FIR, SUSPICIOUS_RECCE, TRAFFIC_VIOLATOR
        """
        if watchlist_entry:
            cat = (watchlist_entry.category or "").lower()
            if "stolen" in cat:
                return "STOLEN_VEHICLE"
            elif "wanted" in cat:
                return "WANTED_SUSPECT_FIR"
            elif "blacklist" in cat or "missing" in cat:
                return "SUSPICIOUS_RECCE"
            return "WANTED_SUSPECT_FIR"
        if speed_kmh > 75.0:
            return "TRAFFIC_VIOLATOR"
        return "SUSPICIOUS_RECCE"

    @staticmethod
    async def create_and_broadcast_alert(
        db: Session,
        detection: DetectionEvent,
        watchlist_entry: Optional[WatchlistEntry],
        camera: Camera,
        classification_tag: Optional[str] = None
    ) -> Alert:
        # Determine classification tag
        tag = classification_tag or AlertService.derive_classification_tag(watchlist_entry, detection.speed_kmh or 0.0)
        severity = watchlist_entry.priority if watchlist_entry else ("CRITICAL" if detection.speed_kmh > 95 else "HIGH")

        # Create database alert record
        alert = Alert(
            detection_event_id=detection.id,
            camera_id=camera.id,
            watchlist_entry_id=watchlist_entry.id if watchlist_entry else None,
            plate_number=detection.plate_number or (watchlist_entry.plate_number if watchlist_entry else "UNKNOWN"),
            severity=severity,
            location_name=camera.location_name,
            snapshot_url=detection.snapshot_url,
            is_simulated=detection.is_simulated,
            classification_tag=tag,
            speed_kmh=detection.speed_kmh or 0.0,
            dispatch_status="PENDING"
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
                "category": watchlist_entry.category if watchlist_entry else "violator",
                "classification_tag": alert.classification_tag,
                "speed_kmh": alert.speed_kmh,
                "severity": alert.severity,
                "camera_name": camera.name,
                "location_name": camera.location_name,
                "latitude": camera.latitude,
                "longitude": camera.longitude,
                "snapshot_url": alert.snapshot_url,
                "acknowledged": alert.acknowledged,
                "acknowledged_by": alert.acknowledged_by,
                "dispatched_unit": alert.dispatched_unit,
                "dispatch_status": alert.dispatch_status,
                "is_simulated": alert.is_simulated,
                "timestamp": str(alert.timestamp)
            }
        }
        await manager.broadcast(payload)
        return alert
