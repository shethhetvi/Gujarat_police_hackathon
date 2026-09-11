"""
========================================================================================
SentinelGrid: Official 5-Minute Hackathon Winning Live Video Walkthrough Recorder
========================================================================================
Records a complete 1920x1080 high-definition video walkthrough of the live dashboard
covering every single award-winning capability:
  1. Statewide ICCC Telemetry & Real-Time Stats (0:00 - 0:35)
  2. 50-Camera Interactive GIS Grid & Live Stream Inspection (0:35 - 1:20)
  3. Hackathon Live Challenge Trigger: Target Stolen Vehicle 'GJ01AB1234' (1:20 - 2:05)
  4. Court-Admissible Section 65B Evidence Dossier with Master SHA-256 (2:05 - 2:50)
  5. 9-Checkpoint Highway Corridor Trajectory & Kinematics on Map (2:50 - 3:35)
  6. AI Predictive Interception Modeling & Tactical PCR Patrol Dispatch (3:35 - 4:15)
  7. Statewide Threat Watchlist Manager & Sub-Millisecond Indexing (4:15 - 4:50)
  8. Real-Time Detection Audit Trail & Forensic Snapshot Inspection (4:50 - 5:20)
  9. Autonomous AI Surveillance Copilot & Panoramic Command Center View (5:20 - 5:45)
========================================================================================
"""

import os
import time
import subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright

OUTPUT_DIR = Path("simulation/recorded_demo_videos")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

FINAL_MP4_PATH = Path("sentinelgrid_hackathon_winning_demo_5min.mp4")

def smooth_scroll(page, start_y, end_y, steps=25, delay=0.08):
    """Smoothly scrolls page vertically to simulate natural operator browsing."""
    diff = (end_y - start_y) / float(steps)
    curr = start_y
    for _ in range(steps):
        curr += diff
        page.evaluate(f"window.scrollTo(0, {int(curr)})")
        time.sleep(delay)

def record_full_feature_demo():
    print("=" * 80)
    print("STARTING 5-MINUTE HIGH-DEFINITION VIDEO DEMO RECORDING (1920x1080)")
    print("=" * 80)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=[
                "--window-size=1920,1080",
                "--disable-gpu",
                "--no-sandbox"
            ]
        )
        
        # Enable high-resolution video recording in Playwright
        context = browser.new_context(
            viewport={"width": 1920, "height": 1080},
            record_video_dir=str(OUTPUT_DIR),
            record_video_size={"width": 1920, "height": 1080}
        )
        
        page = context.new_page()
        page.set_default_timeout(15000)
        
        # -------------------------------------------------------------------------
        # CHAPTER 1: COMMAND CENTER TELEMETRY & MASTER CLOCK (0:00 - 0:35)
        # -------------------------------------------------------------------------
        print("[0:00 - 0:35] Chapter 1: Initial Command Center Overview & Telemetry...")
        page.goto("http://localhost:3000", wait_until="networkidle")
        time.sleep(4)
        
        # Pause to showcase Gujarat Police Emblem, Officer Profile, Monotonic PTS clock, and Top KPIs
        time.sleep(12)
        
        # Gentle scroll down to reveal system metrics and active camera grid
        smooth_scroll(page, 0, 350, steps=20, delay=0.1)
        time.sleep(8)
        smooth_scroll(page, 350, 650, steps=20, delay=0.1)
        time.sleep(8)

        # -------------------------------------------------------------------------
        # CHAPTER 2: INTERACTIVE GIS MAP & 50-CAMERA GRID EXPLORATION (0:35 - 1:20)
        # -------------------------------------------------------------------------
        print("[0:35 - 1:20] Chapter 2: Interactive Statewide GIS Map & Camera Grid...")
        # Scroll smoothly back to map section
        smooth_scroll(page, 650, 220, steps=20, delay=0.1)
        time.sleep(6)
        
        # Click on camera markers on the map
        try:
            markers = page.query_selector_all(".leaflet-marker-icon")
            print(f"Found {len(markers)} camera markers on GIS map.")
            if len(markers) >= 3:
                markers[0].click(force=True)
                time.sleep(8)
                page.keyboard.press("Escape")
                time.sleep(2)
                markers[5].click(force=True)
                time.sleep(8)
                page.keyboard.press("Escape")
                time.sleep(2)
                markers[12].click(force=True)
                time.sleep(8)
                page.keyboard.press("Escape")
                time.sleep(2)
        except Exception as e:
            print(f"Marker notice: {e}")
            
        time.sleep(6)

        # -------------------------------------------------------------------------
        # CHAPTER 3: HACKATHON LIVE CHALLENGE SCENARIO (1:20 - 2:05)
        # -------------------------------------------------------------------------
        print("[1:20 - 2:05] Chapter 3: Triggering Live Challenge Target GJ01AB1234...")
        smooth_scroll(page, 220, 0, steps=15, delay=0.08)
        time.sleep(4)
        
        # Click the prominent '⚡ Live Test Scenario' button in the header
        live_btn = page.query_selector("button:has-text('Live Test Scenario'), button:has-text('⚡ Live Test')")
        if live_btn:
            print("Clicking ⚡ Live Test Scenario button...")
            live_btn.click(force=True)
        else:
            sim_btn = page.query_selector("button:has-text('Sim Alert')")
            if sim_btn:
                sim_btn.click(force=True)
                
        # Pause to let the critical alert banner flash, siren sound, notification, and modal trigger
        time.sleep(18)
        
        # -------------------------------------------------------------------------
        # CHAPTER 4: COURT-ADMISSIBLE SECTION 65B EVIDENCE DOSSIER (2:05 - 2:50)
        # -------------------------------------------------------------------------
        print("[2:05 - 2:50] Chapter 4: Showcasing Section 65B Evidence Act Legal Dossier...")
        # If dossier modal is already open from Live Test Scenario, inspect it; if not, open it
        dossier_modal = page.query_selector(".cmd-backdrop")
        if not dossier_modal:
            dossier_btn = page.query_selector("button:has-text('Sec 65B Dossier'), button:has-text('Section 65B')")
            if dossier_btn:
                dossier_btn.click(force=True)
                time.sleep(4)
                
        time.sleep(6)
        
        # Smoothly scroll through the official forensic dossier (SHA-256 hash chains & Vahan telematics)
        for _ in range(5):
            page.mouse.wheel(0, 250)
            time.sleep(4)
            
        time.sleep(8)
        
        # Close the modal cleanly
        print("Closing Section 65B Dossier modal...")
        close_btn = page.query_selector("button[title*='Close'], button:has-text('✕')")
        if close_btn:
            try:
                close_btn.click(force=True)
            except Exception:
                page.keyboard.press("Escape")
        else:
            page.keyboard.press("Escape")
            
        time.sleep(4)

        # -------------------------------------------------------------------------
        # CHAPTER 5: 9-CHECKPOINT HIGHWAY TRAJECTORY RECONSTRUCTION (2:50 - 3:35)
        # -------------------------------------------------------------------------
        print("[2:50 - 3:35] Chapter 5: Cross-Camera Highway Trajectory & Kinematics...")
        smooth_scroll(page, 0, 300, steps=15, delay=0.08)
        time.sleep(6)
        
        # Scroll through the plotted highway corridor sightings on the map
        smooth_scroll(page, 300, 700, steps=25, delay=0.1)
        time.sleep(14)
        smooth_scroll(page, 700, 1100, steps=25, delay=0.1)
        time.sleep(14)

        # -------------------------------------------------------------------------
        # CHAPTER 6: AI PREDICTIVE INTERCEPTION & PCR PATROL DISPATCH (3:35 - 4:15)
        # -------------------------------------------------------------------------
        print("[3:35 - 4:15] Chapter 6: Predictive Escape Route & Tactical PCR Dispatch...")
        # Inspect Predictive Interception Section
        smooth_scroll(page, 1100, 1450, steps=20, delay=0.1)
        time.sleep(10)
        
        # Dispatch nearest active patrol unit Sagar-22
        dispatch_btns = page.query_selector_all("button:has-text('Dispatch'), button:has-text('Intercept')")
        if dispatch_btns:
            print("Dispatching patrol unit PCR Sagar-22...")
            try:
                dispatch_btns[0].click(force=True)
                time.sleep(6)
            except Exception as e:
                print(f"Dispatch notice: {e}")
                
        time.sleep(14)

        # -------------------------------------------------------------------------
        # CHAPTER 7: STATEWIDE THREAT WATCHLIST MANAGER (4:15 - 4:50)
        # -------------------------------------------------------------------------
        print("[4:15 - 4:50] Chapter 7: Threat Watchlist Management & Bloom Filter Screening...")
        # Scroll back to top
        smooth_scroll(page, 1450, 0, steps=25, delay=0.06)
        time.sleep(3)
        
        # Navigate to Watchlist page
        watchlist_tab = page.query_selector("button:has-text('Threat Watchlist'), a:has-text('Threat Watchlist'), [data-tab='watchlist']")
        if watchlist_tab:
            print("Navigating to Threat Watchlist...")
            watchlist_tab.click(force=True)
            time.sleep(5)
            
            # View active targets
            smooth_scroll(page, 0, 400, steps=20, delay=0.1)
            time.sleep(12)
            smooth_scroll(page, 400, 0, steps=20, delay=0.1)
            time.sleep(5)
            
        time.sleep(8)

        # -------------------------------------------------------------------------
        # CHAPTER 8: REAL-TIME DETECTION AUDIT TRAIL (4:50 - 5:20)
        # -------------------------------------------------------------------------
        print("[4:50 - 5:20] Chapter 8: Real-Time Detection Audit Trail...")
        audit_tab = page.query_selector("button:has-text('Detection Audit'), a:has-text('Detection Audit'), [data-tab='audit']")
        if audit_tab:
            print("Navigating to Detection Audit...")
            audit_tab.click(force=True)
            time.sleep(5)
            
            # Scroll through audit events
            smooth_scroll(page, 0, 450, steps=20, delay=0.1)
            time.sleep(10)
            smooth_scroll(page, 450, 0, steps=20, delay=0.1)
            time.sleep(5)
            
        time.sleep(6)

        # -------------------------------------------------------------------------
        # CHAPTER 9: AI ASSISTANT COPILOT & FINAL PANORAMA (5:20 - 5:45)
        # -------------------------------------------------------------------------
        print("[5:20 - 5:45] Chapter 9: AI Surveillance Copilot & Final Panorama...")
        dash_tab = page.query_selector("button:has-text('Overview'), a:has-text('Overview'), button:has-text('Dashboard'), a:has-text('Dashboard')")
        if dash_tab:
            dash_tab.click(force=True)
            time.sleep(4)
            
        # Open AI Copilot drawer
        ai_btn = page.query_selector("button:has-text('AI Surveillance Agent'), button:has-text('Ask AI')")
        if ai_btn:
            try:
                ai_btn.click(force=True)
                time.sleep(8)
                page.keyboard.press("Escape")
                time.sleep(2)
            except Exception:
                pass
                
        # Final panoramic showcase of live GIS map & active streams
        smooth_scroll(page, 0, 320, steps=20, delay=0.1)
        time.sleep(8)
        smooth_scroll(page, 320, 0, steps=20, delay=0.1)
        time.sleep(6)
        
        print("Closing browser context to finalize video recording...")
        page.close()
        context.close()
        browser.close()

    # Find the recorded video file created by Playwright
    recorded_files = list(OUTPUT_DIR.glob("*.webm"))
    if not recorded_files:
        print("Warning: No .webm video found in output dir.")
        return None
        
    latest_video = max(recorded_files, key=os.path.getctime)
    print(f"Recorded raw WebM video: {latest_video} ({latest_video.stat().st_size / (1024*1024):.2f} MB)")
    
    # Convert to universal H.264 MP4 using ffmpeg
    print(f"Transcoding to high-definition broadcast MP4: {FINAL_MP4_PATH}...")
    cmd = [
        "/opt/homebrew/bin/ffmpeg",
        "-y",
        "-i", str(latest_video),
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "22",
        "-pix_fmt", "yuv420p",
        str(FINAL_MP4_PATH)
    ]
    subprocess.run(cmd, check=True)
    
    final_size_mb = FINAL_MP4_PATH.stat().st_size / (1024 * 1024)
    print("=" * 80)
    print(f"OFFICIAL HACKATHON DEMO VIDEO READY!")
    print(f"Path:      {FINAL_MP4_PATH.absolute()}")
    print(f"File Size: {final_size_mb:.2f} MB")
    print(f"Specs:     1920x1080 Full HD, H.264 MP4")
    print("=" * 80)
    return FINAL_MP4_PATH

if __name__ == "__main__":
    record_full_feature_demo()
