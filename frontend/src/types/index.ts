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
  category: 'stolen' | 'wanted' | 'missing' | 'blacklisted';
  description?: string;
  vehicle_make_model?: string;
  color?: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  is_active: boolean;
  created_at?: string;
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
  speed_kmh?: number;
}

export interface Alert {
  id: number;
  detection_event_id?: number;
  camera_id?: number;
  camera_name?: string;
  watchlist_entry_id?: number;
  plate_number: string;
  category?: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  location_name?: string;
  latitude?: number;
  longitude?: number;
  snapshot_url?: string;
  acknowledged?: boolean;
  acknowledged_by?: string;
  is_simulated?: boolean;
  timestamp: string;
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
}

export interface VehicleRouteResponse {
  plate_number: string;
  category?: string;
  priority?: string;
  checkpoints_count: number;
  checkpoints: RouteCheckpoint[];
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
