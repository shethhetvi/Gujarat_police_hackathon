# Product Requirements Document

## SentinelGrid — Unified CCTV Video Management & Analytics Platform
*Gujarat CCTV Hackathon 2026 Submission*

**Version:** 1.0  
**Status:** Draft for hackathon submission

---

## 1. Background & Problem Statement

Gujarat's CCTV infrastructure is heterogeneous: different camera vendors, different Video Management Systems (VMS), installed at different times with no common integration layer. As a result, watchlist checks (stolen vehicles, wanted/missing persons, blacklisted entities) rely on manual review of individual feeds, which does not scale toward the state's target of ~80,000 cameras and cannot deliver real-time alerts to law enforcement.

There is no unified system today that can:
- Ingest live video from arbitrary, multi-vendor camera/VMS sources
- Continuously screen that video against a searchable watchlist database
- Generate automated, real-time alerts on a match
- Visualize matches and vehicle movement on a map for operational response

---

## 2. Goals

| Goal | Why it matters |
|---|---|
| Vendor-neutral ingestion | No redesign needed as cameras/VMS vendors change over time |
| Real-time detection & alerting | Seconds-level response instead of manual, hours-later review |
| Cross-camera tracking | A single sighting is useful; a movement history is actionable |
| Scalable architecture | Must credibly extend from a ~50-camera pilot to ~80,000 cameras |
| Auditable, searchable records | Every detection (match or not) must be queryable later |

### Non-Goals (out of scope for prototype submission)
- Replacing existing VMS/camera hardware
- Facial recognition / person re-identification (vehicle-focused for this submission; noted as roadmap item)
- Full production-grade multi-tenant access control system (basic auth only for the prototype)
- Live integration with real government databases (uses representative/mock watchlist data)

---

## 3. Users

| User | Needs |
|---|---|
| Control room operator | Live view of all camera feeds and incoming alerts |
| Field/patrol officer | Instant alert with location, snapshot, and vehicle route history |
| Watchlist administrator | Ability to add/update/remove watchlist entries |
| System administrator | Onboard new cameras, monitor system/camera health |

---

## 4. User Flow (Worked Example)

1. A stolen vehicle (plate `GJ-01-AB-1234`) is added to the Watchlist DB.
2. The vehicle passes Camera #17 (Ahmedabad). The ingestion adapter normalizes the feed regardless of vendor.
3. YOLOv8 detects the vehicle; ByteTrack assigns it a tracking ID.
4. OCR reads the plate and the matching engine checks it against the watchlist — match found.
5. An alert fires instantly with camera ID, location, timestamp, and snapshot, pushed live to the dashboard.
6. The same plate is later detected at Camera #42 (Vadodara). Both detections are linked and the route is plotted on the GIS map.
7. An officer searches the event history later by plate, camera, or time range.

---

## 5. Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-1 | Ingest live video from heterogeneous sources (RTSP/ONVIF-normalized) | Must |
| FR-2 | Detect vehicles in each frame in real time (YOLOv8) | Must |
| FR-3 | Track vehicles across frames within a camera and assign a persistent ID (ByteTrack) | Must |
| FR-4 | Read license plates from detected vehicles (ANPR/OCR) | Must |
| FR-5 | Maintain a watchlist database (plate, category, metadata, active/inactive) | Must |
| FR-6 | Match detected plates against the watchlist in real time | Must |
| FR-7 | Generate an automated alert on match, with camera, location, timestamp, and snapshot | Must |
| FR-8 | Push alerts to a live dashboard with minimal delay | Must |
| FR-9 | Log every detection (match or not) for later search | Must |
| FR-10 | Link repeat detections of the same plate across different cameras | Should |
| FR-11 | Display camera locations and matched-vehicle routes on a GIS map | Should |
| FR-12 | Provide searchable event history (by plate / camera / time range) | Should |
| FR-13 | Support adding/removing watchlist entries via an admin interface | Should |
| FR-14 | Support onboarding a new camera without code changes (config-driven) | Could |

---

## 6. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Latency | Detection-to-alert under a few seconds per feed |
| Scalability | Architecture must support horizontal scaling of ingestion and inference independently, toward ~80,000 cameras |
| Vendor neutrality | No hard dependency on a specific camera brand or VMS SDK; integration via open, standard protocols |
| Security | Encrypted data at rest and in transit; role-based access for watchlist edits |
| Availability | Ingestion adapter should degrade gracefully (one feed failing shouldn't affect others) |
| Deployability | Containerized (Docker) for consistent, repeatable deployment |
| Data sovereignty | Primary deployment on-premise; cloud used only for burst compute / disaster recovery |

---

## 7. System Architecture (Summary)

Cameras (heterogeneous) → Ingestion Adapter (RTSP/ONVIF, vendor-neutral) → AI Processing (YOLOv8 detection, ByteTrack tracking, OCR) → Matching Engine ↔ Watchlist DB (PostgreSQL) → on match: Alert Pipeline (Redis pub/sub → WebSocket) → Dashboard (Next.js) + GIS Map (Leaflet/OSM); on no match: Event Log (PostgreSQL) → searchable history.

---

## 8. Data Model (Key Entities)

**Watchlist Entry**  
`id, plate_number, category (stolen/wanted/missing/blacklisted), description, date_added, status (active/inactive)`

**Camera**  
`id, vendor, protocol, location_name, latitude, longitude, status`

**Detection Event**  
`id, camera_id, timestamp, plate_number, tracking_id, confidence, snapshot_url, matched (bool), watchlist_entry_id (nullable)`

**Alert**  
`id, detection_event_id, camera_id, timestamp, acknowledged (bool), acknowledged_by`
