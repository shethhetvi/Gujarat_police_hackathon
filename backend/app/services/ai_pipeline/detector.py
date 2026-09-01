from typing import List, Dict, Any
import numpy as np

class VehicleDetector:
    """YOLOv8 vehicle detection wrapper."""
    def __init__(self, model_path: str = "yolov8n.pt", conf_threshold: float = 0.5):
        self.model_path = model_path
        self.conf_threshold = conf_threshold
        # Note: Ultralytics YOLO model loaded on runtime when needed

    def detect_vehicles(self, frame: np.ndarray) -> List[Dict[str, Any]]:
        """
        Detects cars, buses, trucks, and motorcycles in frame.
        Returns bounding boxes and confidence scores.
        """
        # Placeholder skeleton - implemented in core AI pipeline
        return []
