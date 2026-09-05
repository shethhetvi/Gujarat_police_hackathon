import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.routes import cameras, watchlist, detections, alerts, analytics
from app.websocket.connection_manager import router as websocket_router
from app.core.config import settings
from app.core.database import init_db_tables

# Ensure static snapshots directory exists
SNAPSHOT_DIR = os.path.join(os.path.dirname(__file__), "snapshots")
os.makedirs(SNAPSHOT_DIR, exist_ok=True)

import asyncio
from app.websocket.connection_manager import set_main_loop

def seed_initial_data():
    import json
    from app.core.database import SessionLocal
    from app.models.camera import Camera
    from app.models.watchlist import WatchlistEntry
    db = SessionLocal()
    try:
        project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
        sandbox_path = os.path.join(project_root, "sandbox_cameras.json")

        official_cams = []
        if os.path.exists(sandbox_path):
            with open(sandbox_path, "r", encoding="utf-8") as f:
                raw_cams = json.load(f)
                # Filter for the 33 official Gujarat Police CCTV cameras
                for c in raw_cams:
                    cid = c.get("id")
                    if isinstance(cid, int) and 1 <= cid <= 33:
                        official_cams.append(c)

        # Prune any cameras beyond the 33 official cameras
        db.query(Camera).filter(Camera.id > 33).delete(synchronize_session=False)
        db.commit()


        # Synchronize exactly the 33 cameras
        if official_cams:
            for item in official_cams[:33]:
                cid = item.get("id")
                name = item.get("name")
                loc = item.get("location_name") or item.get("name")
                lat = float(item.get("latitude", 23.0225))
                lng = float(item.get("longitude", 72.5714))
                rtsp_url = item.get("stream_url") or f"rtsp://cctv.corp8.cloud:8554/stream/{cid}"
                vendor = item.get("vendor") or "Gujarat Police CCTV"

                existing = db.query(Camera).filter(Camera.id == cid).first()
                if existing:
                    existing.name = name
                    existing.location_name = loc
                    existing.latitude = lat
                    existing.longitude = lng
                    existing.stream_url = rtsp_url
                    existing.vendor = vendor
                    existing.is_active = True
                else:
                    new_cam = Camera(
                        id=cid,
                        name=name,
                        location_name=loc,
                        latitude=lat,
                        longitude=lng,
                        stream_url=rtsp_url,
                        vendor=vendor,
                        protocol="RTSP",
                        is_active=True
                    )
                    db.add(new_cam)
            db.commit()

        if db.query(WatchlistEntry).count() == 0:
            default_wl = [
                WatchlistEntry(plate_number="GJ01TA8821", category="stolen", priority="CRITICAL", vehicle_make_model="White Fortuner", description="FIR #4092 Navrangpura PS - Armed Stolen Vehicle", is_active=True),
                WatchlistEntry(plate_number="GJ05CD5678", category="wanted", priority="HIGH", vehicle_make_model="Silver Swift", description="FIR #1120 Katargam PS - Wanted in Highway Heist", is_active=True),
                WatchlistEntry(plate_number="GJ27EF9012", category="blacklisted", priority="HIGH", vehicle_make_model="Black Scorpio", description="State Surveillance Intercept Order", is_active=True),
            ]
            for w in default_wl:
                db.add(w)
            db.commit()
    except Exception as e:
        print("Seed error:", e)
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Register event loop for threadsafe WebSocket broadcasting
    try:
        set_main_loop(asyncio.get_running_loop())
    except Exception:
        pass
    # Startup: initialize database tables & default seeds
    init_db_tables()
    seed_initial_data()
    yield
    # Shutdown: cleanup if needed

app = FastAPI(
    title="SentinelGrid API",
    description="Unified CCTV Video Management & ANPR Analytics Platform (Gujarat Police CCTV Hackathon)",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS if isinstance(settings.BACKEND_CORS_ORIGINS, list) else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static snapshots for previewing detected vehicles/plates in dashboard
app.mount("/snapshots", StaticFiles(directory=SNAPSHOT_DIR), name="snapshots")

# Include API Routers
app.include_router(cameras.router, prefix="/api/v1/cameras", tags=["Cameras"])
app.include_router(watchlist.router, prefix="/api/v1/watchlist", tags=["Watchlist"])
app.include_router(detections.router, prefix="/api/v1/detections", tags=["Detections"])
app.include_router(alerts.router, prefix="/api/v1/alerts", tags=["Alerts"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["Analytics"])
app.include_router(websocket_router, tags=["WebSockets"])

@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "SentinelGrid Backend",
        "snapshots_dir": os.path.exists(SNAPSHOT_DIR)
    }
