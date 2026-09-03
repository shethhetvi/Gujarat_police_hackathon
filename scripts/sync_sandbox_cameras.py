"""
SentinelGrid - Gujarat Police Live Sandbox Ingestion & Sync Tool
Fetches live camera feeds from official hackathon portal /api/ingest 
and automatically onboards them into SentinelGrid database.
Uses standard Python library (no external 'requests' package needed).
"""

import os
import sys
import json
import urllib.request
import urllib.error
import ssl
from pathlib import Path

# Add backend to python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

import urllib.parse
from app.core.database import SessionLocal, engine, Base
from app.models.camera import Camera
from app.core.config import settings

SANDBOX_HOST = settings.SENTINEL_GRID_IP
CDN_HOST = settings.SENTINEL_GRID_CDN_URL
CATALOGUE_API = f"{CDN_HOST}/cameras.json"

def sync_cameras(cookie_or_token=None, local_json_file=None):
    """
    Onboards cameras from the Sentinel Sandbox into SentinelGrid.
    Adheres to Sentinel Camera Grid Integrator Guide:
    - Catalogue: https://cctv.corp8.cloud/cameras.json
    - Authenticated RTSP over TCP: rtsp://email:password@103.250.160.189:8554/stream/<id>
    """
    cameras_data = []

    # Option A: Read from downloaded local JSON file
    if local_json_file:
        file_path = Path(local_json_file)
        if not file_path.exists():
            print(f"[ERROR] File '{local_json_file}' not found.")
            print(f"Please save the JSON file from {CATALOGUE_API} or /api/ingest in this directory.")
            return
        print(f"[1/3] Loading camera catalogue from file: {local_json_file}...")
        with open(file_path, "r") as f:
            cameras_data = json.load(f)

    # Option B: Fetch directly from live API with session cookie
    else:
        print(f"[1/3] Fetching live camera catalogue from {CATALOGUE_API}...")
        req = urllib.request.Request(CATALOGUE_API)
        req.add_header("User-Agent", "SentinelGrid/1.0")

        if cookie_or_token:
            if "=" in cookie_or_token:
                req.add_header("Cookie", cookie_or_token)
            else:
                req.add_header("Authorization", f"Bearer {cookie_or_token}")

        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE

        try:
            with urllib.request.urlopen(req, context=ctx, timeout=12) as response:
                content = response.read().decode("utf-8")
                cameras_data = json.loads(content)
        except urllib.error.HTTPError as e:
            if e.code in [301, 302, 401, 403]:
                print(f"[AUTH REQUIRED] The sandbox endpoint returned HTTP {e.code} (Login required).")
                print("Tip: Log in to https://live.sentinelgujarat.in, open https://live.sentinelgujarat.in/api/ingest in your browser, save the JSON as 'sandbox_cameras.json', and run:")
                print("   python3 scripts/sync_sandbox_cameras.py --file sandbox_cameras.json")
            else:
                print(f"[HTTP ERROR] Failed to fetch catalogue: HTTP {e.code}")
            return
        except Exception as e:
            print(f"Network error connecting to sandbox: {e}")
            return

    if not isinstance(cameras_data, list):
        if isinstance(cameras_data, dict) and "cameras" in cameras_data:
            cameras_data = cameras_data["cameras"]
        elif isinstance(cameras_data, dict) and "data" in cameras_data:
            cameras_data = cameras_data["data"]
        else:
            print(f"Unexpected catalogue format. Expected a list of cameras.")
            return

    print(f"[2/3] Parsing {len(cameras_data)} live camera streams...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        onboarded = 0
        updated = 0
        for item in cameras_data:
            cam_id_raw = item.get("id") or item.get("camera_id") or item.get("stream_id")
            if isinstance(cam_id_raw, int) or (isinstance(cam_id_raw, str) and str(cam_id_raw).isdigit()):
                cam_code = f"cam{int(cam_id_raw):02d}"
            else:
                cam_code = str(cam_id_raw)

            name = item.get("name") or item.get("location") or f"Gujarat Police Camera {cam_code}"
            location_name = item.get("location_name") or item.get("location") or item.get("name") or "Gujarat Police Network"
            lat = item.get("latitude") or item.get("lat") or 23.0225
            lng = item.get("longitude") or item.get("lng") or 72.5714
            
            # Form authenticated RTSP stream URL per Sentinel Integrator Reference
            email_enc = urllib.parse.quote(settings.SENTINEL_GRID_EMAIL, safe="")
            pwd = settings.SENTINEL_GRID_PASSWORD
            if pwd:
                rtsp_url = item.get("rtsp_url") or f"rtsp://{email_enc}:{pwd}@{settings.SENTINEL_GRID_IP}:{settings.SENTINEL_GRID_RTSP_PORT}/stream/{cam_code}"
            else:
                rtsp_url = item.get("rtsp_url") or f"rtsp://{settings.SENTINEL_GRID_IP}:{settings.SENTINEL_GRID_RTSP_PORT}/stream/{cam_code}"

            vendor = item.get("vendor") or item.get("codec") or "Sentinel Sandbox Feed"
            is_live = item.get("live", item.get("is_active", True))

            # Check if exists in db
            existing = db.query(Camera).filter((Camera.name == name) | (Camera.stream_url == rtsp_url)).first()
            if existing:
                existing.stream_url = rtsp_url
                existing.location_name = location_name
                existing.latitude = float(lat)
                existing.longitude = float(lng)
                existing.is_active = is_live
                updated += 1
            else:
                new_cam = Camera(
                    name=name,
                    vendor=vendor,
                    protocol="RTSP",
                    stream_url=rtsp_url,
                    location_name=location_name,
                    latitude=float(lat),
                    longitude=float(lng),
                    is_active=is_live
                )
                db.add(new_cam)
                onboarded += 1

        db.commit()
        total = db.query(Camera).count()
        print(f"[3/3] Done! Added {onboarded} new cameras, updated {updated} existing cameras. (Total active in SentinelGrid: {total}).")
    finally:
        db.close()

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Sync official Gujarat Police sandbox camera feeds into SentinelGrid")
    parser.add_argument("--cookie", help="Session cookie from https://live.sentinelgujarat.in", default=None)
    parser.add_argument("--file", help="Path to downloaded JSON catalogue file from /api/ingest", default=None)
    args = parser.parse_args()

    sync_cameras(cookie_or_token=args.cookie, local_json_file=args.file)
