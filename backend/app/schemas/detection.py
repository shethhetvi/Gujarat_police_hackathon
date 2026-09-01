from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DetectionBase(BaseModel):
    camera_id: int
    plate_number: Optional[str] = None
    confidence: Optional[float] = 0.0
    tracking_id: Optional[int] = None
    snapshot_url: Optional[str] = None
    matched: Optional[bool] = False
    watchlist_entry_id: Optional[int] = None
    is_simulated: Optional[bool] = False

class DetectionCreate(DetectionBase):
    pass

class DetectionResponse(DetectionBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True
