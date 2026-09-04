from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.core.database import get_db
from app.models.watchlist import WatchlistEntry
from app.models.detection import DetectionEvent
from app.models.camera import Camera
from app.models.alert import Alert
from app.schemas.watchlist import WatchlistCreate, WatchlistResponse
from app.websocket.connection_manager import manager

router = APIRouter()

@router.get("/", response_model=List[WatchlistResponse])
def get_watchlist(db: Session = Depends(get_db)):
    """
    Returns law enforcement watchlist entries enriched with REAL-TIME CCTV sightings:
    - Latest sighting camera node & location
    - Monotonic PTS speed & overspeeding violation status
    - Section 65B Indian Evidence Act SHA256 integrity hash
    - Real camera snapshot crop
    - Active PCR dispatch status
    """
    entries = db.query(WatchlistEntry).order_by(WatchlistEntry.id.desc()).all()
    if not entries:
        return []

    # Bulk query latest detection events and alerts with in-memory map for ultra-fast response
    detections = (
        db.query(DetectionEvent)
        .order_by(DetectionEvent.id.desc())
        .limit(300)
        .all()
    )
    cameras = {c.id: c for c in db.query(Camera).all()}
    alerts = (
        db.query(Alert)
        .order_by(Alert.id.desc())
        .limit(150)
        .all()
    )

    latest_det_by_plate = {}
    sightings_by_plate = {}
    for d in detections:
        p = (d.plate_number or "").upper()
        if not p:
            continue
        sightings_by_plate[p] = sightings_by_plate.get(p, 0) + 1
        if p not in latest_det_by_plate:
            latest_det_by_plate[p] = d

    latest_alert_by_plate = {}
    for a in alerts:
        p = (a.plate_number or "").upper()
        if p and p not in latest_alert_by_plate:
            latest_alert_by_plate[p] = a

    results = []
    for entry in entries:
        resp = WatchlistResponse.model_validate(entry)
        clean_p = entry.plate_number.upper()
        det = latest_det_by_plate.get(clean_p)
        resp.total_sightings = sightings_by_plate.get(clean_p, 0)

        if det:
            resp.last_seen_camera_id = det.camera_id
            resp.last_seen_time = det.timestamp
            resp.last_seen_speed_kmh = det.speed_kmh
            resp.last_seen_snapshot_url = det.snapshot_url
            resp.last_seen_sha256 = det.sha256_hash
            resp.is_overspeeding = bool(det.speed_kmh and det.speed_kmh > 80.0)

            cam = cameras.get(det.camera_id)
            if cam:
                resp.last_seen_camera_name = cam.name
                resp.last_seen_location = cam.location_name

        alt = latest_alert_by_plate.get(clean_p)
        if alt:
            resp.dispatch_status = alt.dispatch_status or "PENDING"
            resp.dispatched_unit = alt.dispatched_unit
            resp.latest_alert_id = alt.id

        results.append(resp)

    return results

@router.post("/{entry_id}/dispatch")
async def dispatch_pcr_for_target(
    entry_id: int,
    unit_name: Optional[str] = Body("PCR Cheetah-04 (Intercity Intercept)", embed=True),
    db: Session = Depends(get_db)
):
    """
    Direct tactical PCR unit dispatch for a live-sighted target.
    """
    entry = db.query(WatchlistEntry).filter(WatchlistEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Watchlist entry not found")

    alert = (
        db.query(Alert)
        .filter(Alert.plate_number == entry.plate_number)
        .order_by(Alert.id.desc())
        .first()
    )
    if alert:
        alert.dispatched_unit = unit_name
        alert.dispatch_status = "DISPATCHED"
        db.commit()
        db.refresh(alert)

    # Broadcast real-time tactical dispatch alert
    await manager.broadcast({
        "type": "PCR_DISPATCH_CONFIRMED",
        "plate_number": entry.plate_number,
        "dispatched_unit": unit_name,
        "vehicle": entry.vehicle_make_model,
        "priority": entry.priority,
        "timestamp": datetime.utcnow().isoformat()
    })

    return {
        "status": "success",
        "message": f"Tactical intercept unit {unit_name} successfully dispatched for target {entry.plate_number}.",
        "target": entry.plate_number,
        "dispatched_unit": unit_name,
        "dispatch_status": "DISPATCHED"
    }

@router.post("/", response_model=WatchlistResponse)
def add_to_watchlist(entry_in: WatchlistCreate, db: Session = Depends(get_db)):
    clean_plate = entry_in.plate_number.replace(" ", "").replace("-", "").upper()
    existing = db.query(WatchlistEntry).filter(WatchlistEntry.plate_number == clean_plate).first()
    if existing:
        raise HTTPException(status_code=400, detail="Plate already exists in watchlist")
    
    data = entry_in.model_dump()
    data["plate_number"] = clean_plate
    entry = WatchlistEntry(**data)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

@router.delete("/{entry_id}")
def delete_watchlist_entry(entry_id: int, db: Session = Depends(get_db)):
    entry = db.query(WatchlistEntry).filter(WatchlistEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Watchlist entry not found")
    db.delete(entry)
    db.commit()
    return {"status": "success", "message": "Watchlist entry removed"}
