from sqlalchemy.orm import Session
from typing import Optional, Tuple
from app.models.watchlist import WatchlistEntry

class MatchingEngine:
    """
    High-Performance Watchlist Screening Engine with OCR Confusion & Fuzzy Matching:
    - Exact alphanumeric comparison
    - Positional phonetic character confusion (0 <-> O, 1 <-> I, 8 <-> B, 5 <-> S, 2 <-> Z)
    - Levenshtein-1 fuzzy match for noisy CCTV surveillance crops
    """
    CHAR_EQUIVALENTS = {
        '0': {'0', 'O', 'Q', 'D'},
        'O': {'0', 'O', 'Q', 'D'},
        '1': {'1', 'I', 'L', 'T'},
        'I': {'1', 'I', 'L', 'T'},
        '8': {'8', 'B'},
        'B': {'8', 'B'},
        '5': {'5', 'S'},
        'S': {'5', 'S'},
        '2': {'2', 'Z'},
        'Z': {'2', 'Z'},
        '6': {'6', 'G'},
        'G': {'6', 'G'}
    }

    def __init__(self, db: Session):
        self.db = db

    def clean_plate(self, plate: str) -> str:
        """Normalize plate format by removing spaces, hyphens, and non-alphanumeric chars."""
        if not plate:
            return ""
        return "".join(c for c in plate if c.isalnum()).upper()

    def _is_confusion_match(self, s1: str, s2: str) -> bool:
        """Checks if two strings of equal length match accounting for known OCR confusion pairs."""
        if len(s1) != len(s2):
            return False
        diff_count = 0
        for c1, c2 in zip(s1, s2):
            if c1 == c2:
                continue
            # Check if acceptable confusion pair
            equiv = self.CHAR_EQUIVALENTS.get(c1, {c1})
            if c2 in equiv:
                diff_count += 0.5
            else:
                diff_count += 1.0
            if diff_count > 1.0:
                return False
        return True

    def check_match(self, raw_plate: str) -> Tuple[bool, Optional[WatchlistEntry]]:
        """
        Screen recognized license plate against active database watchlist.
        Returns: (is_matched, watchlist_entry)
        """
        cleaned = self.clean_plate(raw_plate)
        if not cleaned or len(cleaned) < 6:
            return False, None

        entries = self.db.query(WatchlistEntry).filter(WatchlistEntry.is_active == True).all()
        
        # 1. Exact Match Check (Highest Priority)
        for entry in entries:
            target_cleaned = self.clean_plate(entry.plate_number)
            if cleaned == target_cleaned:
                return True, entry

        # 2. Fuzzy / OCR Confusion Matrix Match
        for entry in entries:
            target_cleaned = self.clean_plate(entry.plate_number)
            if self._is_confusion_match(cleaned, target_cleaned):
                return True, entry

        return False, None
