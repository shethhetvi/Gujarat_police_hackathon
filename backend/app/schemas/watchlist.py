from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class WatchlistBase(BaseModel):
    plate_number: str
    category: str
    description: Optional[str] = None
    vehicle_make_model: Optional[str] = None
    color: Optional[str] = None
    priority: Optional[str] = "HIGH"
    is_active: Optional[bool] = True

class WatchlistCreate(WatchlistBase):
    pass

class WatchlistResponse(WatchlistBase):
    id: int
    created_at: Optional[datetime] = None

    # Live CCTV surveillance telemetry from camera grid
    last_seen_camera_id: Optional[int] = None
    last_seen_camera_name: Optional[str] = None
    last_seen_location: Optional[str] = None
    last_seen_time: Optional[datetime] = None
    last_seen_speed_kmh: Optional[float] = None
    last_seen_snapshot_url: Optional[str] = None
    last_seen_sha256: Optional[str] = None
    total_sightings: Optional[int] = 0
    dispatch_status: Optional[str] = "PENDING"
    dispatched_unit: Optional[str] = None
    latest_alert_id: Optional[int] = None
    is_overspeeding: Optional[bool] = False

    class Config:
        from_attributes = True
