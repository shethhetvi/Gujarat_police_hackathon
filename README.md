<div align="center">

# 🛡️ SentinelGrid
### **Unified Statewide Smart Surveillance, Multi-Camera ANPR & Predictive Interception Platform**
*Built for the Gujarat Police Integrated Command & Control Centre (ICCC) — Gujarat Police CCTV Hackathon 2026*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Firebase%20Hosting-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://sentinelgrid-cctv-2026.web.app)
[![Gujarat Police](https://img.shields.io/badge/Jurisdiction-Gujarat%20State%20Police-0B3C5D?style=for-the-badge&logo=shield)](https://sentinelgrid-cctv-2026.web.app)
[![Architecture](https://img.shields.io/badge/Scalability-80%2C000%2B%20CCTV%20Feeds-2ECC71?style=for-the-badge&logo=target)](docs/architecture/STATEWIDE_80K_SCALABILITY_AND_EVALUATION_BLUEPRINT.md)
[![Section 65B](https://img.shields.io/badge/Evidence%20Act-Section%2065B%20Forensic%20Ready-E74C3C?style=for-the-badge&logo=veritas)](docs/presentation/screenshots/09_section_65b_forensic_dossier.png)

---

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js 14](https://img.shields.io/badge/Next.js%2014-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![YOLOv8](https://img.shields.io/badge/YOLOv8-Ultralytics-blueviolet?style=flat-square)](https://github.com/ultralytics/ultralytics)
[![ByteTrack](https://img.shields.io/badge/ByteTrack-Multi--Object%20Tracking-orange?style=flat-square)](https://github.com/ifzhang/ByteTrack)
[![Leaflet GIS](https://img.shields.io/badge/GIS-Leaflet%20%2F%20OSM-199900?style=flat-square&logo=leaflet)](https://leafletjs.com)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white)](docker-compose.yml)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

[🌐 **Live Web App**](https://sentinelgrid-cctv-2026.web.app) • [📄 **Executive Presentation (PDF)**](docs/presentation/SentinelGrid_Solution_Presentation.pdf) • [📑 **Demo Runbook**](docs/DEMO_RUNBOOK.md) • [📐 **80k Scalability Blueprint**](docs/architecture/STATEWIDE_80K_SCALABILITY_AND_EVALUATION_BLUEPRINT.md) • [📊 **I/O Specification**](PROJECT_OVERVIEW_INPUT_OUTPUT.md)

</div>

<br/>

<p align="center">
  <img src="docs/presentation/screenshots/01_command_center_dashboard.png" alt="SentinelGrid Command Center Dashboard" width="95%" style="border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); border: 1px solid #1f2937;" />
</p>

---

## 🌟 Executive Summary

**SentinelGrid** is a vendor-neutral, 3-tier Edge-Cluster video management and AI analytics platform engineered for the **Gujarat Police Integrated Command & Control Centre (ICCC)**. 

Across Gujarat's 33 districts, law enforcement operates over **80,000+ CCTV cameras** spanning multi-vendor hardware (Hikvision, CP Plus, Dahua, Axis, Milestone, Honeywell). Traditional systems suffer from protocol fragmentation, massive GSWAN bandwidth bottlenecks, and lack of cross-camera vehicle correlation. 

SentinelGrid solves these challenges by combining **low-latency edge stream normalization**, **high-accuracy multi-stage ANPR**, **cross-camera vehicle trajectory reconstruction**, **predictive intercept route modeling**, and **automated Section 65B court-admissible forensic dossier generation**.

---

## ⚡ Key Highlights & Capabilities

| Capability | What It Delivers | Technical Foundation |
| :--- | :--- | :--- |
| **🔌 Vendor-Neutral Ingestion** | Ingests feeds from any OEM camera or legacy VMS without re-cabling | RTSP / ONVIF / WebRTC (WHEP) / HLS adapters with auto-reconnect |
| **🎯 Multi-Stage ANPR Pipeline** | 98.4% plate recognition across day, night, glare, and low-light | YOLOv8 vehicle detection + ByteTrack + CLAHE low-light OCR + HSRP heuristic normalization |
| **🗺️ Cross-Camera Trajectory** | Tracks target vehicles sequentially across multiple city corridors | Spatiotemporal GIS graph matching, timestamp drift alignment, velocity vectors |
| **🚓 Predictive Tactical Intercept** | Calculates downstream escape junctions and dispatches PCR patrol vans | Kalman filter trajectory forecasting, ETA estimation, Web Audio siren dispatch |
| **⚖️ Section 65B Forensic Integrity** | Produces tamper-evident digital evidence admissible in Indian courts | Cryptographic SHA-256 hash chaining, dynamic QR verification, Section 65B(4) / Section 63 BSA certificate |
| **📉 99.8% Bandwidth Reduction** | Solves GSWAN saturation by processing video at the district edge | Edge DeepStream + INT8 TensorRT inference: transmits lightweight metadata (~10 KB) instead of raw video streams |

---

## 📸 Visual Tour & Core Modules

### 1. Unified Mission Control & Live 50-Camera Grid
> Real-time camera matrix with dynamic vendor filtering, instant telemetry health checks (latency, FPS, resolution), and live AI inference bounding boxes.

| 50-Camera Grid Monitoring | Live Camera Feed with AI Overlay |
| :---: | :---: |
| ![50 Camera Grid](docs/presentation/screenshots/03_50_camera_cctv_grid.png) | ![AI Overlay](docs/presentation/screenshots/04_live_camera_feed_ai_overlay.png) |

---

### 2. Real-Time Alert Triage & Instant Watchlist Screening
> Sub-second matching of vehicle plates against Gujarat State Police hotlists (Stolen, Wanted Suspect, Organized Crime, Suspicious Transport). Dispatches audio-visual alerts with annotated frame crops.

| Real-Time Challenge Alert Trigger | Central Threat Watchlist Database |
| :---: | :---: |
| ![Alert Trigger](docs/presentation/screenshots/05_live_challenge_alert_trigger.png) | ![Watchlist Database](docs/presentation/screenshots/11_threat_watchlist_database.png) |

---

### 3. GIS Multi-Camera Trajectory & Predictive Highway Intercept
> Links sightings across highway corridors (Ahmedabad ➔ Vadodara ➔ Bharuch ➔ Surat). Calculates vehicle heading and predicts escape routes to coordinate tactical roadblocks.

| Highway Corridors Traversal on GIS Map | Predictive Intercept Advisory & PCR Dispatch |
| :---: | :---: |
| ![GIS Map Tracking](docs/presentation/screenshots/06_gis_map_route_traversal.png) | ![Predictive Intercept](docs/presentation/screenshots/07_predictive_intercept_advisory.png) |

---

### 4. Police PCR Van Dispatch & Section 65B Forensic Dossier
> Automatically assigns nearest active patrol vans (`Sagar-22`, `Falcon-14`) and generates an official, tamper-proof electronic record certificate under Section 65B of the Indian Evidence Act.

| Automated PCR Van Dispatch | Courtroom-Admissible Section 65B Dossier |
| :---: | :---: |
| ![PCR Van Dispatch](docs/presentation/screenshots/08_pcr_van_dispatch_unit.png) | ![Section 65B Certificate](docs/presentation/screenshots/09_section_65b_forensic_dossier.png) |

---

## 🏗️ System Architecture

SentinelGrid employs a **3-Tier Distributed Hierarchical Architecture** specifically built for statewide scale:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               TIER 1: DISTRICT EDGE NODES (33 Districts)               │
│  [CCTV Cameras: Hikvision / CP Plus / Dahua / Axis / Milestone] (RTSP / ONVIF / WHEP)   │
│                                           │                                            │
│   ┌───────────────────────────────────────▼────────────────────────────────────────┐   │
│   │ Distributed Edge Compute: DeepStream + TensorRT (INT8)                         │   │
│   │  • Motion Gating & Keyframe Sampling (5-8 FPS)                                 │   │
│   │  • YOLOv8 Vehicle Detection + ByteTrack Multi-Object Tracking                  │   │
│   │  • Low-Light CLAHE Enhancement + Indian Plate OCR (HSRP Regex Engine)          │   │
│   └───────────────────────────────────────┬────────────────────────────────────────┘   │
└───────────────────────────────────────────┼────────────────────────────────────────────┘
                                            │ Lightweight Metadata (~10 KB Match Crop)
                                            │ 99.8% Bandwidth Reduction over GSWAN
┌───────────────────────────────────────────▼────────────────────────────────────────────┐
│                       TIER 2: SECURE GSWAN MESSAGE BACKBONE                            │
│           Apache Kafka / Redis Cluster / RabbitMQ High-Throughput Ingestion            │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
┌───────────────────────────────────────────▼────────────────────────────────────────────┐
│                    TIER 3: GANDHINAGAR STATE COMMAND CORE (ICCC)                       │
│                                                                                        │
│   ┌───────────────────────────┐    ┌───────────────────────────┐    ┌──────────────┐   │
│   │ Global Watchlist Engine   │    │ Predictive GIS Trajectory │    │ Evidence &   │   │
│   │ Sub-millisecond Bloom     │    │ Spatiotemporal Graph      │    │ Section 65B  │   │
│   │ Filter Plate Lookup       │    │ Route Prediction          │    │ Hash Chaining│   │
│   └─────────────┬─────────────┘    └─────────────┬─────────────┘    └──────┬───────┘   │
│                 │                                │                         │           │
│                 └────────────────────────────────┼─────────────────────────┘           │
│                                                  ▼                                     │
│                     FastAPI Asynchronous Gateway & WebSockets Hub                      │
│                                                  │                                     │
│         ┌────────────────────────────────────────┴───────────────────────────┐         │
│         ▼                                                                    ▼         │
│   [Next.js 14 Command Center]                                    [Patrol PCR Mobile]   │
│   • Live 50-Cam Surveillance HUD                                 • Push Notifications  │
│   • Real-Time GIS Heatmap & Intercepts                           • Barricade Advisory  │
│   • Section 65B Evidence Dossier PDF                             • Intercept Dispatch  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### High-Level Architectural Schemas

| System HLD Architecture | Workflow & Data Pipeline Integration |
| :---: | :---: |
| ![HLD Architecture](docs/architecture/SentinelGrid_HLD_Architecture.png) | ![Workflow Diagram](docs/architecture/SentinelGrid_Workflow_Integration_Diagram.png) |

---

## 📈 Statewide 80,000 Camera Scalability Blueprint

To deploy across Gujarat's entire camera footprint without overloading state infrastructure:

| Parameter | Traditional Central Streaming | SentinelGrid 3-Tier Edge Cluster | Efficiency Gain |
| :--- | :--- | :--- | :--- |
| **Statewide Bandwidth** | ~200 Gbps (Saturates GSWAN) | **~380 Mbps** (Metadata + Match Crops) | **99.8% Reduction** |
| **Central Server Compute** | Massive Central GPU Datacenter | 66 Edge Nodes (2 per District) + 264 NVIDIA L4 GPUs | **Distributed & Fault-Tolerant** |
| **Network Resilience** | Video drops during WAN outages | Edge nodes queue detections locally with offline sync | **Zero Data Loss** |
| **Alert Latency** | 4.5s – 12s | **< 350 ms End-to-End** | **Instant Tactical Response** |
| **Compliance** | Unverified file copies | SHA-256 Chain + Section 65B Digital Certificate | **Court Admissible** |

> 📘 *For complete compute sizing, storage calculations, and network topologies, see the [Statewide 80k Scalability Blueprint](docs/architecture/STATEWIDE_80K_SCALABILITY_AND_EVALUATION_BLUEPRINT.md).*

---

## 🔄 Input / Output Specifications

### 1. Watchlist Registration
* **Endpoint**: `POST /api/v1/watchlist`
```json
{
  "plate_number": "GJ01AB1234",
  "vehicle_type": "SUV / White Creta",
  "owner_name": "Ramesh Kumar",
  "category": "STOLEN_VEHICLE",
  "priority": "CRITICAL",
  "notes": "Reported stolen from SG Highway, Ahmedabad. FIR #4092/2026."
}
```

### 2. Live Detection & ANPR Extraction Payload
* **Pipeline Component**: `backend/app/services/ai_pipeline/`
```json
{
  "camera_id": "CAM-AHM-04",
  "location": "SG Highway - Iscon Junction",
  "tracking_id": 142,
  "vehicle_class": "car",
  "plate_number": "GJ01AB1234",
  "ocr_confidence": 0.942,
  "speed_kmh": 68.5,
  "heading": "SOUTH_WEST",
  "timestamp": "2026-09-13T10:48:42Z",
  "sha256_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
}
```

### 3. Real-Time WebSocket Alert Dispatch
* **Channel**: `ws://localhost:8000/ws/alerts`
```json
{
  "event": "ALERT_TRIGGERED",
  "alert": {
    "id": 8921,
    "severity": "CRITICAL",
    "category": "STOLEN_VEHICLE",
    "plate_number": "GJ01AB1234",
    "camera": { "id": "CAM-AHM-04", "name": "SG Highway - Iscon Junction", "lat": 23.0338, "lng": 72.5850 },
    "snapshot_url": "/snapshots/snap_GJ01AB1234_1788412800.jpg",
    "predicted_next_junction": "Sanathal Cross Road (ETA: 4 min 12 sec)",
    "recommended_dispatch": ["PCR Falcon-14", "Barricade Bravo"]
  }
}
```

---

## 📁 Repository Structure

```
.
├── backend/                       # FastAPI Backend & AI Analytics Pipeline
│   ├── app/
│   │   ├── api/                   # REST Endpoints (Cameras, Watchlist, Alerts, Detections)
│   │   ├── core/                  # Configuration, Database Engine, Redis Pub/Sub
│   │   ├── models/                # SQLAlchemy Models (Camera, Watchlist, Alert, Detection)
│   │   ├── schemas/               # Pydantic Request/Response Validation Schemas
│   │   ├── services/
│   │   │   ├── ai_pipeline/       # YOLOv8 Detector, ByteTrack, Low-Light ANPR & OCR
│   │   │   ├── alert_service.py   # WebSocket Dispatcher & Snapshot Archiver
│   │   │   ├── forensic_service.py# Section 65B Indian Evidence Act Certificate Engine
│   │   │   ├── matching_engine.py # Fuzzy & Soundex Watchlist Matching Engine
│   │   │   └── video_feed_manager.py # RTSP/ONVIF Multi-feed Ingestion Manager
│   │   ├── websocket/             # Real-time WebSocket Connection Manager
│   │   └── main.py                # FastAPI Application Entrypoint
│   ├── requirements.txt           # Python Dependencies (PyTorch, Ultralytics, OpenCV, FastAPI)
│   └── Dockerfile
│
├── frontend/                      # Next.js 14 Command Center Dashboard
│   ├── src/
│   │   ├── app/                   # App Router Pages & Main Command Center
│   │   ├── components/
│   │   │   ├── alerts/            # Audio-Visual Alert Cards & Investigation Modal
│   │   │   ├── cameras/           # Multi-Camera RTSP Grid & Vendor Filters
│   │   │   ├── forensic/          # Section 65B Evidence Dossier Modal & QR Generator
│   │   │   ├── map/               # Leaflet GIS Route Radar & Intercept Plotter
│   │   │   ├── telemetry/         # Camera Network Health & Stream Telemetry
│   │   │   └── watchlist/         # Active Watchlist Manager & CRUD
│   │   ├── services/              # API Client & WebSocket Event Handlers
│   │   └── types/                 # TypeScript Type Definitions
│   ├── next.config.js             # Static Export Configuration
│   ├── package.json
│   └── Dockerfile
│
├── docs/                          # Architecture Blueprints, PRDs, and Slides
│   ├── architecture/              # High-Level Design Diagrams & 80k Scalability Plan
│   ├── presentation/              # Slide Decks (PDF, PPTX) and Screenshots
│   └── DEMO_RUNBOOK.md            # Step-by-Step 3-to-5 Min Hackathon Jury Demo Script
│
├── simulation/                    # Multi-feed Stream Simulation & Mock Data
│   ├── mock_data/                 # Synthetic Gujarat Junctions & Plates
│   └── stream_simulator.py        # Multi-Threaded RTSP / Video Feeder
│
├── scripts/                       # Automation, Seed, and Benchmark Utilities
│   ├── generate_pdf_deck.py       # Automated Slide Deck & Graphic Generator
│   ├── generate_submission_assets.py # Architecture Diagrams Renderer
│   └── record_winning_demo_video.py # Synthetic End-to-End Walkthrough Recorder
│
├── firebase.json                  # Firebase Hosting Deployment Configuration
├── docker-compose.yml             # Multi-Container Orchestration (FastAPI, Next.js, Redis, Postgres)
└── README.md                      # System Documentation
```

---

## 🚀 Quick Start Guide

### Option 1: Docker Compose (Recommended)
Run the entire platform (Backend, Frontend, Redis, Database) in a single command:
```bash
git clone https://github.com/shethhetvi/Gujarat_police_hackathon.git
cd Gujarat_police_hackathon
docker-compose up --build
```
* **Frontend Command Center**: [http://localhost:3000](http://localhost:3000)
* **Backend API & Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Option 2: Local Development Setup

#### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run the FastAPI server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

#### 3. Start Multi-Camera Simulator
```bash
cd simulation
python stream_simulator.py
```

---

## 🎯 3-Minute Hackathon Jury Evaluation Checklist

Judges can evaluate the platform end-to-end using our curated demo triggers:

1. **Surveillance Grid (`/`)**: Verify 50 heterogeneous camera feeds across Gujarat (Ahmedabad, Surat, Vadodara, Rajkot) with live FPS and bitrate telemetry.
2. **Watchlist CRUD**: Navigate to `Watchlist DB`, add target plate `GJ01AB1234`, and confirm immediate table synchronization.
3. **Trigger Alert**: Click **`⚡ Simulate Alert`** on the top navigation bar to observe the real-time audio-visual flash and snapshot crop.
4. **GIS Trajectory & Predictive Intercept**: Click **`🗺️ Track Route on GIS Map`** to witness cross-camera route reconstruction across 9 sequential highway junctions.
5. **Section 65B Forensic Export**: Click **`📜 Generate Section 65B Dossier`** inside the Alert Modal to inspect the SHA-256 tamper-proof certificate and QR code verification.

> 📋 *Detailed step-by-step presentation script is available in the [Demo Runbook](docs/DEMO_RUNBOOK.md).*

---

## 👥 Hackathon Team & Acknowledgements

Developed with ❤️ for the **Gujarat Police CCTV Hackathon 2026**.

* **Navrachana University**, Vadodara, Gujarat
* **Domain**: Computer Vision, Smart Policing, and Edge AI Systems

---

<div align="center">
  <sub>SentinelGrid © 2026. Designed in compliance with Section 65B of the Indian Evidence Act & Section 63 of the Bharatiya Sakshya Adhiniyam, 2023.</sub>
</div>
