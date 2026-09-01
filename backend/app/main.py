from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import cameras, watchlist, detections, alerts, analytics
from app.websocket.connection_manager import router as websocket_router
from app.core.config import settings

app = FastAPI(
    title="SentinelGrid API",
    description="Unified CCTV Video Management & ANPR Analytics Platform",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(cameras.router, prefix="/api/v1/cameras", tags=["Cameras"])
app.include_router(watchlist.router, prefix="/api/v1/watchlist", tags=["Watchlist"])
app.include_router(detections.router, prefix="/api/v1/detections", tags=["Detections"])
app.include_router(alerts.router, prefix="/api/v1/alerts", tags=["Alerts"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["Analytics"])
app.include_router(websocket_router, tags=["WebSockets"])

@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy", "service": "SentinelGrid Backend"}
