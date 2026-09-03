import cv2
import numpy as np
import os
from pathlib import Path

OUT_DIR = Path(__file__).resolve().parent.parent / "simulation" / "sample_feeds"
OUT_DIR.mkdir(parents=True, exist_ok=True)
OUT_FILE = str(OUT_DIR / "highway_traffic.mp4")

def generate_traffic_video():
    width, height = 720, 480
    fps = 25
    duration_sec = 12
    total_frames = fps * duration_sec

    # Try standard codecs
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(OUT_FILE, fourcc, fps, (width, height))

    vehicles = [
        {"x_lane": 220, "speed": 4.5, "w": 85, "h": 140, "color": (210, 215, 220), "type": "SUV", "plate": "GJ01AB1234"},
        {"x_lane": 360, "speed": 6.2, "w": 75, "h": 125, "color": (40, 50, 200), "type": "Sedan", "plate": "GJ05CD5678"},
        {"x_lane": 500, "speed": 3.8, "w": 95, "h": 190, "color": (60, 120, 70), "type": "Truck", "plate": "GJ27AK8899"},
        {"x_lane": 290, "speed": 7.5, "w": 40, "h": 70, "color": (20, 20, 25), "type": "Motorcycle", "plate": "GJ06EF9012"},
        {"x_lane": 430, "speed": 5.0, "w": 80, "h": 135, "color": (180, 180, 185), "type": "Hatchback", "plate": "GJ03GH3456"},
    ]

    for f in range(total_frames):
        # Road asphalt background
        frame = np.zeros((height, width, 3), dtype=np.uint8)
        frame[:] = (55, 60, 65)  # Asphalt gray

        # Road shoulders & grass
        frame[:, :140] = (45, 90, 45)    # Left greenery
        frame[:, 580:] = (45, 90, 45)    # Right greenery
        
        # Road curbs
        cv2.line(frame, (140, 0), (140, height), (220, 220, 220), 4)
        cv2.line(frame, (580, 0), (580, height), (220, 220, 220), 4)

        # Lane dividers (moving with highway perspective)
        lane_offset = (f * 12) % 60
        for y in range(-60 + lane_offset, height + 60, 60):
            cv2.line(frame, (285, y), (285, y + 30), (240, 240, 240), 2)
            cv2.line(frame, (435, y), (435, y + 30), (240, 240, 240), 2)

        # Draw vehicles
        for idx, v in enumerate(vehicles):
            y_pos = int((f * v["speed"] * 3 + idx * 110) % (height + 250)) - 150
            if -180 <= y_pos <= height + 50:
                vx = v["x_lane"]
                vw, vh = v["w"], v["h"]
                
                # Shadow
                cv2.rectangle(frame, (vx - 6, y_pos - 4), (vx + vw + 6, y_pos + vh + 6), (25, 28, 30), -1)
                # Body
                cv2.rectangle(frame, (vx, y_pos), (vx + vw, y_pos + vh), v["color"], -1)
                # Windshield & Roof
                cv2.rectangle(frame, (vx + 8, y_pos + int(vh * 0.25)), (vx + vw - 8, y_pos + int(vh * 0.65)), (30, 38, 48), -1)
                # Rear Window
                cv2.rectangle(frame, (vx + 10, y_pos + int(vh * 0.78)), (vx + vw - 10, y_pos + int(vh * 0.90)), (20, 25, 30), -1)
                # Taillights
                cv2.rectangle(frame, (vx + 2, y_pos + vh - 6), (vx + 16, y_pos + vh), (30, 30, 230), -1)
                cv2.rectangle(frame, (vx + vw - 16, y_pos + vh - 6), (vx + vw - 2, y_pos + vh), (30, 30, 230), -1)
                # Number Plate
                pw, ph = int(vw * 0.45), 14
                px = vx + (vw - pw) // 2
                py = y_pos + vh - 16
                cv2.rectangle(frame, (px, py), (px + pw, py + ph), (245, 245, 250), -1)
                cv2.putText(frame, v["plate"], (px + 2, py + 10), cv2.FONT_HERSHEY_SIMPLEX, 0.28, (10, 10, 15), 1)

        out.write(frame)

    out.release()
    print(f"Generated realistic traffic video sample: {OUT_FILE} ({total_frames} frames)")

if __name__ == "__main__":
    generate_traffic_video()
