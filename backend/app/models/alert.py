from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
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
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
