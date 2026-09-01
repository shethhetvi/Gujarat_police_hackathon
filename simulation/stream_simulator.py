"""
Multi-camera video feed simulator for the Gujarat Police CCTV Hackathon.
Simulates concurrent RTSP/video feeds feeding frames into the AI Analytics pipeline.
"""
import time
import requests
import json
from pathlib import Path

BACKEND_API = "http://localhost:8000/api/v1"

def seed_cameras():
    mock_file = Path(__file__).parent / "mock_data" / "sample_cameras.json"
    if mock_file.exists():
        with open(mock_file, "r") as f:
            cameras = json.load(f)
            for cam in cameras:
                try:
                    res = requests.post(f"{BACKEND_API}/cameras/", json=cam)
                    print(f"Registered camera: {cam['name']} -> Status {res.status_code}")
                except Exception as e:
                    print(f"Error seeding camera {cam['name']}: {e}")

def seed_watchlist():
    mock_file = Path(__file__).parent / "mock_data" / "sample_watchlist.json"
    if mock_file.exists():
        with open(mock_file, "r") as f:
            entries = json.load(f)
            for item in entries:
                try:
                    res = requests.post(f"{BACKEND_API}/watchlist/", json=item)
                    print(f"Added watchlist target: {item['plate_number']} -> Status {res.status_code}")
                except Exception as e:
                    print(f"Error adding watchlist item {item['plate_number']}: {e}")

if __name__ == "__main__":
    print("Initializing SentinelGrid simulation environment...")
    seed_cameras()
    seed_watchlist()
    print("Simulation setup complete.")
