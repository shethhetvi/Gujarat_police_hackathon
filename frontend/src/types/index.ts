export interface Camera {
  id: number;
  name: string;
  vendor: string;
  protocol: string;
  stream_url: string;
  location_name: string;
  latitude: number;
  longitude: number;
  is_active: boolean;
  created_at?: string;
  // Computed / simulated telemetry for ICCC command center
  fps?: number;
  latency_ms?: number;
  packet_loss?: number;
  resolution?: string;
  uptime_pct?: number;
}

export interface CameraCreate {
  name: string;
  vendor?: string;
  protocol?: string;
  stream_url: string;
  location_name: string;
  latitude: number;
  longitude: number;
  is_active?: boolean;
}

export interface WatchlistEntry {
  id: number;
  plate_number: string;
  category: 'stolen' | 'wanted' | 'missing' | 'blacklisted' | 'traffic_violator' | 'suspicious';
  description?: string;
  vehicle_make_model?: string;
  color?: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  is_active: boolean;
  created_at?: string;

  // Real-time live CCTV sighting telemetry
  last_seen_camera_id?: number;
  last_seen_camera_name?: string;
  last_seen_location?: string;
  last_seen_time?: string;
  last_seen_speed_kmh?: number;
  last_seen_snapshot_url?: string;
  last_seen_sha256?: string;
  total_sightings?: number;
  dispatch_status?: 'PENDING' | 'DISPATCHED' | 'INTERCEPTED';
  dispatched_unit?: string;
  latest_alert_id?: number;
  is_overspeeding?: boolean;
}

export interface WatchlistCreate {
  plate_number: string;
  category: 'stolen' | 'wanted' | 'missing' | 'blacklisted';
  priority?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  vehicle_make_model?: string;
  description?: string;
  color?: string;
  is_active?: boolean;
}

export interface DetectionEvent {
  id: number;
  camera_id: number;
  timestamp: string;
  plate_number?: string;
  confidence: number;
  tracking_id?: number;
  snapshot_url?: string;
  matched: boolean;
  watchlist_entry_id?: number;
  is_simulated?: boolean;
  vehicle_type?: string;
  vehicle_color?: string;
  speed_kmh?: number;
  pts_timestamp?: number;
  sha256_hash?: string;
}

export interface Alert {
  id: number;
  detection_event_id?: number;
  camera_id?: number;
  camera_name?: string;
  watchlist_entry_id?: number;
  plate_number: string;
  category?: string;
  classification_tag?: 'STOLEN_VEHICLE' | 'WANTED_SUSPECT_FIR' | 'SUSPICIOUS_RECCE' | 'TRAFFIC_VIOLATOR' | string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  location_name?: string;
  latitude?: number;
  longitude?: number;
  snapshot_url?: string;
  acknowledged?: boolean;
  acknowledged_by?: string;
  is_simulated?: boolean;
  timestamp: string;
  speed_kmh?: number;
  dispatched_unit?: string;
  dispatch_status?: 'PENDING' | 'DISPATCHED' | 'INTERCEPTED' | string;
}

export interface AnalyticsSummary {
  total_cameras: number;
  active_cameras: number;
  watchlist_count: number;
  total_detections: number;
  unacknowledged_alerts: number;
}

export interface OfficerProfile {
  name: string;
  badge_number: string;
  role: string;
  police_station: string;
  district: string;
  shift: string;
  status: 'ON DUTY' | 'DISPATCHED' | 'STANDBY';
}

export interface RouteCheckpoint {
  detection_id?: number;
  camera_id: number;
  camera_name: string;
  location_name: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  confidence?: number;
  snapshot_url?: string;
  matched?: boolean;
  is_simulated?: boolean;
  speed_kmh?: number;
  pts_timestamp?: number;
  vehicle_color?: string;
  vehicle_type?: string;
  sha256_hash?: string;
  distance_from_prev_km?: number;
  elapsed_mins_from_prev?: number;
  corridor_velocity_kmh?: number;
  speed_category?: 'NORMAL' | 'MODERATE' | 'OVERSPEEDING';
  is_cloned_anomaly?: boolean;
}

export interface VehicleRouteResponse {
  plate_number: string;
  category?: string;
  priority?: string;
  vehicle_make_model?: string;
  checkpoints_count: number;
  total_distance_km?: number;
  average_velocity_kmh?: number;
  cloned_plate_anomaly?: boolean;
  checkpoints: RouteCheckpoint[];
}

export interface PredictedJunction {
  rank: number;
  junction_id: string;
  junction_name: string;
  location_name: string;
  latitude: number;
  longitude: number;
  distance_km: number;
  estimated_speed_kmh: number;
  eta_minutes: number;
  confidence_score: number;
  tactical_advisory: string;
}

export interface PatrolUnit {
  id: string;
  name: string;
  callsign: string;
  officer: string;
  type: 'VAN' | 'BIKE' | 'CHECKPOST' | string;
  latitude: number;
  longitude: number;
  distance_km: number;
  eta_minutes: number;
  status: 'AVAILABLE' | 'PATROLLING' | 'STANDBY' | string;
}

export interface PredictiveInterceptResponse {
  status: string;
  plate_number: string;
  current_position: {
    latitude: number;
    longitude: number;
    last_seen_camera: string;
    current_speed_kmh: number;
  };
  predicted_intercept_junctions: PredictedJunction[];
  nearest_pcr_units: PatrolUnit[];
  tactical_status: string;
}

export interface Section65BDossier {
  dossier_type: string;
  statutory_act: string;
  case_reference: string;
  plate_number: string;
  master_sha256_hash: string;
  generated_at: string;
  investigating_authority: string;
  vehicle_profile: {
    plate_number: string;
    category: string;
    priority: string;
    make_model: string;
    description: string;
  };
  chronological_route: RouteCheckpoint[];
  corridor_analytics: {
    total_distance_km: number;
    average_velocity_kmh: number;
    cloned_plate_anomaly: boolean;
  };
  alerts_count: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  read: boolean;
  linkTab?: string;
  targetId?: number;
}
