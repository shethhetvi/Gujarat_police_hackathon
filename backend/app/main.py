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

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize database tables
    init_db_tables()
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
