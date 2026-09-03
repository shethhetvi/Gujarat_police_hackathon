from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.alert import Alert
from app.schemas.alert import AlertResponse
from app.websocket.connection_manager import manager

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

@router.post("/{alert_id}/dispatch")
async def dispatch_pcr_unit(
    alert_id: int,
    unit_name: str = Body(..., embed=True),
    officer_in_charge: Optional[str] = Body(None, embed=True),
    tactical_instructions: Optional[str] = Body(None, embed=True),
    db: Session = Depends(get_db)
):
    """
    Tactical Command Dispatcher:
    One-click dispatch of nearest PCR van or Cheetah QRT unit to intercept suspect vehicle.
    """
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    alert.dispatched_unit = unit_name
    alert.dispatch_status = "DISPATCHED"
    db.commit()
    db.refresh(alert)

    # Broadcast dispatch event to command center screens
    await manager.broadcast({
        "type": "PCR_DISPATCH_CONFIRMED",
        "alert_id": alert.id,
        "plate_number": alert.plate_number,
        "dispatched_unit": unit_name,
        "officer_in_charge": officer_in_charge,
        "tactical_instructions": tactical_instructions or "Execute rolling barricade & box-in maneuver at target coordinates.",
        "location_name": alert.location_name
    })

    return {
        "status": "success",
        "message": f"Tactical interception unit {unit_name} successfully dispatched for suspect {alert.plate_number}",
        "alert": alert
    }
