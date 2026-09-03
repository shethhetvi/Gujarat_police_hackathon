# SentinelGrid — System Overview, Progress & Input/Output Specification
> **Unified CCTV Video Management & AI Analytics Platform**  
> *Gujarat Police CCTV Hackathon 2026*

---

## 1. Executive Summary

**SentinelGrid** is a scalable, vendor-neutral CCTV management and AI-powered video analytics system designed for real-time surveillance, license plate detection (ANPR), cross-camera vehicle tracking, watchlist screening, and instant law enforcement alert dispatch.

---

## 2. What Has Been Done So Far

```
┌─────────────────┐       ┌───────────────────────────────┐       ┌───────────────────────────┐
│  CCTV Streams   │ ----> │   SentinelGrid AI Pipeline    │ ----> │  Command Center Dashboard  │
│ (RTSP / Video)  │       │ (YOLOv8 + ByteTrack + ANPR)   │       │ (Next.js / Live GIS Map)  │
└─────────────────┘       └───────────────────────────────┘       └───────────────────────────┘
                                      │                                         ▲
                                      ▼                                         │
                          ┌────────────────────────┐                            │
                          │ Watchlist Match Engine │ ─── WebSocket Alerts ──────┘
                          └────────────────────────┘
```

### ✅ Implemented Modules & Architecture

### 1. AI Video Analytics Pipeline (`backend/app/services/ai_pipeline/`)
* **Vehicle Detection (`detector.py`)**: Uses YOLOv8 (`yolov8n.pt`) to detect multiple vehicle classes (`car`, `bus`, `truck`, `motorcycle`) with high confidence and bounding-box coordinates.
* **Vehicle Tracking (`tracker.py`)**: Implements **ByteTrack** for spatial-temporal association, ensuring vehicles retain a consistent `tracking_id` across consecutive video frames.
* **ANPR & OCR Engine (`anpr_ocr.py`)**: Crops vehicle license plate regions and performs OCR text extraction with heuristic license pattern cleaning (e.g., standard Indian format `GJ01AB1234`).
* **Watchlist Matching Engine (`matching_engine.py`)**: Real-time evaluation of recognized plates against registered police watchlists with fuzzy and exact matching rules.

### 2. Alert Dispatcher & Real-Time System (`backend/app/services/alert_service.py`)
* Automatically saves snapshot crops with bounding box annotations (`snapshots/`).
* Creates persistent alert records in the database (`alerts` table).
* Dispatches instantaneous notifications across **WebSockets** (`backend/app/websocket/`) to all connected police command center dashboards.

### 3. REST API & Data Persistence (`backend/app/api/`)
* **Cameras (`/api/v1/cameras`)**: CRUD operations, RTSP configuration, status monitoring (Online/Offline/Degraded), and GPS coordinates across cities (Ahmedabad, Gandhinagar, Surat, Vadodara).
* **Watchlist (`/api/v1/watchlist`)**: Add, update, search, and deactivate flagged vehicles (Stolen, Wanted Suspect, Suspicious Activity, Expired Insurance).
* **Detections (`/api/v1/detections`)**: Audit logs of all vehicle detection events with timestamp, camera ID, snapshot URLs, and confidence scores.
* **Alerts (`/api/v1/alerts`)**: Query active/acknowledged alerts, filter by severity level (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), and trigger alert state transitions.
* **Analytics (`/api/v1/analytics`)**: Trajectory reconstruction, speed calculation, camera heatmaps, and vehicle travel logs.

### 4. Command Center Frontend (`frontend/src/`)
* **Live Camera Grid (`components/cameras/`)**: Multi-camera grid viewing live or simulated RTSP video streams.
* **Interactive GIS Map (`components/map/`)**: OpenStreetMap/Leaflet integration showing camera nodes, vehicle geofences, and visual movement paths.
* **Real-time Alert Drawer (`components/alerts/`)**: Floating alert drawer with audio-visual notifications, priority badges, and annotated snapshot previews.
* **Watchlist Manager (`components/watchlist/`)**: UI to register new target plates and manage enforcement flags.

---

## 3. Detailed Input and Output Specifications with Examples

### Flow A: Watchlist Registration

* **Component**: Police Operator / Crime Database Integration
* **API Route**: `POST /api/v1/watchlist`

#### Input (Request Payload):
```json
{
  "plate_number": "GJ01AB1234",
  "vehicle_type": "SUV / White Fortuner",
  "owner_name": "Ramesh Kumar",
  "category": "STOLEN_VEHICLE",
  "priority": "HIGH",
  "notes": "Vehicle reported stolen from SG Highway, Ahmedabad on 02-Sep-2026. FIR #4092"
}
```

#### Output (Response):
```json
{
  "id": 12,
  "plate_number": "GJ01AB1234",
  "vehicle_type": "SUV / White Fortuner",
  "owner_name": "Ramesh Kumar",
  "category": "STOLEN_VEHICLE",
  "priority": "HIGH",
  "status": "ACTIVE",
  "created_at": "2026-09-03T10:45:00Z"
}
```

---

### Flow B: Live Camera Video Ingestion

* **Component**: CCTV Camera / Stream Ingestion Service
* **Stream Type**: RTSP / HLS / Video File Simulation

#### Input:
* **Video Stream**: 1080p @ 30 FPS frame buffer (`numpy.ndarray` frame shape: `(1080, 1920, 3)`).
* **Camera Metadata**:
```json
{
  "camera_id": "CAM-AHM-04",
  "name": "SG Highway - Iscon Junction",
  "latitude": 23.0338,
  "longitude": 72.5850,
  "stream_url": "rtsp://camera-gateway/ahmedabad/cam-04"
}
```

---

### Flow C: AI Detection, Tracking & OCR Extraction

* **Component**: `backend/app/services/ai_pipeline/pipeline.py`

#### Processing Steps:
1. **YOLOv8 Detection**: Finds vehicles in the frame.
2. **ByteTrack**: Assigns unique `tracking_id` across frames.
3. **ANPR OCR**: Extracts plate string and OCR confidence score.

#### Output (Detection Internal Data Structure):
```json
{
  "tracking_id": 142,
  "vehicle_class": "car",
  "detection_confidence": 0.94,
  "bounding_box": [320, 180, 560, 420],
  "plate_number": "GJ01AB1234",
  "ocr_confidence": 0.91,
  "is_simulated": false
}
```

---

### Flow D: Watchlist Match & Real-Time Alert Broadcast

* **Component**: `matching_engine.py` & `alert_service.py`
* **Trigger**: Plate `GJ01AB1234` matches an `ACTIVE` entry in the watchlist.

#### Output 1: Saved Image Snapshot on Disk & URL
* **Saved Path**: `backend/app/snapshots/snap_GJ01AB1234_1788412800.jpg`
* **Image**: High-resolution camera frame with bounding box and plate tag drawn in red.

#### Output 2: Database Record (`alerts` table)
```json
{
  "id": 8921,
  "camera_id": "CAM-AHM-04",
  "watchlist_entry_id": 12,
  "plate_number": "GJ01AB1234",
  "severity": "CRITICAL",
  "status": "TRIGGERED",
  "snapshot_url": "/snapshots/snap_GJ01AB1234_1788412800.jpg",
  "timestamp": "2026-09-03T11:06:20Z"
}
```

#### Output 3: Real-Time WebSocket Broadcast Payload
* **Protocol**: `ws://localhost:8000/ws/alerts`
```json
{
  "event": "ALERT_TRIGGERED",
  "alert": {
    "id": 8921,
    "severity": "CRITICAL",
    "timestamp": "2026-09-03T11:06:20Z",
    "plate_number": "GJ01AB1234",
    "category": "STOLEN_VEHICLE",
    "notes": "Vehicle reported stolen from SG Highway, Ahmedabad on 02-Sep-2026. FIR #4092",
    "snapshot_url": "/snapshots/snap_GJ01AB1234_1788412800.jpg",
    "camera": {
      "id": "CAM-AHM-04",
      "name": "SG Highway - Iscon Junction",
      "latitude": 23.0338,
      "longitude": 72.5850
    }
  }
}
```

---

### Flow E: Cross-Camera Trajectory & Analytics

* **Component**: `/api/v1/analytics/trajectory/{plate_number}`
* **Input**: Target license plate query (e.g. `GJ01AB1234`)

#### Output (Historical Movement & Route Map):
```json
{
  "plate_number": "GJ01AB1234",
  "total_sightings": 3,
  "route": [
    {
      "camera_id": "CAM-AHM-01",
      "location": "Vastrapur Lake Junction",
      "timestamp": "2026-09-03T10:30:15Z",
      "coordinates": [23.0350, 72.5293]
    },
    {
      "camera_id": "CAM-AHM-04",
      "location": "SG Highway - Iscon Junction",
      "timestamp": "2026-09-03T10:48:42Z",
      "coordinates": [23.0338, 72.5850]
    },
    {
      "camera_id": "CAM-GNR-02",
      "location": "Chiloda Circle, Gandhinagar",
      "timestamp": "2026-09-03T11:06:20Z",
      "coordinates": [23.2385, 72.6841]
    }
  ],
  "estimated_speed_kmh": 62.4,
  "heading_direction": "North-East (towards Gandhinagar)"
}
```

---

## 4. Technology Stack Summary

| Layer | Technology / Tool | Purpose |
| :--- | :--- | :--- |
| **Backend API** | FastAPI (Python 3.10+) | High-performance asynchronous API & WebSocket hub |
| **Object Detection** | YOLOv8 (Ultralytics) | Real-time vehicle recognition (`car`, `bus`, `truck`, `motorcycle`) |
| **Tracking Engine** | ByteTrack | Multi-object tracking across video frames |
| **ANPR / OCR** | EasyOCR / Tesseract / OpenCV | License plate segmentation and character extraction |
| **Database** | SQLite / PostgreSQL (SQLAlchemy) | Cameras, Watchlist, Detections, and Alert storage |
| **Real-time Pub/Sub** | WebSockets + Redis | Instant alert broadcast to connected clients |
| **Frontend UI** | Next.js 14, React, Tailwind CSS | Command Center, Live CCTV Feeds, Alert Drawer |
| **GIS Mapping** | Leaflet / OpenStreetMap | Spatial camera visualization and vehicle trajectory mapping |

---

## 5. Verification & Running the Platform

### Running the System
```bash
# 1. Start Backend & AI Engine
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# 2. Start Frontend Dashboard
cd frontend
npm run dev
```

* **Frontend Command Center**: `http://localhost:3000`
* **Backend Swagger API Documentation**: `http://localhost:8000/docs`
