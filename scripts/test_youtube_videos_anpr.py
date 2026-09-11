"""
========================================================================================
SentinelGrid: Multi-Type YouTube CCTV Video ANPR Benchmark
========================================================================================
Tests our from-scratch computer vision pipeline across 3 distinct YouTube video feeds:
  1. Low-Light Night Highway Traffic (simulation/youtube_test_videos/night_traffic.mp4)
  2. Indian Street Traffic ANPR (simulation/youtube_test_videos/indian_anpr.mp4)
  3. Day vs. Night Surveillance CCTV (simulation/youtube_test_videos/day_night_cctv.mp4)
========================================================================================
"""

import os
import cv2
import numpy as np
import time
from pathlib import Path
from typing import List, Dict, Any

import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from scripts.low_light_anpr_from_scratch import (
    analyze_lighting_intensity,
    enhance_low_light_intensity,
    extract_vehicle_and_plate_roi,
    apply_plate_enhancement_filters,
    read_plate_with_ocr
)

from ultralytics import YOLO

YOUTUBE_DIR = Path("simulation/youtube_test_videos")
RESULTS_DIR = Path("simulation/youtube_anpr_results")
RESULTS_DIR.mkdir(parents=True, exist_ok=True)

# Load YOLOv8 vehicle detector
yolo_model = YOLO("yolov8n.pt")
VEHICLE_CLASSES = {2: "car", 3: "motorcycle", 5: "bus", 7: "truck"}

TEST_VIDEOS = [
    {
        "type": "Low-Light Night Traffic",
        "file": YOUTUBE_DIR / "night_traffic.mp4",
        "sample_interval": 20,
        "max_frames": 5
    },
    {
        "type": "Indian Urban Traffic & ANPR",
        "file": YOUTUBE_DIR / "indian_anpr.mp4",
        "sample_interval": 30,
        "max_frames": 5
    },
    {
        "type": "Day/Night Junction CCTV",
        "file": YOUTUBE_DIR / "day_night_cctv.mp4",
        "sample_interval": 35,
        "max_frames": 5
    }
]

def process_video_feed(video_info: Dict[str, Any]) -> Dict[str, Any]:
    video_path = video_info["file"]
    video_type = video_info["type"]
    sample_interval = video_info["sample_interval"]
    max_frames_to_test = video_info["max_frames"]
    
    print("\n" + "=" * 80)
    print(f"PROCESSING YOUTUBE VIDEO: {video_type}")
    print(f"Path: {video_path}")
    print("=" * 80)
    
    if not video_path.exists():
        print(f"Error: Video not found at {video_path}")
        return {"error": "File not found"}
        
    cap = cv2.VideoCapture(str(video_path))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS) or 25
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    
    print(f"Feed Specs: {width}x{height} @ {fps:.1f} FPS, Total Frames: {total_frames}")
    
    frame_idx = 0
    sampled_count = 0
    
    video_results = {
        "type": video_type,
        "total_vehicles_detected": 0,
        "low_light_frames_count": 0,
        "plates_recognized": [],
        "mean_luminance_avg": 0.0,
        "snapshots_saved": []
    }
    
    luminance_records = []
    
    while cap.isOpened() and sampled_count < max_frames_to_test:
        ret, frame = cap.read()
        if not ret:
            break
            
        frame_idx += 1
        if frame_idx % sample_interval != 0:
            continue
            
        sampled_count += 1
        print(f"\n--- [Frame {frame_idx} / {total_frames}] ---")
        
        # 1. Optical condition & luminance analysis
        mean_lum, std_lum, condition = analyze_lighting_intensity(frame)
        luminance_records.append(mean_lum)
        
        if condition == "LOW_LIGHT":
            video_results["low_light_frames_count"] += 1
            print(f"  -> Low Light Detected (Lum: {mean_lum:.1f}). Applying Dynamic Gamma LUT + LAB CLAHE...")
            inference_frame = enhance_low_light_intensity(frame, target_midpoint=0.55)
        else:
            print(f"  -> Normal / Day Lighting (Lum: {mean_lum:.1f}).")
            inference_frame = frame.copy()
            
        # 2. YOLOv8 Vehicle Detection
        yolo_res = yolo_model(inference_frame, conf=0.30, verbose=False)
        boxes = yolo_res[0].boxes
        
        annotated_frame = inference_frame.copy()
        frame_vehicles = 0
        
        for b in boxes:
            cls_id = int(b.cls[0].item())
            if cls_id in VEHICLE_CLASSES:
                frame_vehicles += 1
                video_results["total_vehicles_detected"] += 1
                
                conf = float(b.conf[0].item())
                cls_name = VEHICLE_CLASSES[cls_id]
                x1, y1, x2, y2 = [int(v) for v in b.xyxy[0].tolist()]
                
                # Minimum vehicle size filter
                if (x2 - x1) < 40 or (y2 - y1) < 35:
                    continue
                    
                # 3. Vehicle & Plate ROI Extraction
                vehicle_crop, plate_crop, plate_box = extract_vehicle_and_plate_roi(
                    inference_frame, vehicle_bbox=[x1, y1, x2, y2]
                )
                
                # 4. Multi-stage filtering on plate ROI
                filtered_candidates = apply_plate_enhancement_filters(plate_crop)
                
                # 5. EasyOCR reading
                plate_text, ocr_conf, winning_filter = read_plate_with_ocr(filtered_candidates)
                
                # Draw Tactical Annotations
                # Vehicle box
                cv2.rectangle(annotated_frame, (x1, y1), (x2, y2), (0, 215, 255), 2)
                
                # Plate box inside vehicle
                px1, py1, px2, py2 = plate_box
                abs_px1, abs_py1 = x1 + px1, y1 + py1
                abs_px2, abs_py2 = x1 + px2, y1 + py2
                cv2.rectangle(annotated_frame, (abs_px1, abs_py1), (abs_px2, abs_py2), (0, 0, 255), 2)
                
                tag = f"{cls_name.upper()} {conf:.2f}"
                if plate_text != "UNKNOWN":
                    tag += f" | PLATE: {plate_text} ({ocr_conf:.2f})"
                    video_results["plates_recognized"].append({
                        "plate": plate_text,
                        "conf": ocr_conf,
                        "filter": winning_filter,
                        "frame": frame_idx
                    })
                    
                cv2.rectangle(annotated_frame, (x1, max(0, y1 - 25)), (x1 + 320, y1), (15, 23, 42), -1)
                cv2.putText(annotated_frame, tag, (x1 + 6, max(18, y1 - 6)),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.55, (56, 189, 248), 2)
                            
        # Save side-by-side comparison: [Raw Frame vs. Enhanced Annotated Frame]
        safe_type_name = video_type.replace(" ", "_").replace("/", "_").lower()
        side_by_side = np.hstack([
            cv2.resize(frame, (640, 360)),
            cv2.resize(annotated_frame, (640, 360))
        ])
        
        # Add titles to comparison
        cv2.putText(side_by_side, f"ORIGINAL ({condition} Lum:{mean_lum:.0f})", (20, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
        cv2.putText(side_by_side, "SENTINELGRID AI ENHANCED + ROI + ANPR", (660, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
                    
        out_filename = f"{safe_type_name}_frame_{frame_idx}.jpg"
        out_path = RESULTS_DIR / out_filename
        cv2.imwrite(str(out_path), side_by_side)
        video_results["snapshots_saved"].append(str(out_path))
        print(f"  -> Saved Side-by-Side Comparison to: {out_path}")
        
    cap.release()
    if luminance_records:
        video_results["mean_luminance_avg"] = float(np.mean(luminance_records))
        
    return video_results


def main():
    print("=" * 80)
    print("STARTING YOUTUBE VIDEO MULTI-ENVIRONMENT ANPR BENCHMARK")
    print("=" * 80)
    
    all_benchmarks = []
    
    for v_info in TEST_VIDEOS:
        res = process_video_feed(v_info)
        all_benchmarks.append(res)
        
    print("\n" + "=" * 85)
    print("YOUTUBE ANPR MULTI-FEED BENCHMARK SUMMARY")
    print("=" * 85)
    print(f"{'Video Category':<30} | {'Avg Lum':<9} | {'Condition':<12} | {'Vehicles':<9} | {'Plates/Hits':<15}")
    print("-" * 85)
    
    for b in all_benchmarks:
        v_type = b.get("type", "Unknown")
        avg_lum = f"{b.get('mean_luminance_avg', 0.0):.1f}"
        cond = "LOW_LIGHT" if b.get("low_light_frames_count", 0) > 0 else "NORMAL/DAY"
        veh_count = str(b.get("total_vehicles_detected", 0))
        hits = len(b.get("plates_recognized", []))
        hit_str = f"{hits} target(s)"
        print(f"{v_type:<30} | {avg_lum:<9} | {cond:<12} | {veh_count:<9} | {hit_str:<15}")
        
    print("=" * 85)
    print(f"Visual artifacts saved to: {RESULTS_DIR.absolute()}/")


if __name__ == "__main__":
    main()
