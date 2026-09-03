import cv2
import numpy as np
from typing import List, Dict, Any, Tuple, Optional
import logging

logger = logging.getLogger("sentinelgrid.detector")

class VehicleDetector:
    """
    Real YOLOv8 Vehicle & Plate Detector (ultralytics) with:
      - Extended vehicle classes: car, suv, bus, truck, motorcycle, auto-rickshaw.
      - Vehicle Attribute Extraction: Color recognition & Body type classification.
      - Dedicated License Plate Region of Interest (ROI) localization.
      - Seamless fallback for environments without preloaded neural weights.
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
            logger.warning(f"Could not load YOLOv8 model ({e}). Using algorithmic fallback detector.")
            self.is_real_model = False

    def extract_vehicle_color(self, vehicle_crop: np.ndarray) -> str:
        """
        Extracts dominant vehicle body color from central hull in HSV space.
        Identifies: White, Black, Silver, Red, Blue, Grey, Yellow, Green.
        """
        if vehicle_crop is None or vehicle_crop.size == 0:
            return "White"

        try:
            h, w = vehicle_crop.shape[:2]
            # Sample central 50% region to exclude asphalt, tires, sky, and windshield
            sample_roi = vehicle_crop[int(h * 0.25):int(h * 0.75), int(w * 0.2):int(w * 0.8)]
            if sample_roi.size == 0:
                sample_roi = vehicle_crop

            hsv = cv2.cvtColor(sample_roi, cv2.COLOR_BGR2HSV)
            mean_h, mean_s, mean_v = np.mean(hsv, axis=(0, 1))

            # Color heuristic classifier based on HSV distribution
            if mean_v < 48:
                return "Black"
            elif mean_s < 38 and mean_v > 185:
                return "White"
            elif mean_s < 45 and 48 <= mean_v <= 185:
                return "Silver" if mean_v > 120 else "Grey"
            else:
                # Chromatic colors by Hue (0 - 180 in OpenCV)
                if (0 <= mean_h <= 10) or (165 <= mean_h <= 180):
                    return "Red"
                elif 18 <= mean_h <= 34:
                    return "Yellow"
                elif 35 <= mean_h <= 85:
                    return "Green"
                elif 90 <= mean_h <= 135:
                    return "Blue"
                else:
                    return "Silver"
        except Exception:
            return "White"

    def classify_body_type(self, base_class: str, bbox: List[int], frame_shape: Tuple[int, int]) -> str:
        """
        Refines vehicle class into specialized body types:
        SUV, Sedan, Hatchback, Truck, Bus, Motorcycle, Auto-Rickshaw.
        """
        x1, y1, x2, y2 = bbox
        width = max(1, x2 - x1)
        height = max(1, y2 - y1)
        aspect_ratio = width / float(height)

        if base_class == "motorcycle":
            # Auto-rickshaw detection heuristic in Indian traffic (wider aspect ratio, roof canvas)
            if aspect_ratio > 0.85:
                return "Auto-Rickshaw"
            return "Motorcycle"
        elif base_class == "bus":
            return "Bus"
        elif base_class == "truck":
            return "Truck"
        else:  # base_class == "car"
            # Distinguish SUV vs Sedan vs Hatchback by bounding box proportions
            if aspect_ratio < 1.15:
                return "SUV"
            elif aspect_ratio > 1.45:
                return "Sedan"
            else:
                return "Hatchback"

    def locate_license_plate_roi(self, vehicle_crop: np.ndarray) -> Tuple[Optional[np.ndarray], List[int]]:
        """
        Dedicated License Plate Region of Interest (ROI) bounding box localization.
        Searches lower bumper region using morphological edge detection and contour aspect ratio.
        Returns: (plate_crop_image, [roi_x1, roi_y1, roi_x2, roi_y2])
        """
        if vehicle_crop is None or vehicle_crop.size == 0:
            return None, [0, 0, 0, 0]

        try:
            vh, vw = vehicle_crop.shape[:2]
            # Search bottom 45% of vehicle where registration plates are bumper-mounted
            bumper_y1 = int(vh * 0.55)
            bumper_crop = vehicle_crop[bumper_y1:vh, 0:vw]

            gray = cv2.cvtColor(bumper_crop, cv2.COLOR_BGR2GRAY)
            # Morphological blackhat to highlight dark plate text on bright HSRP background
            kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (13, 5))
            blackhat = cv2.morphologyEx(gray, cv2.MORPH_BLACKHAT, kernel)

            # Sobel horizontal gradient
            grad_x = cv2.Sobel(blackhat, ddepth=cv2.CV_32F, dx=1, dy=0, ksize=-1)
            grad_x = np.absolute(grad_x)
            min_val, max_val = np.min(grad_x), np.max(grad_x)
            if max_val > min_val:
                grad_x = 255 * ((grad_x - min_val) / (max_val - min_val))
            grad_x = grad_x.astype("uint8")

            # Blur and threshold
            grad_x = cv2.GaussianBlur(grad_x, (5, 5), 0)
            _, thresh = cv2.threshold(grad_x, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)

            contours, _ = cv2.findContours(thresh.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            best_roi = None
            best_score = 0.0

            for c in contours:
                cx, cy, cw, ch = cv2.boundingRect(c)
                if ch == 0:
                    continue
                ar = cw / float(ch)
                # Standard Indian HSRP aspect ratio is roughly 2.0 to 5.5
                if 2.0 <= ar <= 5.5 and cw > (vw * 0.15) and ch > 14:
                    score = cw * ch
                    if score > best_score:
                        best_score = score
                        best_roi = (cx, bumper_y1 + cy, cx + cw, bumper_y1 + cy + ch)

            if best_roi is not None:
                rx1, ry1, rx2, ry2 = best_roi
                plate_crop = vehicle_crop[max(0, ry1):min(vh, ry2), max(0, rx1):min(vw, rx2)]
                return plate_crop, [rx1, ry1, rx2, ry2]

            # Standardized fallback bumper ROI
            fallback_x1 = int(vw * 0.25)
            fallback_x2 = int(vw * 0.75)
            fallback_y1 = int(vh * 0.65)
            fallback_y2 = int(vh * 0.95)
            plate_crop = vehicle_crop[fallback_y1:fallback_y2, fallback_x1:fallback_x2]
            return plate_crop, [fallback_x1, fallback_y1, fallback_x2, fallback_y2]

        except Exception as e:
            logger.debug(f"ROI extraction error: {e}")
            return None, [0, 0, 0, 0]

    def detect_vehicles(self, frame: np.ndarray, fallback_on_empty: bool = False) -> List[Dict[str, Any]]:
        """
        Detects vehicles in frame with color and body type attributes.
        Returns list of dicts:
          {
             bbox: [x1, y1, x2, y2],
             class_name: str,
             body_type: str,
             color: str,
             confidence: float,
             is_simulated: bool
          }
        """
        if self.is_real_model and self.model is not None and frame is not None:
            try:
                results = self.model(frame, conf=self.conf_threshold, verbose=False)
                detections = []
                h, w = frame.shape[:2]

                for r in results:
                    boxes = r.boxes
                    for box in boxes:
                        cls_id = int(box.cls[0].item())
                        if cls_id in self.VEHICLE_CLASSES:
                            xyxy = box.xyxy[0].tolist()
                            conf = float(box.conf[0].item())
                            bbox = [int(xyxy[0]), int(xyxy[1]), int(xyxy[2]), int(xyxy[3])]
                            base_class = self.VEHICLE_CLASSES[cls_id]

                            # Crop vehicle for attribute analysis
                            vx1, vy1, vx2, vy2 = max(0, bbox[0]), max(0, bbox[1]), min(w, bbox[2]), min(h, bbox[3])
                            vcrop = frame[vy1:vy2, vx1:vx2]

                            color = self.extract_vehicle_color(vcrop)
                            body_type = self.classify_body_type(base_class, bbox, (h, w))

                            detections.append({
                                "bbox": bbox,
                                "class_name": base_class,
                                "body_type": body_type,
                                "color": color,
                                "confidence": round(conf, 3),
                                "is_simulated": False
                            })

                if detections or not fallback_on_empty:
                    return detections
            except Exception as e:
                logger.error(f"Error during YOLO inference: {e}")

        # Calibrated Simulated Fallback for synthetic/testing environments
        if fallback_on_empty and frame is not None:
            h, w = frame.shape[:2]
            bbox = [int(w * 0.22), int(h * 0.38), int(w * 0.65), int(h * 0.84)]
            
            vcrop = frame[bbox[1]:bbox[3], bbox[0]:bbox[2]] if frame is not None else None
            color = self.extract_vehicle_color(vcrop) if vcrop is not None else "White"

            return [
                {
                    "bbox": bbox,
                    "class_name": "car",
                    "body_type": "SUV",
                    "color": color,
                    "confidence": 0.952,
                    "is_simulated": True
                }
            ]

        return []
