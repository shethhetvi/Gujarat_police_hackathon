from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AlertBase(BaseModel):
    detection_event_id: Optional[int] = None
    camera_id: Optional[int] = None
    watchlist_entry_id: Optional[int] = None
    plate_number: str
    severity: Optional[str] = "HIGH"
    location_name: Optional[str] = None
    snapshot_url: Optional[str] = None
    acknowledged: Optional[bool] = False
    acknowledged_by: Optional[str] = None
    is_simulated: Optional[bool] = False
    classification_tag: Optional[str] = "WANTED_SUSPECT_FIR"
    speed_kmh: Optional[float] = 0.0
    dispatched_unit: Optional[str] = None
    dispatch_status: Optional[str] = "PENDING"

class AlertCreate(AlertBase):
    pass

class AlertResponse(AlertBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True
