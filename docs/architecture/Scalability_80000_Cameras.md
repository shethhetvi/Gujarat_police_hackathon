# SentinelGrid — 80,000 Camera Scalability Blueprint
> **Gujarat CCTV Hackathon 2026 Architectural Defense**

## 1. Executive Summary

Scaling a real-time computer vision and license plate recognition system from a ~50-camera pilot to Gujarat's statewide network of **~80,000 cameras** cannot be achieved with centralized raw video streaming over state WANs (which would require hundreds of Gbps in bandwidth). 

SentinelGrid employs a **Hybrid Edge-Cluster Architecture**:
1. **Edge Inference at District Nodes**: Lightweight frame sampling, YOLOv8 vehicle detection, ByteTrack tracking, and OCR run locally at district/city hubs.
2. **Metadata-Only Central Stream**: Only extracted license plate strings, vector embeddings, confidence scores, and low-res match crops are transmitted over the Gujarat State Wide Area Network (GSWAN).
3. **Partitioned Ingestion & Distributed Matching**: Kafka message brokers distribute plate screening against the centralized Watchlist across an active-active Redis cluster.

---

## 2. Bandwidth & Compute Math

### Bandwidth Comparison
| Strategy | Video Feed Quality | Ingestion Bandwidth (80k Cameras) | WAN Viability |
|---|---|---|---|
| **Central Raw Streaming** | 1080p @ 15 FPS (2.5 Mbps/cam) | **~200 Gbps** | ❌ Prohibitive network congestion |
| **SentinelGrid Edge-Filtered** | 5 FPS keyframes on Edge + Metadata | **~400 Mbps total** | ✅ 99.8% bandwidth reduction |

---

## 3. Tiered Architectural Layers

```mermaid
graph TD
    subgraph Tier 1: District Edge Nodes (33 Districts)
        CAMS[80,000 RTSP / ONVIF Cameras] --> EDGE[Edge Ingestion & AI Workers]
        EDGE --> DET[YOLOv8 + ByteTrack]
        DET --> ANPR[ANPR / OCR]
    end

    subgraph Tier 2: State Message Backbone
        ANPR -->|JSON Metadata + 10KB Crop on Match| KAFKA[Apache Kafka Cluster - 128 Partitions]
    end

    subgraph Tier 3: Central Command Engine (Gandhinagar HQ)
        KAFKA --> MATCHER[Distributed Matching Engine Cluster]
        MATCHER <--> REDIS[(Redis Cluster - Sub-millisecond Watchlist Cache)]
        MATCHER --> PG[(PostgreSQL Distributed Database)]
        MATCHER --> ALERTS[Real-time Alert Pipeline]
    end

    subgraph Tier 4: Law Enforcement Operations
        ALERTS --> WS[WebSocket Gateway]
        WS --> UI[SentinelGrid Command Dashboard]
        WS --> PATROL[Field Officer Patrol Devices]
    end
```

---

## 4. Key Scaling Pillars

### A. Edge-Accelerated Filtering
- **Motion Gating**: Video frames with zero vehicle motion are discarded before passing to the neural network.
- **Deduplication via Intra-camera Tracking**: ByteTrack assigns persistent IDs; a vehicle waiting at a red light for 2 minutes produces 1 detection event instead of 3,600 duplicate alerts.

### B. High-Throughput Matching
- Target watchlists are maintained in an in-memory Redis cluster with indexed Bloom filters, providing sub-millisecond match verification at 50,000+ plate lookups/sec.

### C. Fault Tolerance & Graceful Degradation
- If connectivity to Gandhinagar HQ drops, district edge nodes continue caching detections locally in SQLite/RocksDB and auto-sync once GSWAN links restore.

---

## 5. Summary

This blueprint ensures SentinelGrid satisfies Gujarat's state-scale operational demands while keeping infrastructure, compute, and bandwidth costs within realistic law enforcement budgets.
