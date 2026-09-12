import os
from fpdf import FPDF
from PIL import Image

def generate_pdf_deck():
    pdf_path = "/Users/HetviSheth/Library/CloudStorage/OneDrive-NavrachanaUniversity/Gujarat_police_hackathon/docs/presentation/SentinelGrid_Solution_Presentation.pdf"
    
    # 16:9 aspect ratio landscape: 297mm x 167mm or standard A4 landscape (297 x 210)
    pdf = FPDF(orientation='L', unit='mm', format='A4')
    pdf.set_auto_page_break(auto=True, margin=10)
    
    # Slide data
    slides = [
        {
            "title": "SentinelGrid — Unified Statewide Smart Surveillance",
            "subtitle": "Gujarat Police CCTV Hackathon 2026 | Computer Vision & Vehicle Tracking",
            "points": [
                "Track: Computer Vision & Multi-Camera Vehicle Tracking",
                "Architecture: 3-Tier Hierarchical Edge-Cluster (HEC) Hybrid Architecture",
                "Scalability: Designed for statewide deployment (~80,000 cameras across 33 districts)",
                "Compliance: Full compliance with Section 65B Indian Evidence Act / Section 63 BSA 2023",
                "Live Platform: 50 heterogeneous camera feeds integrated across RTSP, WebRTC, and HLS"
            ],
            "image": "/Users/HetviSheth/Library/CloudStorage/OneDrive-NavrachanaUniversity/Gujarat_police_hackathon/docs/presentation/screenshots/01_command_center_dashboard.png"
        },
        {
            "title": "Slide 2: Problem Statement & Operational Challenges",
            "subtitle": "Critical bottlenecks in statewide multi-agency surveillance",
            "points": [
                "Siloed VMS Platforms: Incompatible systems (CP Plus, Hikvision, Dahua, Axis, Milestone).",
                "The 200 Gbps WAN Choke: Centralizing raw video from 80,000 cameras is unviable over GSWAN.",
                "Jurisdictional Blind Spots: Tracking suspect vehicles across district boundaries is slow and manual.",
                "Evidentiary Challenges: Uncertified CCTV clips frequently face admissibility hurdles in court."
            ],
            "image": "/Users/HetviSheth/Library/CloudStorage/OneDrive-NavrachanaUniversity/Gujarat_police_hackathon/docs/presentation/screenshots/03_50_camera_cctv_grid.png"
        },
        {
            "title": "Slide 3: High-Level Architecture (3-Tier HEC Model)",
            "subtitle": "Edge AI Ingestion + GSWAN Backbone + Gandhinagar SCCC Core",
            "points": [
                "Tier 1 (Field Edge): Ingestion middleware across RTSP, ONVIF Profile S/G/T, WHEP, and HLS.",
                "Tier 2 (33 District Control Centres): DeepStream + INT8 TensorRT YOLOv8, ByteTrack & Indian ANPR.",
                "Tier 3 (State Command Core): Sub-millisecond Redis matching, statewide GIS correlation, and dispatch.",
                "Bandwidth Savings: 99.8% reduction in WAN bandwidth (~380 Mbps vs ~200 Gbps raw video)."
            ],
            "image": "/Users/HetviSheth/Library/CloudStorage/OneDrive-NavrachanaUniversity/Gujarat_police_hackathon/docs/architecture/SentinelGrid_HLD_Architecture.png"
        },
        {
            "title": "Slide 4: Technical Test Case Compliance (~50 Cameras)",
            "subtitle": "Live sandbox ingestion and multi-feed synchronization",
            "points": [
                "50 Heterogeneous Feeds: Ahmedabad SCRB, Surat Smart City, Vadodara NH-48, Rajkot, Mundra Port.",
                "Monotonic PTS Synchronization: Eliminates clock drift and frame arrival skew across feeds.",
                "Resilient Networking: Forced RTSP over TCP with exponential backoff auto-reconnect.",
                "GOP Boundary Handling: Gracefully decodes mid-stream H.264/H.265 join frames without dropping."
            ],
            "image": "/Users/HetviSheth/Library/CloudStorage/OneDrive-NavrachanaUniversity/Gujarat_police_hackathon/docs/presentation/screenshots/04_live_camera_feed_ai_overlay.png"
        },
        {
            "title": "Slide 5: Live Vehicle Tracking & Trajectory Reconstruction",
            "subtitle": "Full corridor traversal tracking for designated target GJ01AB1234",
            "points": [
                "Target Vehicle: GJ01AB1234 (White Hyundai Creta SUV - Stolen Priority).",
                "9 Checkpoints Traced: Chimanbhai Bridge -> Paldi -> Adalaj -> Delight -> Mohanpura -> Vadodara -> Bharuch -> Surat -> Navsari.",
                "Telemetry Captured: Body type (SUV), Color (White), Speed (55-84 km/h), Cryptographic PTS hash.",
                "Sub-Millisecond Screening: In-memory Redis Bloom filter match confirmed in < 1 ms."
            ],
            "image": "/Users/HetviSheth/Library/CloudStorage/OneDrive-NavrachanaUniversity/Gujarat_police_hackathon/docs/presentation/screenshots/06_gis_map_route_traversal.png"
        },
        {
            "title": "Slide 6: AI Predictive Interception & PCR Dispatch",
            "subtitle": "Predictive velocity modeling and tactical roadblock containment",
            "points": [
                "Predictive Trajectory: Computes heading vector to forecast next downstream road junctions.",
                "Roadblock ETAs: Predicts exact arrival time at Barricade Alpha and Barricade Bravo.",
                "Nearest PCR Unit Routing: Automatically indexes and dispatches closest patrol vans (Sagar-22).",
                "Tactical Siren Dispatch: Browser Web Audio siren broadcasts and voice synthesizer alerts."
            ],
            "image": "/Users/HetviSheth/Library/CloudStorage/OneDrive-NavrachanaUniversity/Gujarat_police_hackathon/docs/presentation/screenshots/07_predictive_intercept_advisory.png"
        },
        {
            "title": "Slide 7: Section 65B Indian Evidence Act Admissibility",
            "subtitle": "Cryptographically sealed court-admissible electronic dossiers",
            "points": [
                "Legal Admissibility: 100% compliant with Section 65B(4) IEA and Section 63 BSA 2023.",
                "SHA-256 Hash Chain: Master cryptographic hash salted with Camera UUID and PTS timestamp.",
                "National RTO Integration: Vahan & Sarathi cross-referencing (Chassis, Engine, Owner, Active FIR).",
                "Instant Verification: Tamper-evident QR code for judicial inspection."
            ],
            "image": "/Users/HetviSheth/Library/CloudStorage/OneDrive-NavrachanaUniversity/Gujarat_police_hackathon/docs/presentation/screenshots/09_section_65b_forensic_dossier.png"
        },
        {
            "title": "Slide 8: Statewide 80,000 Camera Scalability Blueprint",
            "subtitle": "Enterprise hardware, network sizing, and high availability",
            "points": [
                "Hardware BOM: 66 2U Edge Servers (2 per District) + 264 NVIDIA L4 GPUs statewide.",
                "Tiered Storage: Hot (7-day NVMe edge) -> Warm (90-day object store) -> Cold (7-year archive).",
                "Active-Active DC-DR: Dual datacenter (Gandhinagar + Vadodara) with RPO < 1s, RTO < 15s.",
                "District Autonomy: District edge servers continue local ANPR matching during WAN outage."
            ],
            "image": "/Users/HetviSheth/Library/CloudStorage/OneDrive-NavrachanaUniversity/Gujarat_police_hackathon/docs/architecture/SentinelGrid_Workflow_Integration_Diagram.png"
        }
    ]
    for slide in slides:
        slide["title"] = slide["title"].replace("—", "-").replace("–", "-")
        slide["subtitle"] = slide["subtitle"].replace("—", "-").replace("–", "-")
        clean_pts = []
        for pt in slide["points"]:
            clean_pts.append(pt.replace("—", "-").replace("–", "-").replace("->", "to").replace("~", "approx "))
        slide["points"] = clean_pts

        pdf.add_page()
        # Dark Background
        pdf.set_fill_color(11, 15, 25)
        pdf.rect(0, 0, 297, 210, 'F')
        
        # Header banner
        pdf.set_text_color(255, 255, 255)
        pdf.set_font('Helvetica', 'B', 15)
        pdf.set_xy(15, 12)
        pdf.cell(267, 8, slide["title"])
        
        pdf.set_text_color(56, 189, 248)
        pdf.set_font('Helvetica', '', 10)
        pdf.set_xy(15, 21)
        pdf.cell(267, 6, slide["subtitle"])
        
        # Draw separator line
        pdf.set_draw_color(30, 41, 59)
        pdf.set_line_width(0.8)
        pdf.line(15, 28, 282, 28)
        
        # Left column: bullet points
        y = 35
        for pt in slide["points"]:
            pdf.set_xy(15, y)
            pdf.set_text_color(245, 158, 11)
            pdf.cell(5, 5, "-")
            pdf.set_xy(22, y)
            pdf.set_text_color(226, 232, 240)
            pdf.set_font('Helvetica', '', 9.5)
            pdf.multi_cell(115, 5.5, pt)
            y = pdf.get_y() + 3
            
        # Right column: Image
        if os.path.exists(slide["image"]):
            try:
                pdf.image(slide["image"], x=145, y=34, w=138)
            except Exception as e:
                print(f"Error embedding image {slide['image']}: {e}")
                
    pdf.output(pdf_path)
    print(f"Generated PDF Presentation at: {pdf_path}")

if __name__ == "__main__":
    generate_pdf_deck()
