from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CameraBase(BaseModel):
    name: str
    vendor: Optional[str] = "Generic"
    protocol: Optional[str] = "RTSP"
    stream_url: str
    location_name: str
    latitude: float
    longitude: float
    is_active: Optional[bool] = True

class CameraCreate(CameraBase):
    pass

class CameraResponse(CameraBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
