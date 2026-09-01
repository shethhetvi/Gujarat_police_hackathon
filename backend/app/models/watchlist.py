from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class WatchlistEntry(Base):
    __tablename__ = "watchlist_entries"

    id = Column(Integer, primary_key=True, index=True)
    plate_number = Column(String, unique=True, index=True, nullable=False)
    category = Column(String, nullable=False)  # stolen, wanted, missing, blacklisted
    description = Column(String, nullable=True)
    vehicle_make_model = Column(String, nullable=True)
    color = Column(String, nullable=True)
    priority = Column(String, default="HIGH")  # CRITICAL, HIGH, MEDIUM, LOW
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
