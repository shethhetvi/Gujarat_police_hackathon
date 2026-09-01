from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.watchlist import WatchlistEntry
from app.schemas.watchlist import WatchlistCreate, WatchlistResponse

router = APIRouter()

@router.get("/", response_model=List[WatchlistResponse])
def get_watchlist(db: Session = Depends(get_db)):
    return db.query(WatchlistEntry).all()

@router.post("/", response_model=WatchlistResponse)
def add_to_watchlist(entry_in: WatchlistCreate, db: Session = Depends(get_db)):
    existing = db.query(WatchlistEntry).filter(WatchlistEntry.plate_number == entry_in.plate_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Plate already exists in watchlist")
    entry = WatchlistEntry(**entry_in.model_dump())
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
