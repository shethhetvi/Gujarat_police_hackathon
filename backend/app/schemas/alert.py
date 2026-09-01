from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AlertBase(BaseModel):
    detection_event_id: int
    camera_id: int
    watchlist_entry_id: int
    plate_number: str
    severity: Optional[str] = "HIGH"
    location_name: Optional[str] = None
    snapshot_url: Optional[str] = None
    acknowledged: Optional[bool] = False
    acknowledged_by: Optional[str] = None
    is_simulated: Optional[bool] = False

class AlertCreate(AlertBase):
    pass

class AlertResponse(AlertBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True
