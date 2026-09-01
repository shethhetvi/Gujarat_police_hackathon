from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.alert import Alert
from app.schemas.alert import AlertResponse

router = APIRouter()

@router.get("/", response_model=List[AlertResponse])
def get_alerts(acknowledged: bool = False, db: Session = Depends(get_db)):
    return db.query(Alert).filter(Alert.acknowledged == acknowledged).order_by(Alert.timestamp.desc()).all()

@router.post("/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: int, officer_name: str, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.acknowledged = True
    alert.acknowledged_by = officer_name
    db.commit()
    db.refresh(alert)
    return alert
