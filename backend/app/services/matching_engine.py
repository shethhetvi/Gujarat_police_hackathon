from sqlalchemy.orm import Session
from typing import Optional, Tuple
from app.models.watchlist import WatchlistEntry

class MatchingEngine:
    def __init__(self, db: Session):
        self.db = db

    def clean_plate(self, plate: str) -> str:
        """Normalize plate format by removing spaces, hyphens, and non-alphanumeric chars."""
        if not plate:
            return ""
        return "".join(c for c in plate if c.isalnum()).upper()

    def check_match(self, raw_plate: str) -> Tuple[bool, Optional[WatchlistEntry]]:
        """Screen recognized license plate against active database watchlist."""
        cleaned = self.clean_plate(raw_plate)
        if not cleaned:
            return False, None

        entries = self.db.query(WatchlistEntry).filter(WatchlistEntry.is_active == True).all()
        for entry in entries:
            target_cleaned = self.clean_plate(entry.plate_number)
            if cleaned == target_cleaned:
                return True, entry
        return False, None
