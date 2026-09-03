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

def seed_initial_data():
    from app.core.database import SessionLocal
    from app.models.camera import Camera
    from app.models.watchlist import WatchlistEntry
    db = SessionLocal()
    try:
        if db.query(Camera).count() == 0:
            default_cams = [
                Camera(name="Chimanbhai Bridge Junction", vendor="Hikvision", protocol="RTSP", stream_url="rtsp://cctv/chimanbhai", location_name="Subhash Bridge - RTO, Ahmedabad", latitude=23.0645, longitude=72.5780, is_active=True),
                Camera(name="Janpath Hotel Circle", vendor="CP Plus", protocol="RTSP", stream_url="rtsp://cctv/janpath", location_name="Ashram Road Corridor, Ahmedabad", latitude=23.0531, longitude=72.5694, is_active=True),
                Camera(name="O.N.G.C. Chandkheda Circle", vendor="Dahua", protocol="RTSP", stream_url="rtsp://cctv/ongc", location_name="Gandhinagar-Ahmedabad Highway", latitude=23.1025, longitude=72.5935, is_active=True),
                Camera(name="Paldi Crossroad Circle", vendor="Honeywell", protocol="RTSP", stream_url="rtsp://cctv/paldi", location_name="Paldi, Central Ahmedabad", latitude=23.0135, longitude=72.5620, is_active=True),
                Camera(name="Ahmedabad S.G. Highway Junction", vendor="Hikvision", protocol="RTSP", stream_url="rtsp://cctv/ahmedabad_sg", location_name="SG Highway, Ahmedabad", latitude=23.0338, longitude=72.5085, is_active=True),
                Camera(name="Ahmedabad Vastrapur Lake Circle", vendor="CP Plus", protocol="RTSP", stream_url="rtsp://cctv/vastrapur", location_name="Vastrapur, Ahmedabad", latitude=23.0350, longitude=72.5293, is_active=True),
                Camera(name="Surat Dumas Road Junction", vendor="Dahua", protocol="ONVIF", stream_url="rtsp://cctv/surat_dumas", location_name="Dumas Road, Surat", latitude=21.1702, longitude=72.8311, is_active=True),
                Camera(name="Vadodara Vadsar Circle", vendor="Honeywell", protocol="RTSP", stream_url="rtsp://cctv/vadsar", location_name="Vadsar, Vadodara", latitude=22.2950, longitude=73.1740, is_active=True),
                Camera(name="Gandhinagar Sector 9 Circle", vendor="Bosch", protocol="RTSP", stream_url="rtsp://cctv/gn_sec9", location_name="Sector 9, Gandhinagar", latitude=23.2222, longitude=72.6497, is_active=True),
            ]
            for c in default_cams:
                db.add(c)
            db.commit()

        if db.query(WatchlistEntry).count() == 0:
            default_wl = [
                WatchlistEntry(plate_number="GJ01AB1234", category="stolen", priority="CRITICAL", vehicle_make_model="White Fortuner", description="FIR #4092 Navrangpura PS - Armed Stolen Vehicle", is_active=True),
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
