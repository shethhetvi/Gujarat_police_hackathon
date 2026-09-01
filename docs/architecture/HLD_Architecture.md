# SentinelGrid — High-Level Design (HLD) & Architecture

## System Architecture Diagram

```mermaid
graph TD
    subgraph Ingestion Layer
        C1[Camera RTSP Feed 1] --> IA[Ingestion Adapter]
        C2[Camera ONVIF Feed 2] --> IA
        C3[Video File Feeder / Simulation] --> IA
        IA --> SM[Stream Manager / Frame Sampler]
    end

    subgraph AI Inference Pipeline
        SM --> YV[Vehicle Detector - YOLOv8]
        YV --> BT[Object Tracker - ByteTrack]
        BT --> ANPR[ANPR / OCR Engine]
        ANPR --> ME[Matching Engine]
    end

    subgraph Core Backend & Data Layer
        ME -->|Check Plate| WDB[(Watchlist DB - PostgreSQL)]
        ME -->|Store Sighting| DL[(Detection Log - PostgreSQL)]
        ME -->|On Match Trigger| AP[Alert Service]
        AP --> RP[Redis Pub/Sub & Cache]
    end

    subgraph Real-Time & API Layer
        RP --> WS[WebSocket Server]
        DL --> REST[REST API - FastAPI]
        WDB --> REST
    end

    subgraph Frontend Operations Dashboard
        WS --> UI[Next.js Command Dashboard]
        REST --> UI
        UI --> MAP[GIS Map - Leaflet / OSM]
        UI --> LIVE[Live Multi-Feed View]
        UI --> ALERTS[Real-time Alert Center]
        UI --> TRACK[Cross-Camera Route Tracking]
        UI --> WLM[Watchlist Manager]
    end
```

## Module Responsibilities

1. **Ingestion Adapter**: Normalizes heterogeneous video streams (RTSP, ONVIF, MP4 simulation) into unified frame queues.
2. **AI Inference Pipeline**:
   - Vehicle detection with bounding box coordinates (`YOLOv8`).
   - Intra-camera persistent tracking (`ByteTrack`).
   - License plate localization and text recognition (`PaddleOCR / EasyOCR`).
3. **Matching Engine**: Fuzzy and exact license plate matching against the active watchlist database.
4. **Alert Service & Redis Pub/Sub**: Real-time event broadcasting to subscribed control room clients.
5. **FastAPI Backend**: Provides CRUD APIs for cameras, watchlists, detection events, alerts, and system analytics.
6. **Next.js Dashboard**: Mission-control UI with interactive GIS mapping, dynamic alert triage, video playback, and cross-camera route tracing.
