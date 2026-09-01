# SentinelGrid — Unified CCTV Video Management & Analytics Platform
> **Gujarat CCTV Hackathon 2026 Submission**

SentinelGrid is a vendor-neutral, scalable CCTV management and AI video analytics system designed for real-time license plate detection (ANPR), cross-camera vehicle tracking, watchlist screening, and instant law enforcement alerts across thousands of heterogeneous feeds.

---

## 📁 Repository Structure

```
.
├── backend/                  # FastAPI Backend & AI Processing Pipeline
│   ├── app/
│   │   ├── api/              # REST Endpoints (Cameras, Alerts, Watchlist, Detections)
│   │   ├── core/             # Configuration, Database (PostgreSQL), Redis Pub/Sub
│   │   ├── models/           # SQLAlchemy Data Models
│   │   ├── schemas/          # Pydantic Request/Response Schemas
│   │   ├── services/
│   │   │   ├── ingestion/    # RTSP/ONVIF Stream Ingestion Adapters
│   │   │   ├── ai_pipeline/  # YOLOv8 Detection, ByteTrack Tracking, ANPR/OCR
│   │   │   ├── matching_engine.py  # Watchlist Rule Matching
│   │   │   └── alert_service.py    # Alert Dispatch & WebSocket Notification
│   │   ├── websocket/        # Real-time WebSocket Connection Manager
│   │   └── main.py           # FastAPI Application Entrypoint
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/                 # Next.js Command Center & GIS Dashboard
│   ├── src/
│   │   ├── components/
│   │   │   ├── alerts/       # Real-time Alert Drawer & Cards
│   │   │   ├── cameras/      # Live Multi-Feed Grid & Players
│   │   │   ├── map/          # GIS / OpenStreetMap / Leaflet Tracking
│   │   │   ├── watchlist/    # Watchlist Management Table & Forms
│   │   │   └── layout/       # Navigation, Header, Sidebar
│   │   ├── services/         # API & WebSocket Client
│   │   └── types/            # TypeScript Interfaces
│   ├── Dockerfile
│   └── package.json
│
├── simulation/               # Multi-feed Stream Simulation & Mock Data
│   ├── mock_data/            # Sample Cameras & Watchlist Datasets
│   ├── sample_feeds/         # Video Samples for Multi-camera Simulation
│   └── stream_simulator.py   # Multi-threaded Video Feeder Script
│
├── docs/                     # Architecture, PRD, & Specifications
│   ├── prd/                  # Product Requirements Document
│   └── architecture/         # High-Level Design Diagrams & Schemas
│
├── scripts/                  # Setup, Seed Data, and Run Scripts
│   ├── setup.sh
│   └── seed_data.py
│
└── docker-compose.yml        # Multi-container Orchestration (Postgres, Redis, Backend, Frontend)
```

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose OR Python 3.10+ & Node.js 18+

### Running with Docker Compose
```bash
docker-compose up --build
```

- **Frontend Dashboard**: `http://localhost:3000`
- **Backend API & Swagger Docs**: `http://localhost:8000/docs`
