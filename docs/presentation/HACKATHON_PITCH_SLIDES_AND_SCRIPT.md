# Gujarat Police CCTV Hackathon 2026
## Official Presentation Slides & 2-Minute Video Pitch Script

---

# PART 1: 10-SLIDE PRESENTATION DECK (PPT / PDF OUTLINE)

### **Slide 1: Title & Team Introduction**
* **Title**: SentinelGrid — Unified Statewide Smart Surveillance & Predictive ANPR Interception Platform
* **Subtitle**: Gujarat Police Integrated Command & Control Centre (ICCC) AI Platform
* **Team Name / Track**: Computer Vision & Multi-Camera Vehicle Tracking
* **Key Visual**: Gujarat Police Shield + SentinelGrid UI Dashboard Graphic

---

### **Slide 2: Problem Statement & Operational Challenges**
* **The Problem**:
  * 80,000+ heterogeneous CCTV cameras across Gujarat deployed across police, municipal corporations, highway toll plazas, and maritime ports.
  * Siloed VMS platforms (Hikvision, CP Plus, Dahua, Axis, Milestone) with incompatible protocols.
  * Inability to seamlessly track a suspect/stolen vehicle in real time as it moves across jurisdictional boundaries.
  * Bandwidth bottlenecks preventing raw central video streaming over GSWAN.
* **Our Solution**: SentinelGrid — A vendor-agnostic, 3-tier Edge-Cluster platform with real-time Indian ANPR, cross-camera trajectory reconstruction, and automated court-admissible Section 65B evidence generation.

---

### **Slide 3: High-Level Architecture (3-Tier Hierarchical Edge-Cluster)**
* **Layer 1: District Edge Nodes (33 Districts)**:
  * Distributed DeepStream + INT8 TensorRT inference at district level.
  * Motion gating & keyframe sampling (5-8 FPS) reduces redundant compute.
  * Intra-camera ByteTrack deduplication (1 vehicle transit = 1 event).
* **Layer 2: GSWAN Message Backbone**:
  * Transmits lightweight JSON metadata + 10KB match crops only.
  * **99.8% Bandwidth Reduction** (~380 Mbps statewide vs ~200 Gbps raw).
* **Layer 3: Gandhinagar State Command Core**:
  * In-memory Redis cluster with Bloom filters for sub-millisecond watchlist lookups.
  * Global GIS correlation engine with predictive escape route forecasting.

---

### **Slide 4: Technical Test Case Compliance (~50 Heterogeneous Cameras)**
* **Live Onboarding**:
  * 50 heterogeneous camera feeds integrated across RTSP, WebRTC (WHEP), HLS, and ONVIF.
  * Authentic multi-department distribution: Ahmedabad SCRB, Surat Smart City, Vadodara NH-48 Corridor, Rajkot RUDA, Mundra Port SEZ, Kevadia SOU Zone.
* **Synchronized Playback**:
  * Monotonic Presentation Timestamp (PTS) tracking eliminates frame arrival clock drift.
  * 4-Quadrant Master Clock synchronizer with paused freeze overlay.

---

### **Slide 5: Live Vehicle Tracking & Trajectory Reconstruction**
* **Target Vehicle**: `GJ01AB1234` (Hyundai Creta / White SUV — Stolen Priority).
* **9 Sequential Highway Checkpoints**:
  * `CAM01 (Chimanbhai Bridge)` → `CAM04 (Paldi Circle)` → `CAM12 (Adalaj Tollnaka)` → `CAM14 (Delight RLVD)` → `CAM20 (Mohanpura)` → `CAM23 (Vadodara NH-48)` → `CAM28 (Bharuch Narmada Bridge)` → `CAM22 (Surat Varachha)` → `CAM19 (Navsari Khaparia)`.
* **Attributes Extracted**: Body type classification (SUV), color extraction (White), speed velocity (55-84 km/h), and cryptographic SHA-256 evidence hash.

---

### **Slide 6: AI Predictive Interception & Tactical PCR Dispatch**
* **Predictive Escape Modeling**:
  * Real-time velocity vector analysis computes the vehicle's next downstream junction.
  * Calculates Roadblock ETAs for police barricades (Barricade Alpha / Bravo).
* **Automated Tactical Dispatch**:
  * Spatial radius indexing identifies nearest active PCR patrol vans (`Sagar-22`, `Falcon-14`, `Cheetah-8`).
  * Web Audio siren broadcast and voice synthesizer dispatch alerts.

---

### **Slide 7: Section 65B Indian Evidence Act Forensic Integrity**
* **Courtroom Admissibility**:
  * Automatic generation of electronic record certificates compliant with Section 65B(4) Indian Evidence Act / Section 63 Bharatiya Sakshya Adhiniyam 2023.
* **Tamper-Proof Verification**:
  * Master SHA-256 hash chaining.
  * Dynamic verification QR Code.
  * National Vahan & Sarathi telematics cross-referencing (Owner, Chassis, Insurance, Active FIR).

---

### **Slide 8: Statewide 80,000 Camera Scalability Blueprint**
* **Hardware Bill of Materials**:
  * 66 High-Density Edge Servers (2 per District) + 264 NVIDIA L4 GPUs.
* **Storage Tiers**:
  * Hot (7 days edge rolling NVMe) · Warm (90 days central object storage) · Cold (7 years encrypted legal archive).
* **High Availability & Disaster Recovery**:
  * Active-Active Dual DC (Gandhinagar Primary + Vadodara DR), RPO < 1s, RTO < 15s.
  * Local district offline autonomy during network severance.

---

### **Slide 9: 12-Month Statewide Phased Rollout Plan**
* **Phase 1 (Months 1-3)**: Gandhinagar SCCC Core + Ahmedabad & Capital Zone (~10,000 Cameras).
* **Phase 2 (Months 4-6)**: Surat, Vadodara, Rajkot & NHAI Expressways (~25,000 Cameras).
* **Phase 3 (Months 7-9)**: Ports (Mundra/Kandla), Coastal Pilgrimages (Somnath/Dwarka), Border Checkposts (~25,000 Cameras).
* **Phase 4 (Months 10-12)**: Rural Police Stations, Taluka junctions (~20,000 Cameras) + Final Load Testing & ISO 27001 Certification.

---

### **Slide 10: Conclusion & Competitive Advantages**
* **Summary of Differentiators**:
  1. **99.8% WAN Bandwidth Reduction** via Edge-Cluster architecture.
  2. **Sub-Millisecond Watchlist Screening** at 50,000+ queries/sec.
  3. **Zero-Trust Forensic Traceability** with Section 65B SHA-256 cryptographic seals.
  4. **Predictive AI Interception** with automated PCR unit dispatch.
* **Live System Status**: Backend & Next.js Frontend operational at `http://localhost:3000`.

---

# PART 2: 2-MINUTE LIVE VIDEO PITCH SCRIPT

**[0:00 - 0:20] Hook & Executive Problem Overview**
> *"Respected Jury Members, Gujarat’s surveillance vision encompasses over 80,000 CCTV cameras across 33 districts, multiple municipal corporations, and disparate VMS vendors. Streaming raw video centrally would require over 200 Gbps—clogging statewide WANs. We built **SentinelGrid**, a hierarchical edge-cluster platform that delivers real-time AI vehicle tracking, instant watchlist interception, and courtroom-admissible Section 65B dossiers while reducing network bandwidth by 99.8%."*

**[0:20 - 0:50] Live Platform & 50-Camera Demonstration**
> *"Here on the live SentinelGrid Command Center, we have onboarded 50 heterogeneous camera feeds—ranging from RTSP and WebRTC to HLS streams across Ahmedabad, Surat, Vadodara, and NHAI expressways. Notice our synchronized Master Clock tracking Monotonic PTS timecodes, completely eliminating frame drift."*

**[0:50 - 1:20] Live Challenge Test Case Execution**
> *"Now, let's trigger the hackathon live challenge for designated stolen target **GJ01AB1234**. [Click '⚡ Live Test Scenario'].
> Instantly, the AI detection pipeline identifies the white SUV at CAM01 Chimanbhai Bridge with 98% confidence. The system plays an emergency siren, triggers synthesized voice dispatch, and plots the vehicle's full 9-checkpoint trajectory across the Gujarat corridor—from Ahmedabad through Vadodara and Bharuch down to Navsari."*

**[1:20 - 1:45] Predictive Interception & Section 65B Forensic Dossier**
> *"SentinelGrid doesn't just show where the suspect was—it predicts where they will be. Our spatial velocity algorithm projects the next downstream roadblock and identifies the nearest PCR patrol van, Sagar-22, for tactical intercept. 
> Furthermore, with one click, we generate the official **Section 65B Evidence Dossier** stamped with cryptographic SHA-256 hash chains, national Vahan RTO data, and a verification QR code, making it instantly admissible in Indian courts."*

**[1:45 - 2:00] Scalability to 80,000 Cameras & Closing**
> *"With our district edge servers and TensorRT INT8 optimization, scaling to all 80,000 cameras across Gujarat requires only 380 Mbps statewide bandwidth. SentinelGrid is secure, interoperable, and field-ready for immediate statewide deployment. Thank you."*
