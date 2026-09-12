import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from PIL import Image

def create_hld_diagram():
    output_path = "/Users/HetviSheth/Library/CloudStorage/OneDrive-NavrachanaUniversity/Gujarat_police_hackathon/docs/architecture/SentinelGrid_HLD_Architecture.png"
    
    fig, ax = plt.subplots(figsize=(16, 10), dpi=300)
    fig.patch.set_facecolor('#0B0F19')
    ax.set_facecolor('#0B0F19')
    
    # Title
    ax.text(0.5, 0.96, "SentinelGrid — High-Level Design (HLD) Architecture", 
            fontsize=20, fontweight='bold', color='#FFFFFF', ha='center', va='center')
    ax.text(0.5, 0.93, "3-Tier Hierarchical Edge-Cluster (HEC) Statewide Architecture (~80,000 Cameras)", 
            fontsize=12, color='#94A3B8', ha='center', va='center')
    
    # Colors
    c_tier_bg = '#131C31'
    c_card_bg = '#1E293B'
    c_card_border = '#38BDF8'
    c_text_main = '#F8FAFC'
    c_text_sub = '#94A3B8'
    c_accent_green = '#10B981'
    c_accent_orange = '#F59E0B'
    c_accent_purple = '#818CF8'
    
    # 3 Main Tiers
    # Tier 1: Ingestion
    tier1_box = patches.FancyBboxPatch((0.04, 0.08), 0.26, 0.81, boxstyle="round,pad=0.02,rounding_size=0.03",
                                       fc=c_tier_bg, ec='#2563EB', lw=2)
    ax.add_patch(tier1_box)
    ax.text(0.17, 0.86, "TIER 1: FIELD CAMERAS & VMS", fontsize=12, fontweight='bold', color='#60A5FA', ha='center')
    ax.text(0.17, 0.835, "80,000+ Statewide Endpoints", fontsize=9, color=c_text_sub, ha='center')
    
    tier1_cards = [
        ("Smart City & Urban Police", "Hikvision, CP Plus, Axis\nAhmedabad, Surat, Vadodara, Rajkot", 0.70),
        ("Highways & Expressways", "NHAI Toll Corridors, NE-1, NH-48\nSpeed & RLVD Enforcement Cams", 0.52),
        ("Critical Infrastructure", "Mundra / Kandla Ports, GMB Coastal\nPilgrimage Corridors (Somnath/Dwarka)", 0.34),
        ("Multi-Protocol Ingestion", "Forced RTSP/TCP, ONVIF Profile S/G/T\nWebRTC (WHEP), HTTPS HLS Feeds", 0.16)
    ]
    for title, desc, y in tier1_cards:
        card = patches.FancyBboxPatch((0.06, y - 0.05), 0.22, 0.11, boxstyle="round,pad=0.015,rounding_size=0.02",
                                     fc=c_card_bg, ec='#334155', lw=1.2)
        ax.add_patch(card)
        ax.text(0.08, y + 0.03, title, fontsize=10, fontweight='bold', color=c_text_main)
        ax.text(0.08, y - 0.02, desc, fontsize=8, color=c_text_sub)
        
    # Tier 2: District Edge
    tier2_box = patches.FancyBboxPatch((0.36, 0.08), 0.28, 0.81, boxstyle="round,pad=0.02,rounding_size=0.03",
                                       fc=c_tier_bg, ec=c_accent_orange, lw=2)
    ax.add_patch(tier2_box)
    ax.text(0.50, 0.86, "TIER 2: DISTRICT CONTROL CENTRES", fontsize=12, fontweight='bold', color=c_accent_orange, ha='center')
    ax.text(0.50, 0.835, "33 District Edge Nodes (2U GPU Servers)", fontsize=9, color=c_text_sub, ha='center')
    
    tier2_cards = [
        ("Hardware Acceleration", "2x 2U Server per DCC (AMD EPYC)\n4x NVIDIA L4 (24GB) per node (DeepStream)", 0.70),
        ("Edge AI Inference Pipeline", "TensorRT INT8 YOLOv8 Vehicle Detector\nByteTrack Intra-Camera Deduplication", 0.52),
        ("Indian ANPR & OCR Engine", "High-accuracy plate OCR with phonetic\ncorrection (O<->0, I<->1, B<->8, S<->5)", 0.34),
        ("Local Resilient Buffer", "7-Day Hot 1080p Continuous NVMe Storage\nLocal RocksDB cache for link resilience", 0.16)
    ]
    for title, desc, y in tier2_cards:
        card = patches.FancyBboxPatch((0.38, y - 0.05), 0.24, 0.11, boxstyle="round,pad=0.015,rounding_size=0.02",
                                     fc=c_card_bg, ec='#334155', lw=1.2)
        ax.add_patch(card)
        ax.text(0.40, y + 0.03, title, fontsize=10, fontweight='bold', color=c_text_main)
        ax.text(0.40, y - 0.02, desc, fontsize=8, color=c_text_sub)
        
    # Tier 3: State Command Core
    tier3_box = patches.FancyBboxPatch((0.70, 0.08), 0.26, 0.81, boxstyle="round,pad=0.02,rounding_size=0.03",
                                       fc=c_tier_bg, ec=c_accent_green, lw=2)
    ax.add_patch(tier3_box)
    ax.text(0.83, 0.86, "TIER 3: STATE COMMAND CORE", fontsize=12, fontweight='bold', color=c_accent_green, ha='center')
    ax.text(0.83, 0.835, "Gandhinagar SCCC & Disaster Recovery", fontsize=9, color=c_text_sub, ha='center')
    
    tier3_cards = [
        ("Sub-Millisecond Watchlist", "Redis Cluster with Bloom Filters\n50,000+ queries/sec matching engine", 0.70),
        ("Statewide GIS Trajectory", "Cross-camera route correlation\nPredictive Escape & Roadblock ETA modeling", 0.52),
        ("Section 65B Court Evidence", "Automated tamper-evident electronic dossiers\nMaster SHA-256 hash chains + QR verification", 0.34),
        ("Tactical Police Dispatch", "Next.js 15 Command Center UI, WebSockets\nAudible sirens & PCR Van unit dispatch", 0.16)
    ]
    for title, desc, y in tier3_cards:
        card = patches.FancyBboxPatch((0.72, y - 0.05), 0.22, 0.11, boxstyle="round,pad=0.015,rounding_size=0.02",
                                     fc=c_card_bg, ec='#334155', lw=1.2)
        ax.add_patch(card)
        ax.text(0.74, y + 0.03, title, fontsize=10, fontweight='bold', color=c_text_main)
        ax.text(0.74, y - 0.02, desc, fontsize=8, color=c_text_sub)
        
    # Connectors & Bandwidth Highlights
    # Arrow 1 -> 2
    ax.annotate('', xy=(0.36, 0.50), xytext=(0.30, 0.50),
                arrowprops=dict(arrowstyle="-|>", color='#60A5FA', lw=3, mutation_scale=20))
    ax.text(0.33, 0.53, "Local LAN/Ring\nRTSP / ONVIF", fontsize=8, fontweight='bold', color='#60A5FA', ha='center')
    
    # Arrow 2 -> 3
    ax.annotate('', xy=(0.70, 0.50), xytext=(0.64, 0.50),
                arrowprops=dict(arrowstyle="-|>", color=c_accent_green, lw=3, mutation_scale=20))
    ax.text(0.67, 0.56, "GSWAN / 5G SD-WAN\nJSON + 10KB Crops", fontsize=8, fontweight='bold', color=c_accent_green, ha='center')
    ax.text(0.67, 0.44, "99.8% Bandwidth\nReduction (~380 Mbps)", fontsize=8, fontweight='bold', color='#F59E0B', ha='center')
    
    # Bottom banner
    banner = patches.FancyBboxPatch((0.04, 0.015), 0.92, 0.045, boxstyle="round,pad=0.01,rounding_size=0.01",
                                    fc='#1E293B', ec='#475569', lw=1)
    ax.add_patch(banner)
    ax.text(0.50, 0.037, "Guaranteed Scalability: Zero WAN congestion · Zero-Trust Cryptographic Forensics · Active-Active DC/DR (RPO < 1s, RTO < 15s)",
            fontsize=9, fontweight='bold', color='#38BDF8', ha='center', va='center')
    
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')
    
    plt.tight_layout()
    plt.savefig(output_path, dpi=300, facecolor=fig.get_facecolor(), edgecolor='none', bbox_inches='tight')
    plt.close()
    print(f"Generated HLD Diagram at: {output_path}")

def create_workflow_diagram():
    output_path = "/Users/HetviSheth/Library/CloudStorage/OneDrive-NavrachanaUniversity/Gujarat_police_hackathon/docs/architecture/SentinelGrid_Workflow_Integration_Diagram.png"
    
    fig, ax = plt.subplots(figsize=(16, 10), dpi=300)
    fig.patch.set_facecolor('#0B0F19')
    ax.set_facecolor('#0B0F19')
    
    # Title
    ax.text(0.5, 0.96, "SentinelGrid — End-to-End Workflow & Integration Dataflow", 
            fontsize=20, fontweight='bold', color='#FFFFFF', ha='center', va='center')
    ax.text(0.5, 0.93, "From Optical CCTV Stream Ingestion to Live Tactical PCR Interception & Court Evidence", 
            fontsize=12, color='#94A3B8', ha='center', va='center')
            
    # Workflow Steps
    steps = [
        ("1. Stream Ingestion", "RTSP / ONVIF / WHEP Feeds\nMonotonic PTS timestamping\nMotion gating & 5-8 FPS sampling", 0.12, 0.70, '#3B82F6'),
        ("2. AI Vision Pipeline", "YOLOv8 vehicle detection\nByteTrack multi-object tracking\nVehicle color (HSV) & body type", 0.37, 0.70, '#8B5CF6'),
        ("3. Indian ANPR OCR", "Plate localization & crop\nOCR character extraction\nPhonetic confusion correction", 0.62, 0.70, '#EC4899'),
        ("4. Watchlist Matching", "Sub-millisecond Redis lookup\nFuzzy & exact plate match\nCloned plate anomaly check", 0.87, 0.70, '#EF4444'),
        
        ("8. PCR Tactical Dispatch", "Nearest PCR unit locator\nWeb Audio siren & voice alert\nIntercept checkpoint coordination", 0.12, 0.28, '#10B981'),
        ("7. Predictive Intercept", "Downstream junction prediction\nSpeed & heading vector analysis\nBarricade roadblock ETA calculation", 0.37, 0.28, '#06B6D4'),
        ("6. Statewide GIS Trajectory", "Monotonic PTS route stitching\nMulti-camera corridor map\nCross-district highway traversal", 0.62, 0.28, '#F59E0B'),
        ("5. Real-Time Alert Hub", "WebSocket alert broadcast\nSHA-256 tamper-evident hash\nSection 65B dossier generation", 0.87, 0.28, '#F97316'),
    ]
    
    for title, desc, x, y, col in steps:
        box = patches.FancyBboxPatch((x - 0.10, y - 0.10), 0.20, 0.20, boxstyle="round,pad=0.015,rounding_size=0.025",
                                     fc='#1E293B', ec=col, lw=2)
        ax.add_patch(box)
        
        # Step header banner
        header = patches.FancyBboxPatch((x - 0.095, y + 0.04), 0.19, 0.05, boxstyle="round,pad=0.005,rounding_size=0.015",
                                        fc=col, ec='none')
        ax.add_patch(header)
        ax.text(x, y + 0.065, title, fontsize=9.5, fontweight='bold', color='#FFFFFF', ha='center', va='center')
        ax.text(x, y - 0.03, desc, fontsize=8.5, color='#CBD5E1', ha='center', va='center', linespacing=1.3)
        
    # Flow Arrows: 1 -> 2 -> 3 -> 4
    for i in range(3):
        ax.annotate('', xy=(steps[i+1][2] - 0.10, 0.70), xytext=(steps[i][2] + 0.10, 0.70),
                    arrowprops=dict(arrowstyle="-|>", color='#64748B', lw=2.5, mutation_scale=18))
                    
    # Down arrow from 4 to 5
    ax.annotate('', xy=(0.87, 0.38), xytext=(0.87, 0.60),
                arrowprops=dict(arrowstyle="-|>", color='#EF4444', lw=2.5, mutation_scale=18))
    ax.text(0.92, 0.49, "MATCH\nHIT!", fontsize=9, fontweight='bold', color='#EF4444', ha='center')
    
    # Left arrows: 5 -> 6 -> 7 -> 8
    for i in range(7, 4, -1):
        ax.annotate('', xy=(steps[i][2] - 0.10, 0.28), xytext=(steps[i-1][2] + 0.10, 0.28),
                    arrowprops=dict(arrowstyle="-|>", color='#64748B', lw=2.5, mutation_scale=18))
                    
    # Center Database / Integration Hub Box
    hub_box = patches.FancyBboxPatch((0.26, 0.43), 0.48, 0.12, boxstyle="round,pad=0.015,rounding_size=0.02",
                                     fc='#0F172A', ec='#38BDF8', lw=1.5, linestyle='--')
    ax.add_patch(hub_box)
    ax.text(0.50, 0.51, "INTEGRATED PLATFORM BACKBONE", fontsize=11, fontweight='bold', color='#38BDF8', ha='center')
    ax.text(0.50, 0.46, "FastAPI REST API · PostgreSQL Audit Trails · Redis In-Memory Pub/Sub · National Vahan/Sarathi APIs", 
            fontsize=8.5, color='#94A3B8', ha='center')
            
    # Connecting lines to Backbone
    ax.plot([0.37, 0.37], [0.60, 0.55], color='#38BDF8', lw=1, linestyle=':')
    ax.plot([0.62, 0.62], [0.60, 0.55], color='#38BDF8', lw=1, linestyle=':')
    ax.plot([0.37, 0.37], [0.38, 0.43], color='#38BDF8', lw=1, linestyle=':')
    ax.plot([0.62, 0.62], [0.38, 0.43], color='#38BDF8', lw=1, linestyle=':')
    
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')
    
    plt.tight_layout()
    plt.savefig(output_path, dpi=300, facecolor=fig.get_facecolor(), edgecolor='none', bbox_inches='tight')
    plt.close()
    print(f"Generated Workflow Diagram at: {output_path}")

if __name__ == "__main__":
    create_hld_diagram()
    create_workflow_diagram()
