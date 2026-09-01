import numpy as np
from typing import List, Dict, Any
import logging

logger = logging.getLogger("sentinelgrid.detector")

class VehicleDetector:
    """
    YOLOv8 vehicle detection engine for cars, buses, trucks, and motorcycles.
    Includes automated fallback with explicit `is_simulated` labeling.
    """
    VEHICLE_CLASSES = {2: "car", 3: "motorcycle", 5: "bus", 7: "truck"}

    def __init__(self, model_path: str = "yolov8n.pt", conf_threshold: float = 0.45):
        self.model_path = model_path
        self.conf_threshold = conf_threshold
        self.model = None
        self.is_real_model = False
        self._load_model()

    def _load_model(self):
        try:
            from ultralytics import YOLO
            self.model = YOLO(self.model_path)
            self.is_real_model = True
            logger.info(f"Loaded YOLOv8 model from {self.model_path}")
        except Exception as e:
            logger.warning(f"Could not load YOLOv8 model ({e}). Using simulated fallback detector.")
            self.is_real_model = False

    def detect_vehicles(self, frame: np.ndarray, fallback_on_empty: bool = False) -> List[Dict[str, Any]]:
        """
        Detects vehicles in frame.
        Returns list of dicts: {bbox: [x1, y1, x2, y2], class_name: str, confidence: float, is_simulated: bool}
        """
        if self.is_real_model and self.model is not None and frame is not None:
            try:
                results = self.model(frame, conf=self.conf_threshold, verbose=False)
                detections = []
                for r in results:
                    boxes = r.boxes
                    for box in boxes:
                        cls_id = int(box.cls[0].item())
                        if cls_id in self.VEHICLE_CLASSES:
                            xyxy = box.xyxy[0].tolist()
                            conf = float(box.conf[0].item())
                            detections.append({
                                "bbox": [int(xyxy[0]), int(xyxy[1]), int(xyxy[2]), int(xyxy[3])],
                                "class_name": self.VEHICLE_CLASSES[cls_id],
                                "confidence": round(conf, 3),
                                "is_simulated": False
                            })
                if detections or not fallback_on_empty:
                    return detections
            except Exception as e:
                logger.error(f"Error during YOLO inference: {e}")

        # Transparent Simulated Fallback for synthetic/testing environments
        h, w = frame.shape[:2] if frame is not None else (720, 1280)
        return [
            {
                "bbox": [int(w * 0.2), int(h * 0.4), int(w * 0.6), int(h * 0.85)],
                "class_name": "car",
                "confidence": 0.94,
                "is_simulated": True
            }
        ]
