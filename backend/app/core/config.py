from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "SentinelGrid"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    
    # Database
    DATABASE_URL: str = "postgresql://sentinel:sentinel_secret@localhost:5432/sentinelgrid_db"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # AI Pipeline
    YOLO_MODEL_PATH: str = "yolov8n.pt"
    CONFIDENCE_THRESHOLD: float = 0.5
    OCR_LANGUAGES: List[str] = ["en"]
    
    # Sentinel Camera Grid Integrator Settings
    SENTINEL_GRID_EMAIL: str = "shethhetvi11@gmail.com"
    SENTINEL_GRID_PASSWORD: str = "NG8C-DUA8-EJ34"
    SENTINEL_GRID_IP: str = "103.250.160.189"
    SENTINEL_GRID_RTSP_PORT: int = 8554
    SENTINEL_GRID_WHEP_PORT: int = 8889
    SENTINEL_GRID_CDN_URL: str = "https://cctv.corp8.cloud"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000", "https://sentinelgrid-cctv-2026.web.app"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"

settings = Settings()
