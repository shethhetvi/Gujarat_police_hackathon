from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    detection_event_id = Column(Integer, ForeignKey("detection_events.id"), nullable=False)
    camera_id = Column(Integer, ForeignKey("cameras.id"), nullable=False)
    watchlist_entry_id = Column(Integer, ForeignKey("watchlist_entries.id"), nullable=False)
    plate_number = Column(String, index=True, nullable=False)
    severity = Column(String, default="HIGH")  # CRITICAL, HIGH, MEDIUM
    location_name = Column(String, nullable=True)
    snapshot_url = Column(String, nullable=True)
    acknowledged = Column(Boolean, default=False)
    acknowledged_by = Column(String, nullable=True)
    is_simulated = Column(Boolean, default=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    # Tactical & Classification attributes
    classification_tag = Column(String, default="WANTED_SUSPECT_FIR")  # STOLEN_VEHICLE, WANTED_SUSPECT_FIR, SUSPICIOUS_RECCE, TRAFFIC_VIOLATOR
    speed_kmh = Column(Float, default=0.0)
    dispatched_unit = Column(String, nullable=True)
    dispatch_status = Column(String, default="PENDING")  # PENDING, DISPATCHED, INTERCEPTED
