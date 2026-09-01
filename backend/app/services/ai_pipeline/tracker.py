import numpy as np
from typing import List, Dict, Any

class ByteTrackTracker:
    """
    Intra-camera persistent vehicle tracking.
    Assigns stable tracking IDs across video frames to prevent duplicate alerts.
    """
    def __init__(self, iou_threshold: float = 0.3, max_lost_frames: int = 30):
        self.iou_threshold = iou_threshold
        self.max_lost_frames = max_lost_frames
        self.next_track_id = 1
        self.tracks = {}  # track_id: {"bbox": [...], "lost": 0, "class_name": str}

    def _compute_iou(self, boxA, boxB):
        xA = max(boxA[0], boxB[0])
        yA = max(boxA[1], boxB[1])
        xB = min(boxA[2], boxB[2])
        yB = min(boxA[3], boxB[3])

        interArea = max(0, xB - xA) * max(0, yB - yA)
        boxAArea = (boxA[2] - boxA[0]) * (boxA[3] - boxA[1])
        boxBArea = (boxB[2] - boxB[0]) * (boxB[3] - boxB[1])

        iou = interArea / float(boxAArea + boxBArea - interArea + 1e-6)
        return iou

    def update(self, detections: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Matches detections to existing tracks or creates new tracking IDs.
        """
        matched_tracks = set()
        matched_detections = set()

        # Update existing tracks with highest IoU detections
        for track_id, track_data in list(self.tracks.items()):
            best_iou = 0
            best_det_idx = -1
            for idx, det in enumerate(detections):
                if idx in matched_detections:
                    continue
                iou = self._compute_iou(track_data["bbox"], det["bbox"])
                if iou > best_iou:
                    best_iou = iou
                    best_det_idx = idx

            if best_iou >= self.iou_threshold and best_det_idx != -1:
                det = detections[best_det_idx]
                self.tracks[track_id] = {
                    "bbox": det["bbox"],
                    "lost": 0,
                    "class_name": det.get("class_name", "vehicle")
                }
                det["tracking_id"] = track_id
                matched_tracks.add(track_id)
                matched_detections.add(best_det_idx)
            else:
                track_data["lost"] += 1
                if track_data["lost"] > self.max_lost_frames:
                    del self.tracks[track_id]

        # Create new tracks for unmatched detections
        for idx, det in enumerate(detections):
            if idx not in matched_detections:
                new_id = self.next_track_id
                self.next_track_id += 1
                self.tracks[new_id] = {
                    "bbox": det["bbox"],
                    "lost": 0,
                    "class_name": det.get("class_name", "vehicle")
                }
                det["tracking_id"] = new_id

        return detections
