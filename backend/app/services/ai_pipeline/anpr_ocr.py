import re
import numpy as np
from typing import Optional, Tuple
import logging

logger = logging.getLogger("sentinelgrid.anpr")

class ANPROCREngine:
    """
    Automatic Number Plate Recognition & Optical Character Recognition Engine.
    Specialized for Indian vehicle registration formats (e.g., GJ01AB1234).
    """
    # Regex for standard Indian license plate formats (e.g., GJ01AB1234, DL3CAB1234)
    INDIAN_PLATE_REGEX = re.compile(r'^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}$')

    def __init__(self, languages: list = None):
        self.languages = languages or ['en']
        self.reader = None
        self.is_real_ocr = False
        self._init_ocr()

    def _init_ocr(self):
        try:
            # pyrefly: ignore [missing-import]
            import easyocr
            self.reader = easyocr.Reader(self.languages, gpu=False)
            self.is_real_ocr = True
            logger.info("EasyOCR engine initialized successfully.")
        except Exception as e:
            logger.warning(f"EasyOCR not available ({e}). Fallback simulated ANPR active.")
            self.is_real_ocr = False

    def normalize_plate_text(self, text: str) -> str:
        """Strip whitespaces, special chars, and standardize plate string."""
        if not text:
            return ""
        # Common OCR corrections (e.g., O -> 0, I -> 1 in digit slots)
        cleaned = re.sub(r'[^A-Za-z0-9]', '', text).upper()
        return cleaned

    def extract_plate(self, vehicle_crop: np.ndarray, allow_fallback: bool = False) -> Tuple[Optional[str], float, bool]:
        """
        Extracts license plate from vehicle crop.
        Returns: (plate_text, confidence_score, is_simulated)
        """
        if self.is_real_ocr and self.reader is not None and vehicle_crop is not None and vehicle_crop.size > 0:
            try:
                results = self.reader.readtext(vehicle_crop)
                for bbox, text, conf in results:
                    cleaned = self.normalize_plate_text(text)
                    if len(cleaned) >= 6:  # Valid plate minimum length
                        return cleaned, round(conf, 3), False
            except Exception as e:
                logger.error(f"Error extracting plate via OCR: {e}")

        if allow_fallback:
            return "GJ01AB1234", 0.94, True

        # No plate detected
        return None, 0.0, False
