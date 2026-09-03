import axios from 'axios';
import { Camera, CameraCreate, WatchlistEntry, WatchlistCreate, DetectionEvent, Alert, AnalyticsSummary } from '../types';

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_BASE}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ─── Cameras ──────────────────────────────────────────────────────────────
export const getCameras = async (): Promise<Camera[]> => {
  const res = await api.get('/cameras/');
  return res.data;
};

export const getCamera = async (id: number): Promise<Camera> => {
  const res = await api.get(`/cameras/${id}`);
  return res.data;
};

export const createCamera = async (camera: CameraCreate): Promise<Camera> => {
  const res = await api.post('/cameras/', camera);
  return res.data;
};

// ─── Watchlist ────────────────────────────────────────────────────────────
export const getWatchlist = async (): Promise<WatchlistEntry[]> => {
  const res = await api.get('/watchlist/');
  return res.data;
};

export const addWatchlistEntry = async (entry: WatchlistCreate): Promise<WatchlistEntry> => {
  const res = await api.post('/watchlist/', entry);
  return res.data;
};

export const deleteWatchlistEntry = async (entryId: number): Promise<any> => {
  const res = await api.delete(`/watchlist/${entryId}`);
  return res.data;
};

// ─── Alerts ───────────────────────────────────────────────────────────────
export const getAlerts = async (acknowledged: boolean = false): Promise<Alert[]> => {
  const res = await api.get(`/alerts/?acknowledged=${acknowledged}`);
  return res.data;
};

export const acknowledgeAlert = async (alertId: number, officerName: string): Promise<Alert> => {
  const res = await api.post(`/alerts/${alertId}/acknowledge?officer_name=${encodeURIComponent(officerName)}`);
  return res.data;
};

// ─── Detections ───────────────────────────────────────────────────────────
export const getDetections = async (params?: { plate_number?: string; camera_id?: number; limit?: number }): Promise<DetectionEvent[]> => {
  const res = await api.get('/detections/', { params });
  return res.data;
};

// ─── Analytics ────────────────────────────────────────────────────────────
export const getAnalyticsSummary = async (): Promise<AnalyticsSummary> => {
  const res = await api.get('/analytics/summary');
  return res.data;
};

export const getVehicleRoute = async (plateNumber: string): Promise<any> => {
  const res = await api.get(`/analytics/route/${encodeURIComponent(plateNumber)}`);
  return res.data;
};

export const triggerSimulatedSighting = async (plateNumber: string = 'GJ01AB1234', cameraId?: number): Promise<any> => {
  const url = `/analytics/simulate-sighting?plate_number=${encodeURIComponent(plateNumber)}${cameraId ? `&camera_id=${cameraId}` : ''}`;
  const res = await api.post(url);
  return res.data;
};

export const triggerSimulatedRoute = async (plateNumber: string = 'GJ01AB1234'): Promise<any> => {
  const res = await api.post(`/analytics/simulate-route?plate_number=${encodeURIComponent(plateNumber)}`);
  return res.data;
};

// ─── Health Check ─────────────────────────────────────────────────────────
export const checkHealth = async (): Promise<boolean> => {
  try {
    await axios.get(`${API_BASE}/health`, { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
};
