import numpy as np
from typing import List, Dict, Any
from app.services.ai_pipeline.detector import VehicleDetector
from app.services.ai_pipeline.tracker import ByteTrackTracker
from app.services.ai_pipeline.anpr_ocr import ANPROCREngine

class VideoAnalyticsPipeline:
    """Unified pipeline connecting Detection -> Tracking -> ANPR OCR -> Matching."""
    def __init__(self):
        self.detector = VehicleDetector()
        self.tracker = ByteTrackTracker()
        self.ocr = ANPROCREngine()

    def process_frame(self, frame: np.ndarray, camera_id: int) -> List[Dict[str, Any]]:
        # 1. Detect vehicles
        detections = self.detector.detect_vehicles(frame)
        # 2. Track across frames
        tracked = self.tracker.update(detections)
        # 3. ANPR OCR on each vehicle crop
        results = []
        for obj in tracked:
            # plate recognition
            results.append(obj)
        return results
