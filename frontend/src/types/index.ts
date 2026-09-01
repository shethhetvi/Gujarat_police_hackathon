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
}

export interface Alert {
  id: number;
  detection_event_id: number;
  camera_id: number;
  watchlist_entry_id: number;
  plate_number: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  location_name?: string;
  snapshot_url?: string;
  acknowledged: boolean;
  acknowledged_by?: string;
  timestamp: string;
}

export interface AnalyticsSummary {
  total_cameras: number;
  active_cameras: number;
  watchlist_count: number;
  total_detections: number;
  unacknowledged_alerts: number;
}
