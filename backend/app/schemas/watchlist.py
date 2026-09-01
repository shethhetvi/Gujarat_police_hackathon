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

    class Config:
        from_attributes = True
