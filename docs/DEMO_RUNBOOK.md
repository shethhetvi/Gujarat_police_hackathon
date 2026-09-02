# SentinelGrid — Gujarat Police CCTV Hackathon Demo Runbook

This guide provides a crisp 3-to-5 minute live demonstration script for jury evaluation during the Gujarat Police CCTV Hackathon.

---

## 🎯 Demonstration Objective
Showcase an operational, vendor-neutral VMS and AI video analytics platform capable of:
1. Ingesting multi-vendor CCTV streams (RTSP/ONVIF) across Gujarat junctions.
2. Detecting, tracking, and reading license plates (ANPR) in real-time.
3. Screening vehicle sightings against an active police watchlist.
4. Dispatching instant sub-second alerts with photographic crops.
5. Reconstructing cross-camera highway travel trajectories on an interactive GIS map.
6. Filtering audit trails and exporting an official incident dossier (JSON).

---

## ⏱️ Step-by-Step Presentation Script

### Act 1: Surveillance Network & Vendor Neutrality (1 Min)
1. **Navigate to**: `Live Feeds` (`http://localhost:3000` -> click `Live Feeds`).
2. **Talking Point**:
   > *"Gujarat operates thousands of heterogeneous cameras across Hikvision, CP Plus, Dahua, Axis, and Bosch. SentinelGrid provides a unified, vendor-neutral abstraction layer over standard RTSP/ONVIF streams."*
3. **Live Action**:
   - Point out the active surveillance HUD with live IST timecodes and AI inference targeting frames.
   - Use the **Vendor Filter** dropdown to filter by `Hikvision`, `CP Plus`, etc.
   - Click **`📹 + Onboard CCTV Feed`** to show how easily a new junction (e.g. *Rajkot Kalawad Road*) is provisioned on-the-fly without restarting servers or writing code.

---

### Act 2: Watchlist Administration (1 Min)
1. **Navigate to**: `Watchlist DB`.
2. **Talking Point**:
   > *"Control room administrators maintain high-priority targets: stolen vehicles, wanted suspects, or blacklisted transports with instant database syncing."*
3. **Live Action**:
   - Search existing targets in the search box.
   - Click **`+ Add Target Plate`** and register:
     - Plate: `GJ01AB1234` (or any custom plate)
     - Category: `Stolen`
     - Priority: `CRITICAL`
   - Notice the table updates immediately and the KPI counter reflects the new target.
   - Demonstrate the **Remove** button to show complete CRUD management.

---

### Act 3: Live Detection & Real-Time Alert Broadcast (1 Min)
1. **Navigate to**: `Command Center`.
2. **Talking Point**:
   > *"When a vehicle passes an equipped camera, YOLOv8 detects the vehicle, ByteTrack tracks its trajectory, and the OCR engine reads the plate. If it matches the watchlist, an alert is broadcast within milliseconds via WebSockets."*
3. **Live Action**:
   - Click the top navbar button: **`⚡ Simulate Alert`**.
   - Notice the instant audio-visual flash and new alert card in the right drawer.
   - **Click on the alert card**:
     - The detailed **Alert Modal** pops up.
     - Highlight the **automated plate snapshot crop**, timestamp, camera location, and severity.
   - Click **`🗺️ Track Route on GIS Map`** inside the modal.

---

### Act 4: GIS Multi-Camera Route Reconstruction (1 Min)
1. **Current View**: `GIS Map & Tracking`.
2. **Talking Point**:
   > *"A single sighting is helpful; a multi-camera movement history is actionable for field intercept teams. SentinelGrid links repeat detections of the same plate across highway checkpoints."*
3. **Live Action**:
   - Click the top navbar button: **`🗺️ Simulate Route`**.
   - Watch the GIS Radar visualize sequential checkpoint hits across Gujarat nodes (Ahmedabad -> Vadodara -> Surat -> Rajkot).
   - Point out:
     - The **dynamic SVG route polyline** connecting nodes.
     - The **pulsing checkpoint node markers**.
     - The **Chronological Trajectory Timeline** at the bottom showing exact timestamps.

---

### Act 5: Search, Audit Trail & Official Dossier (30 Sec)
1. **Navigate to**: `Search & History`.
2. **Talking Point**:
   > *"Every single sighting—whether matched or cleared—is permanently indexed for forensic investigations."*
3. **Live Action**:
   - Filter detections using the **Camera dropdown** or **Match Status** dropdown (`Watchlist Hits Only`).
   - Click **`📄 Export Dossier (JSON)`**.
   - Show the generated JSON file with complete cryptographic audit timestamps, vehicle confidence scores, and checkpoint coordinates ready for court submission.

---

## 🛠️ Quick Verification Commands

### Run Backend Server (FastAPI)
```bash
cd backend
source venv/bin/activate  # or activate your python env
uvicorn app.main:app --reload --port 8000
```

### Run Frontend Dashboard (Next.js)
```bash
cd frontend
npm run dev
```

### Run Multi-feed Ingestion Simulator
```bash
python simulation/stream_simulator.py
```
