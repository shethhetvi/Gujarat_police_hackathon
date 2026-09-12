import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def create_presentation():
    output_path = "/Users/HetviSheth/Library/CloudStorage/OneDrive-NavrachanaUniversity/Gujarat_police_hackathon/docs/presentation/SentinelGrid_Solution_Presentation.pptx"
    screenshots_dir = "/Users/HetviSheth/Library/CloudStorage/OneDrive-NavrachanaUniversity/Gujarat_police_hackathon/docs/presentation/screenshots"
    arch_dir = "/Users/HetviSheth/Library/CloudStorage/OneDrive-NavrachanaUniversity/Gujarat_police_hackathon/docs/architecture"

    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    # Color palette
    c_navy_bg = RGBColor(11, 15, 25)
    c_card_bg = RGBColor(30, 41, 59)
    c_white = RGBColor(255, 255, 255)
    c_gold = RGBColor(245, 158, 11)
    c_blue = RGBColor(56, 189, 248)
    c_gray = RGBColor(148, 163, 184)
    c_green = RGBColor(16, 185, 129)

    blank_slide_layout = prs.slide_layouts[6]

    def add_base_slide(title_text, subtitle_text="Gujarat Police CCTV Hackathon 2026"):
        slide = prs.slides.add_slide(blank_slide_layout)
        # Background
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = c_navy_bg
        bg.line.fill.background()

        # Top banner
        header = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.7), Inches(1.1))
        tf = header.text_frame
        tf.word_wrap = True
        p1 = tf.paragraphs[0]
        p1.text = title_text
        p1.font.bold = True
        p1.font.size = Pt(26)
        p1.font.color.rgb = c_white

        p2 = tf.add_paragraph()
        p2.text = subtitle_text
        p2.font.size = Pt(13)
        p2.font.color.rgb = c_blue
        return slide

    # SLIDE 1: Title
    s1 = prs.slides.add_slide(blank_slide_layout)
    bg1 = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
    bg1.fill.solid()
    bg1.fill.fore_color.rgb = c_navy_bg
    bg1.line.fill.background()

    tbox1 = s1.shapes.add_textbox(Inches(1.0), Inches(1.8), Inches(11.3), Inches(4.0))
    tf1 = tbox1.text_frame
    p = tf1.paragraphs[0]
    p.text = "GUJARAT POLICE CCTV HACKATHON 2026"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = c_gold
    
    p = tf1.add_paragraph()
    p.text = "SentinelGrid"
    p.font.size = Pt(54)
    p.font.bold = True
    p.font.color.rgb = c_white

    p = tf1.add_paragraph()
    p.text = "Unified Statewide Smart Surveillance & Predictive ANPR Interception Platform"
    p.font.size = Pt(22)
    p.font.color.rgb = c_blue

    p = tf1.add_paragraph()
    p.text = "\nTrack: Computer Vision & Multi-Camera Vehicle Tracking\nArchitecture: 3-Tier Hierarchical Edge-Cluster (HEC) Hybrid Model"
    p.font.size = Pt(14)
    p.font.color.rgb = c_gray

    # SLIDE 2: Problem Statement
    s2 = add_base_slide("Slide 2: Problem Statement & Operational Challenges")
    tbox2 = s2.shapes.add_textbox(Inches(0.8), Inches(1.7), Inches(6.5), Inches(5.2))
    tf2 = tbox2.text_frame
    tf2.word_wrap = True
    bullets2 = [
        ("Massive Scale & Siloed Systems", "Over 80,000 heterogeneous cameras spread across 33 districts, municipal corporations, NHAI toll plazas, and maritime ports running disparate VMS (Hikvision, CP Plus, Dahua, Axis, Milestone)."),
        ("The 200 Gbps WAN Bottleneck", "Streaming uncompressed video centrally from 80k cameras requires ~200 to 320 Gbps of bandwidth, causing severe GSWAN congestion and immense infrastructure cost."),
        ("Multi-Jurisdictional Blind Spots", "Inability to seamlessly track suspect vehicles moving across district and city commissionerate boundaries in real time."),
        ("Evidentiary Inadmissibility", "Captured CCTV footage often lacks tamper-proof cryptographic proof, creating admissibility challenges under Section 65B Indian Evidence Act / Section 63 BSA 2023.")
    ]
    for i, (b_title, b_desc) in enumerate(bullets2):
        p = tf2.paragraphs[0] if i == 0 else tf2.add_paragraph()
        p.text = f"• {b_title}: "
        p.font.bold = True
        p.font.size = Pt(14)
        p.font.color.rgb = c_gold
        p_sub = tf2.add_paragraph()
        p_sub.text = f"   {b_desc}\n"
        p_sub.font.size = Pt(12)
        p_sub.font.color.rgb = c_gray

    img2_path = os.path.join(screenshots_dir, "01_command_center_dashboard.png")
    if os.path.exists(img2_path):
        s2.shapes.add_picture(img2_path, Inches(7.5), Inches(1.8), Inches(5.0))

    # SLIDE 3: Architecture
    s3 = add_base_slide("Slide 3: High-Level Architecture (3-Tier HEC Model)")
    img3_path = os.path.join(arch_dir, "SentinelGrid_HLD_Architecture.png")
    if os.path.exists(img3_path):
        s3.shapes.add_picture(img3_path, Inches(0.8), Inches(1.6), Inches(11.7))

    # SLIDE 4: Technical Test Case Compliance
    s4 = add_base_slide("Slide 4: Technical Test Case Compliance (~50 Heterogeneous Cameras)")
    tbox4 = s4.shapes.add_textbox(Inches(0.8), Inches(1.7), Inches(5.8), Inches(5.2))
    tf4 = tbox4.text_frame
    tf4.word_wrap = True
    bullets4 = [
        ("Multi-Protocol Ingestion", "Successfully onboarded 50 heterogeneous camera feeds across RTSP, WebRTC (WHEP), HLS, and ONVIF from Gujarat Sentinel sandbox."),
        ("Authentic Distribution", "Covers Ahmedabad Commissionerate, Surat Smart City, Vadodara NH-48 Corridor, Rajkot RUDA, Mundra Port SEZ, and Kevadia SOU Zone."),
        ("Monotonic PTS Synchronization", "Uses Presentation Timestamps (PTS) to eliminate clock drift across multi-camera playback queues."),
        ("Robust Reconnect & Decoding", "Forced RTSP over TCP with exponential backoff auto-reconnect and non-fatal GOP join handling.")
    ]
    for i, (b_title, b_desc) in enumerate(bullets4):
        p = tf4.paragraphs[0] if i == 0 else tf4.add_paragraph()
        p.text = f"• {b_title}: "
        p.font.bold = True
        p.font.size = Pt(14)
        p.font.color.rgb = c_blue
        p_sub = tf4.add_paragraph()
        p_sub.text = f"   {b_desc}\n"
        p_sub.font.size = Pt(12)
        p_sub.font.color.rgb = c_gray

    img4_path = os.path.join(screenshots_dir, "03_50_camera_cctv_grid.png")
    if os.path.exists(img4_path):
        s4.shapes.add_picture(img4_path, Inches(6.8), Inches(1.8), Inches(5.7))

    # SLIDE 5: Live Vehicle Tracking & Trajectory Reconstruction
    s5 = add_base_slide("Slide 5: Live Vehicle Tracking & Trajectory Reconstruction")
    tbox5 = s5.shapes.add_textbox(Inches(0.8), Inches(1.7), Inches(5.8), Inches(5.2))
    tf5 = tbox5.text_frame
    tf5.word_wrap = True
    bullets5 = [
        ("Target Test Case", "Identified and continuously tracked target vehicle GJ01AB1234 (White Hyundai Creta / SUV)."),
        ("9 Sequential Checkpoints", "Traced transit across 9 major highway nodes: CAM01 Chimanbhai Bridge -> Paldi -> Adalaj -> Delight -> Mohanpura -> Vadodara NH-48 -> Bharuch Bridge -> Surat -> Navsari."),
        ("Extracted Telematics", "Captured license plate string, vehicle body classification (SUV), color (White), velocity speed (55-84 km/h), and monotonic timestamps."),
        ("Sub-Millisecond Screening", "Redis Cluster in-memory lookup verified active stolen vehicle FIR status in < 1 ms.")
    ]
    for i, (b_title, b_desc) in enumerate(bullets5):
        p = tf5.paragraphs[0] if i == 0 else tf5.add_paragraph()
        p.text = f"• {b_title}: "
        p.font.bold = True
        p.font.size = Pt(14)
        p.font.color.rgb = c_gold
        p_sub = tf5.add_paragraph()
        p_sub.text = f"   {b_desc}\n"
        p_sub.font.size = Pt(12)
        p_sub.font.color.rgb = c_gray

    img5_path = os.path.join(screenshots_dir, "06_gis_map_route_traversal.png")
    if os.path.exists(img5_path):
        s5.shapes.add_picture(img5_path, Inches(6.8), Inches(1.8), Inches(5.7))

    # SLIDE 6: AI Predictive Interception & PCR Dispatch
    s6 = add_base_slide("Slide 6: AI Predictive Interception & PCR Dispatch")
    tbox6 = s6.shapes.add_textbox(Inches(0.8), Inches(1.7), Inches(5.8), Inches(5.2))
    tf6 = tbox6.text_frame
    tf6.word_wrap = True
    bullets6 = [
        ("Escape Trajectory Modeling", "Real-time velocity vector engine analyzes vehicle heading and historical corridor speed to forecast downstream junctions."),
        ("Roadblock Barrier ETAs", "Predicts exact arrival time at police interception points (Barricade Alpha / Bravo) allowing proactive containment."),
        ("Automated Tactical PCR Routing", "Spatial radius indexing identifies nearest active PCR patrol vans (Sagar-22, Falcon-14)."),
        ("Operator Alerting", "Triggers Web Audio emergency sirens and synthetic voice announcements in control room.")
    ]
    for i, (b_title, b_desc) in enumerate(bullets6):
        p = tf6.paragraphs[0] if i == 0 else tf6.add_paragraph()
        p.text = f"• {b_title}: "
        p.font.bold = True
        p.font.size = Pt(14)
        p.font.color.rgb = c_green
        p_sub = tf6.add_paragraph()
        p_sub.text = f"   {b_desc}\n"
        p_sub.font.size = Pt(12)
        p_sub.font.color.rgb = c_gray

    img6_path = os.path.join(screenshots_dir, "07_predictive_intercept_advisory.png")
    if os.path.exists(img6_path):
        s6.shapes.add_picture(img6_path, Inches(6.8), Inches(1.8), Inches(5.7))

    # SLIDE 7: Section 65B Courtroom Evidence Integrity
    s7 = add_base_slide("Slide 7: Section 65B Indian Evidence Act Forensic Integrity")
    tbox7 = s7.shapes.add_textbox(Inches(0.8), Inches(1.7), Inches(5.8), Inches(5.2))
    tf7 = tbox7.text_frame
    tf7.word_wrap = True
    bullets7 = [
        ("Automated Legal Dossiers", "Generates official electronic record certificates compliant with Section 65B(4) Indian Evidence Act / Section 63 BSA 2023."),
        ("Cryptographic Chain of Custody", "Every frame and metadata record is hashed with SHA-256 (salted with Camera Hardware UUID + Monotonic PTS)."),
        ("Vahan & Sarathi Telematics", "Integrates registered owner, chassis number, engine number, insurance status, and active FIR record."),
        ("Verification QR Code", "Enables court magistrates and investigating officers to verify certificate authenticity instantly.")
    ]
    for i, (b_title, b_desc) in enumerate(bullets7):
        p = tf7.paragraphs[0] if i == 0 else tf7.add_paragraph()
        p.text = f"• {b_title}: "
        p.font.bold = True
        p.font.size = Pt(14)
        p.font.color.rgb = c_blue
        p_sub = tf7.add_paragraph()
        p_sub.text = f"   {b_desc}\n"
        p_sub.font.size = Pt(12)
        p_sub.font.color.rgb = c_gray

    img7_path = os.path.join(screenshots_dir, "09_section_65b_forensic_dossier.png")
    if os.path.exists(img7_path):
        s7.shapes.add_picture(img7_path, Inches(6.8), Inches(1.8), Inches(5.7))

    # SLIDE 8: Scalability Blueprint (~80,000 Cameras)
    s8 = add_base_slide("Slide 8: Statewide 80,000 Camera Scalability Blueprint")
    tbox8 = s8.shapes.add_textbox(Inches(0.8), Inches(1.7), Inches(11.7), Inches(5.2))
    tf8 = tbox8.text_frame
    tf8.word_wrap = True
    bullets8 = [
        ("Bill of Materials", "66 High-Density 2U Edge Servers (2 per District) with 264 NVIDIA L4 GPUs + Gandhinagar SCCC Core & Disaster Recovery Datacenter."),
        ("99.8% Bandwidth Reduction", "Transmits metadata and 10KB match crops over GSWAN (~380 Mbps total) rather than ~200 Gbps raw video."),
        ("Tiered Storage Architecture", "Hot Storage (7 days NVMe 1080p continuous at edge) -> Warm Storage (90 days central object storage) -> Cold Archive (7 years encrypted Section 65B dossiers)."),
        ("High Availability & Offline Autonomy", "Active-Active DC-DR (Gandhinagar + Vadodara) with RPO < 1s, RTO < 15s. District edge nodes operate autonomously during network severance.")
    ]
    for i, (b_title, b_desc) in enumerate(bullets8):
        p = tf8.paragraphs[0] if i == 0 else tf8.add_paragraph()
        p.text = f"• {b_title}: "
        p.font.bold = True
        p.font.size = Pt(15)
        p.font.color.rgb = c_gold
        p_sub = tf8.add_paragraph()
        p_sub.text = f"   {b_desc}\n"
        p_sub.font.size = Pt(13)
        p_sub.font.color.rgb = c_gray

    # SLIDE 9: Statewide Rollout Plan
    s9 = add_base_slide("Slide 9: 12-Month Statewide Phased Rollout Plan")
    tbox9 = s9.shapes.add_textbox(Inches(0.8), Inches(1.7), Inches(11.7), Inches(5.2))
    tf9 = tbox9.text_frame
    tf9.word_wrap = True
    phases = [
        ("Phase 1 (Months 1-3) — Gandhinagar SCCC Core & Ahmedabad Pilot", "10,000 cameras. Onboard Ahmedabad Police Commissionerate, SG Highway, AMC Smart City, and validate 65B legal workflows."),
        ("Phase 2 (Months 4-6) — Major Industrial & City Hubs", "25,000 cameras. Expand to Surat (SMC), Vadodara (VCP), Rajkot (RUDA), Jamnagar, and integrate NHAI expressways (NH-48, NE-1)."),
        ("Phase 3 (Months 7-9) — Critical Infrastructure & Coastal Grid", "25,000 cameras. Integrate Mundra/Kandla ports, GMB coastal grid, pilgrimage corridors (Somnath/Dwarka), and border checkposts."),
        ("Phase 4 (Months 10-12) — Full Statewide Coverage & Certification", "20,000 cameras. Onboard remaining rural police stations, taluka junctions, complete statewide 80,000 camera load test and ISO/IEC 27001 audit.")
    ]
    for i, (p_title, p_desc) in enumerate(phases):
        p = tf9.paragraphs[0] if i == 0 else tf9.add_paragraph()
        p.text = f"[{p_title}]: "
        p.font.bold = True
        p.font.size = Pt(14)
        p.font.color.rgb = c_blue
        p_sub = tf9.add_paragraph()
        p_sub.text = f"   {p_desc}\n"
        p_sub.font.size = Pt(12)
        p_sub.font.color.rgb = c_gray

    # SLIDE 10: Conclusion & Differentiators
    s10 = add_base_slide("Slide 10: Conclusion & Competitive Differentiators")
    tbox10 = s10.shapes.add_textbox(Inches(0.8), Inches(1.7), Inches(6.0), Inches(5.2))
    tf10 = tbox10.text_frame
    tf10.word_wrap = True
    diffs = [
        ("99.8% WAN Bandwidth Reduction", "Edge AI filtering resolves statewide network saturation."),
        ("Vendor-Agnostic Interoperability", "No hardware rip-and-replace for CP Plus, Hikvision, Dahua, or Axis."),
        ("Predictive Police Action", "Moves law enforcement from passive recording to active roadblock interception."),
        ("Court-Admissible Forensics", "Guarantees Section 65B / BSA 2023 legal integrity with SHA-256 seals."),
        ("Fully Operational Demo", "Live system running with 50 camera streams, WebSocket alerts, and GIS dashboard.")
    ]
    for i, (d_title, d_desc) in enumerate(diffs):
        p = tf10.paragraphs[0] if i == 0 else tf10.add_paragraph()
        p.text = f"✔ {d_title}: "
        p.font.bold = True
        p.font.size = Pt(13)
        p.font.color.rgb = c_green
        p_sub = tf10.add_paragraph()
        p_sub.text = f"   {d_desc}\n"
        p_sub.font.size = Pt(11.5)
        p_sub.font.color.rgb = c_gray

    img10_path = os.path.join(screenshots_dir, "05_live_challenge_alert_trigger.png")
    if os.path.exists(img10_path):
        s10.shapes.add_picture(img10_path, Inches(7.0), Inches(1.8), Inches(5.5))

    prs.save(output_path)
    print(f"Generated Presentation Deck at: {output_path}")

if __name__ == "__main__":
    create_presentation()
