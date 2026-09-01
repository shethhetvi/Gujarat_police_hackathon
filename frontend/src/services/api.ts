import axios from 'axios';
import { Camera, WatchlistEntry, DetectionEvent, Alert, AnalyticsSummary } from '../types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_BASE}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getCameras = async (): Promise<Camera[]> => {
  const res = await api.get('/cameras/');
  return res.data;
};

export const getWatchlist = async (): Promise<WatchlistEntry[]> => {
  const res = await api.get('/watchlist/');
  return res.data;
};

export const addWatchlistEntry = async (entry: Partial<WatchlistEntry>): Promise<WatchlistEntry> => {
  const res = await api.post('/watchlist/', entry);
  return res.data;
};

export const getAlerts = async (acknowledged: boolean = false): Promise<Alert[]> => {
  const res = await api.get(`/alerts/?acknowledged=${acknowledged}`);
  return res.data;
};

export const acknowledgeAlert = async (alertId: number, officerName: string): Promise<Alert> => {
  const res = await api.post(`/alerts/${alertId}/acknowledge?officer_name=${encodeURIComponent(officerName)}`);
  return res.data;
};

export const getDetections = async (params?: { plate_number?: string; camera_id?: number }): Promise<DetectionEvent[]> => {
  const res = await api.get('/detections/', { params });
  return res.data;
};

export const getAnalyticsSummary = async (): Promise<AnalyticsSummary> => {
  const res = await api.get('/analytics/summary');
  return res.data;
};
