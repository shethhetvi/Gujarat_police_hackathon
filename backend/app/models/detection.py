from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base

class DetectionEvent(Base):
    __tablename__ = "detection_events"

    id = Column(Integer, primary_key=True, index=True)
    camera_id = Column(Integer, ForeignKey("cameras.id"), nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    plate_number = Column(String, index=True, nullable=True)
    confidence = Column(Float, default=0.0)
    tracking_id = Column(Integer, nullable=True)
    snapshot_url = Column(String, nullable=True)
    matched = Column(Boolean, default=False)
    watchlist_entry_id = Column(Integer, ForeignKey("watchlist_entries.id"), nullable=True)
