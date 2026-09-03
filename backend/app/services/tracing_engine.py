import math
import datetime
from typing import List, Dict, Any, Optional, Tuple
import logging

logger = logging.getLogger("sentinelgrid.tracing_engine")

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates great-circle distance between two GPS coordinates in kilometers."""
    R = 6371.0  # Earth's radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2.0) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(R * c, 2)

def calculate_bearing(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates forward compass azimuth/bearing in degrees (0 - 360)."""
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_lambda = math.radians(lon2 - lon1)

    y = math.sin(delta_lambda) * math.cos(phi2)
    x = math.cos(phi1) * math.sin(phi2) - math.sin(phi1) * math.cos(phi2) * math.cos(delta_lambda)
    bearing = (math.degrees(math.atan2(y, x)) + 360.0) % 360.0
    return round(bearing, 1)

# Gujarat Tactical Roadway & CCTV Junction Graph (Key corridors in Ahmedabad, Gandhinagar, Vadodara, Surat)
GUJARAT_JUNCTION_NODES: List[Dict[str, Any]] = [
    {
        "id": "j_chimanbhai",
        "name": "Chimanbhai Bridge Junction",
        "location": "Subhash Bridge - RTO Circle, Ahmedabad",
        "latitude": 23.0645,
        "longitude": 72.5780,
        "adjacents": ["j_janpath", "j_ongc", "j_sg_highway"],
        "tactical_type": "PRIMARY_ARTERIAL"
    },
    {
        "id": "j_janpath",
        "name": "Janpath Hotel Circle",
        "location": "Ashram Road Corridor, Ahmedabad",
        "latitude": 23.0531,
        "longitude": 72.5694,
        "adjacents": ["j_chimanbhai", "j_paldi", "j_vastrapur"],
        "tactical_type": "CITY_CORRIDOR"
    },
    {
        "id": "j_ongc",
        "name": "O.N.G.C. Chandkheda Circle",
        "location": "Gandhinagar-Ahmedabad Highway",
        "latitude": 23.1025,
        "longitude": 72.5935,
        "adjacents": ["j_chimanbhai", "j_gn_sec9", "j_chiloda"],
        "tactical_type": "STATE_HIGHWAY_GATE"
    },
    {
        "id": "j_paldi",
        "name": "Paldi Crossroad Circle",
        "location": "Paldi, Central Ahmedabad",
        "latitude": 23.0135,
        "longitude": 72.5620,
        "adjacents": ["j_janpath", "j_sarkhej", "j_vadsar"],
        "tactical_type": "MAJOR_CIRCLE"
    },
    {
        "id": "j_sg_highway",
        "name": "Ahmedabad S.G. Highway Junction",
        "location": "S.G. Highway Express, Ahmedabad",
        "latitude": 23.0338,
        "longitude": 72.5085,
        "adjacents": ["j_vastrapur", "j_sarkhej", "j_chimanbhai"],
        "tactical_type": "EXPRESSWAY_INTERCHANGE"
    },
    {
        "id": "j_vastrapur",
        "name": "Ahmedabad Vastrapur Lake Circle",
        "location": "Vastrapur, Ahmedabad",
        "latitude": 23.0350,
        "longitude": 72.5293,
        "adjacents": ["j_sg_highway", "j_janpath", "j_paldi"],
        "tactical_type": "URBAN_JUNCTION"
    },
    {
        "id": "j_sarkhej",
        "name": "Sarkhej-Sanand Toll Crossroad",
        "location": "Sarkhej NH-47 Bypass, Ahmedabad",
        "latitude": 22.9862,
        "longitude": 72.4984,
        "adjacents": ["j_sg_highway", "j_paldi", "j_vadsar"],
        "tactical_type": "TOLL_PLAZA_BARRIER"
    },
    {
        "id": "j_gn_sec9",
        "name": "Gandhinagar Sector 9 Circle",
        "location": "Sector 9, Capital Corridor, Gandhinagar",
        "latitude": 23.2222,
        "longitude": 72.6497,
        "adjacents": ["j_ongc", "j_chiloda"],
        "tactical_type": "CAPITAL_ACCESS_POINT"
    },
    {
        "id": "j_chiloda",
        "name": "Chiloda Circle (NH-48 Hub)",
        "location": "NH-48 National Highway Junction",
        "latitude": 23.2505,
        "longitude": 72.7120,
        "adjacents": ["j_gn_sec9", "j_ongc"],
        "tactical_type": "NATIONAL_HIGHWAY_CHECKPOINT"
    },
    {
        "id": "j_vadsar",
        "name": "Vadodara Vadsar Circle",
        "location": "Vadsar Ring Road, Vadodara",
        "latitude": 22.2950,
        "longitude": 73.1740,
        "adjacents": ["j_sarkhej", "j_surat_dumas"],
        "tactical_type": "INTERCITY_CORRIDOR"
    },
    {
        "id": "j_surat_dumas",
        "name": "Surat Dumas Road Junction",
        "location": "Dumas Coastal Highway, Surat",
        "latitude": 21.1702,
        "longitude": 72.8311,
        "adjacents": ["j_vadsar"],
        "tactical_type": "COASTAL_CHECKPOST"
    }
]

# Active Police Control Room (PCR) Patrol Units in Gujarat Grid
ACTIVE_PCR_UNITS: List[Dict[str, Any]] = [
    {
        "id": "pcr_falcon_14",
        "name": "PCR Van #14 (Crime Branch Intercept)",
        "callsign": "Falcon-14",
        "officer": "PSI R. Dave",
        "type": "VAN",
        "latitude": 23.0380,
        "longitude": 72.5190,
        "status": "AVAILABLE",
        "speed_kmh": 0
    },
    {
        "id": "pcr_cheetah_08",
        "name": "Cheetah Mobile QRT #08 (S.G. Rapid)",
        "callsign": "Cheetah-8",
        "officer": "HC M. Solanki",
        "type": "BIKE",
        "latitude": 23.0450,
        "longitude": 72.5350,
        "status": "PATROLLING",
        "speed_kmh": 35
    },
    {
        "id": "pcr_interceptor_02",
        "name": "Highway Interceptor Unit #02 (NH-48)",
        "callsign": "Interceptor-2",
        "officer": "PI V. Jadeja",
        "type": "VAN",
        "latitude": 23.0800,
        "longitude": 72.5700,
        "status": "AVAILABLE",
        "speed_kmh": 50
    },
    {
        "id": "pcr_roadblock_03",
        "name": "Sector Roadblock Barrier #03 (Iskcon)",
        "callsign": "Barrier-3",
        "officer": "ASI B. Vaghela",
        "type": "CHECKPOST",
        "latitude": 23.0280,
        "longitude": 72.5050,
        "status": "STANDBY",
        "speed_kmh": 0
    },
    {
        "id": "pcr_surat_marine_22",
        "name": "PCR Van #22 (Surat Dumas Patrol)",
        "callsign": "Sagar-22",
        "officer": "PSI K. Gohil",
        "type": "VAN",
        "latitude": 21.1750,
        "longitude": 72.8250,
        "status": "PATROLLING",
        "speed_kmh": 40
    }
]

class TracingEngine:
    """
    Vehicle Tracing & Cross-Camera Re-Identification Engine:
      - Spatial-Temporal correlation across Gujarat CCTV nodes
      - Corridor velocity & elapsed time calculations
      - Ghost/cloned plate anomaly detection (>250 km/h)
      - Predictive escape route with next 2 likely junctions & barricade ETA
      - Nearest PCR van geofence tactical matcher
    """
    def __init__(self):
        self.junctions = {j["id"]: j for j in GUJARAT_JUNCTION_NODES}

    def correlate_cross_camera_route(self, checkpoints: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Processes a list of raw camera sightings chronologically.
        Computes elapsed time, distances, corridor velocities, and flags anomalies.
        """
        if not checkpoints:
            return {
                "checkpoints": [],
                "total_distance_km": 0.0,
                "average_velocity_kmh": 0.0,
                "cloned_plate_anomaly": False
            }

        # Sort by timestamp ascending
        sorted_cps = sorted(checkpoints, key=lambda x: str(x.get("timestamp", "")))
        enhanced_cps = []
        total_distance = 0.0
        corridor_speeds = []
        cloned_plate_flag = False

        for i in range(len(sorted_cps)):
            cp = dict(sorted_cps[i])
            if i == 0:
                cp["distance_from_prev_km"] = 0.0
                cp["elapsed_mins_from_prev"] = 0.0
                cp["corridor_velocity_kmh"] = float(cp.get("speed_kmh", 55.0))
                cp["speed_category"] = "NORMAL"
            else:
                prev = sorted_cps[i - 1]
                dist = haversine_distance(
                    prev.get("latitude", 0.0), prev.get("longitude", 0.0),
                    cp.get("latitude", 0.0), cp.get("longitude", 0.0)
                )
                cp["distance_from_prev_km"] = dist
                total_distance += dist

                # Time delta calculation
                t_prev = self._parse_iso(prev.get("timestamp"))
                t_curr = self._parse_iso(cp.get("timestamp"))
                delta_seconds = max(1.0, (t_curr - t_prev).total_seconds()) if t_prev and t_curr else 900.0
                elapsed_mins = round(delta_seconds / 60.0, 1)
                cp["elapsed_mins_from_prev"] = elapsed_mins

                # Velocity in km/h = (distance / hours)
                hours = delta_seconds / 3600.0
                corridor_v = round(dist / hours, 1) if hours > 0 else 0.0
                cp["corridor_velocity_kmh"] = corridor_v
                corridor_speeds.append(corridor_v)

                # Anomaly detection: if corridor velocity > 250 km/h across distances > 5 km,
                # physically impossible -> indicates plate cloning / counterfeit plate
                if corridor_v > 250.0 and dist > 5.0:
                    cloned_plate_flag = True
                    cp["is_cloned_anomaly"] = True

                # Speed categorization for GIS breadcrumb color-coding
                if corridor_v > 85.0:
                    cp["speed_category"] = "OVERSPEEDING"
                elif corridor_v > 55.0:
                    cp["speed_category"] = "MODERATE"
                else:
                    cp["speed_category"] = "NORMAL"

            enhanced_cps.append(cp)

        avg_velocity = round(sum(corridor_speeds) / max(1, len(corridor_speeds)), 1) if corridor_speeds else 58.5

        return {
            "checkpoints": enhanced_cps,
            "total_distance_km": round(total_distance, 1),
            "average_velocity_kmh": avg_velocity,
            "cloned_plate_anomaly": cloned_plate_flag
        }

    def predict_escape_route(
        self,
        current_lat: float,
        current_lon: float,
        prev_lat: Optional[float] = None,
        prev_lon: Optional[float] = None,
        current_speed_kmh: float = 65.0
    ) -> List[Dict[str, Any]]:
        """
        Algorithmically predicts the NEXT 2 most likely junctions the suspect will reach,
        computing barricade ETAs and tactical interception recommendations.
        """
        # 1. Find the closest current junction node
        closest_node = None
        min_dist = float("inf")
        for j in GUJARAT_JUNCTION_NODES:
            d = haversine_distance(current_lat, current_lon, j["latitude"], j["longitude"])
            if d < min_dist:
                min_dist = d
                closest_node = j

        if not closest_node:
            closest_node = GUJARAT_JUNCTION_NODES[0]

        # 2. Determine general movement heading
        heading = None
        if prev_lat is not None and prev_lon is not None:
            heading = calculate_bearing(prev_lat, prev_lon, current_lat, current_lon)

        # 3. Rank candidate downstream junctions
        candidate_ids = closest_node.get("adjacents", [])
        if len(candidate_ids) < 2:
            candidate_ids = [j["id"] for j in GUJARAT_JUNCTION_NODES if j["id"] != closest_node["id"]][:3]

        candidates = [self.junctions[cid] for cid in candidate_ids if cid in self.junctions]
        
        # Sort candidates by alignment with heading or proximity
        def score_candidate(cand):
            cand_dist = haversine_distance(current_lat, current_lon, cand["latitude"], cand["longitude"])
            if heading is not None:
                cand_bearing = calculate_bearing(current_lat, current_lon, cand["latitude"], cand["longitude"])
                angle_diff = abs(cand_bearing - heading)
                if angle_diff > 180:
                    angle_diff = 360 - angle_diff
                return cand_dist + (angle_diff * 0.1)
            return cand_dist

        candidates.sort(key=score_candidate)
        next_two = candidates[:2]

        speed = max(35.0, current_speed_kmh)
        predicted_junctions = []

        tactical_actions = [
            "Deploy tire-shredding spike strips & activate signal lock (Barricade Alpha)",
            "Station Cheetah QRT rapid interceptor & divert civilian traffic (Barricade Bravo)"
        ]

        for idx, node in enumerate(next_two):
            d_km = haversine_distance(current_lat, current_lon, node["latitude"], node["longitude"])
            if d_km < 0.5:
                d_km = round(2.5 + (idx * 3.2), 1)

            # ETA in minutes = (distance / speed) * 60
            eta_mins = max(1, round((d_km / speed) * 60.0, 1))

            predicted_junctions.append({
                "rank": idx + 1,
                "junction_id": node["id"],
                "junction_name": node["name"],
                "location_name": node["location"],
                "latitude": node["latitude"],
                "longitude": node["longitude"],
                "distance_km": round(d_km, 1),
                "estimated_speed_kmh": round(speed, 1),
                "eta_minutes": eta_mins,
                "confidence_score": round(0.92 - (idx * 0.12), 2),
                "tactical_advisory": tactical_actions[idx % len(tactical_actions)]
            })

        return predicted_junctions

    def find_nearest_pcr_vans(self, target_lat: float, target_lon: float) -> List[Dict[str, Any]]:
        """
        Geofences and identifies nearest active Police Control Room (PCR) vans.
        Returns units sorted by proximity with estimated interception times.
        """
        units_with_distance = []
        for unit in ACTIVE_PCR_UNITS:
            dist = haversine_distance(target_lat, target_lon, unit["latitude"], unit["longitude"])
            # Estimate patrol response ETA (average patrol travel speed 50 km/h)
            eta_mins = max(1, round((dist / 50.0) * 60.0))
            units_with_distance.append({
                **unit,
                "distance_km": dist,
                "eta_minutes": eta_mins
            })

        units_with_distance.sort(key=lambda u: u["distance_km"])
        return units_with_distance

    def _parse_iso(self, ts_str: Optional[str]) -> Optional[datetime.datetime]:
        if not ts_str:
            return None
        try:
            # Handle ISO string with or without milliseconds/Z
            cleaned = ts_str.replace("Z", "+00:00")
            return datetime.datetime.fromisoformat(cleaned)
        except Exception:
            return None

tracing_engine = TracingEngine()
