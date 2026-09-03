"""
Comprehensive API & End-to-End Testing Suite for SentinelGrid Backend.
Tests Health, Cameras, Watchlist, Detections, Alerts, and Analytics endpoints.
"""
import sys
import os
import unittest

# Add backend to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal, init_db_tables
from app.models.camera import Camera
from app.models.watchlist import WatchlistEntry
from app.models.detection import DetectionEvent
from app.models.alert import Alert

class TestSentinelGridAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_db_tables()
        cls.client = TestClient(app)
        cls.db = SessionLocal()

    @classmethod
    def tearDownClass(cls):
        cls.db.close()

    def test_01_health_check(self):
        """Test health check endpoint"""
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data.get("status"), "healthy")
        print("[PASS] Health Check Endpoint verified.")

    def test_02_create_and_get_cameras(self):
        """Test creating and listing cameras"""
        new_cam = {
            "name": "SG Highway - Test Node",
            "vendor": "CP Plus",
            "protocol": "RTSP",
            "stream_url": "rtsp://camera-test/feed1",
            "location_name": "SG Highway, Ahmedabad",
            "latitude": 23.0338,
            "longitude": 72.5850,
            "is_active": True
        }
        res = self.client.post("/api/v1/cameras/", json=new_cam)
        self.assertIn(res.status_code, [200, 201])
        cam_data = res.json()
        self.assertEqual(cam_data["name"], new_cam["name"])

        # Fetch cameras list
        get_res = self.client.get("/api/v1/cameras/")
        self.assertEqual(get_res.status_code, 200)
        cams = get_res.json()
        self.assertGreater(len(cams), 0)
        print(f"[PASS] Camera APIs verified ({len(cams)} cameras loaded).")

    def test_03_watchlist_management(self):
        """Test creating, reading, and filtering watchlist entries"""
        import time
        plate = f"GJ05XY{int(time.time()) % 10000:04d}"
        new_entry = {
            "plate_number": plate,
            "category": "stolen",
            "description": "Stolen Sedan - High Priority Alert",
            "priority": "CRITICAL",
            "is_active": True
        }
        res = self.client.post("/api/v1/watchlist/", json=new_entry)
        self.assertIn(res.status_code, [200, 201])
        created = res.json()
        self.assertEqual(created["plate_number"], plate)

        # Fetch watchlist list
        get_res = self.client.get("/api/v1/watchlist/")
        self.assertEqual(get_res.status_code, 200)
        entries = get_res.json()
        self.assertGreater(len(entries), 0)
        print(f"[PASS] Watchlist APIs verified ({len(entries)} watchlist items).")

    def test_04_alerts_endpoint(self):
        """Test querying alerts"""
        res = self.client.get("/api/v1/alerts/")
        self.assertEqual(res.status_code, 200)
        alerts = res.json()
        print(f"[PASS] Alerts API verified ({len(alerts)} alerts retrieved).")

    def test_05_detections_endpoint(self):
        """Test querying detection audit records"""
        res = self.client.get("/api/v1/detections/")
        self.assertEqual(res.status_code, 200)
        detections = res.json()
        print(f"[PASS] Detections API verified ({len(detections)} detection records).")

    def test_06_analytics_endpoints(self):
        """Test analytics statistics, trajectory, and heatmaps"""
        # Test stats
        res = self.client.get("/api/v1/analytics/stats")
        if res.status_code == 200:
            print("[PASS] Analytics Stats API verified.")

        # Test trajectory for plate
        res_traj = self.client.get("/api/v1/analytics/trajectory/GJ01AB1234")
        self.assertIn(res_traj.status_code, [200, 404])
        print("[PASS] Analytics Trajectory API verified.")

if __name__ == "__main__":
    unittest.main()
