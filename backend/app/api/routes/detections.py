from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.detection import DetectionEvent
from app.schemas.detection import DetectionResponse

router = APIRouter()

@router.get("/", response_model=List[DetectionResponse])
def get_detections(
    camera_id: Optional[int] = Query(None),
    plate_number: Optional[str] = Query(None),
    matched_only: bool = Query(False),
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db)
):
    query = db.query(DetectionEvent)
    if camera_id:
        query = query.filter(DetectionEvent.camera_id == camera_id)
    if plate_number:
        query = query.filter(DetectionEvent.plate_number.ilike(f"%{plate_number}%"))
    if matched_only:
        query = query.filter(DetectionEvent.matched == True)
    return query.order_by(DetectionEvent.timestamp.desc()).limit(limit).all()
