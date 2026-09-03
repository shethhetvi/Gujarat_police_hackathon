'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, Alert } from '../../types';
import { getVehicleRoute } from '../../services/api';

interface GisMapProps {
  cameras: Camera[];
  alerts: Alert[];
  selectedPlate?: string;
  onSelectPlate?: (plate: string) => void;
}

// We dynamically import Leaflet to avoid SSR issues
let L: any = null;

export const GisMap: React.FC<GisMapProps> = ({ cameras, alerts, selectedPlate, onSelectPlate }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const routeLayerRef = useRef<any>(null);

  const [routeData, setRouteData] = useState<any>(null);
  const [searchPlate, setSearchPlate] = useState(selectedPlate || 'GJ01AB1234');
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [routeError, setRouteError] = useState('');

  // Load Leaflet dynamically (client only)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initMap = async () => {
      try {
        L = await import('leaflet' as any);

        // Fix default icon paths for Next.js
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        if (!mapRef.current || leafletMapRef.current) return;

        // Center on Gujarat
        const map = L.map(mapRef.current, {
          center: [22.5, 72.0],
          zoom: 7,
          zoomControl: true,
        });

        // OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
          maxZoom: 19
        }).addTo(map);

        leafletMapRef.current = map;
        setMapReady(true);
      } catch (err) {
        console.error('Failed to init Leaflet:', err);
      }
    };

    initMap();

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Camera markers
  useEffect(() => {
    if (!leafletMapRef.current || !mapReady || !L) return;

    // Remove old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    cameras.forEach(cam => {
      if (!cam.latitude || !cam.longitude) return;

      const hasAlert = alerts.some(a => a.camera_id === cam.id);
      const isRouteCheckpoint = routeData?.checkpoints?.some((cp: any) => cp.camera_id === cam.id);

      // Custom icon
      const iconHtml = `
        <div style="
          width:30px;height:30px;border-radius:50%;
          background:${isRouteCheckpoint ? '#0891b2' : hasAlert ? '#dc2626' : '#1d4ed8'};
          border:3px solid #fff;
          box-shadow:0 2px 8px rgba(0,0,0,0.35);
          display:flex;align-items:center;justify-content:center;
          font-size:13px;
          ${isRouteCheckpoint ? 'animation:none;' : ''}
        ">📹</div>
      `;

      const icon = L.divIcon({
        html: iconHtml,
        className: '',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -18]
      });

      const marker = L.marker([cam.latitude, cam.longitude], { icon });

      const popupContent = `
        <div style="font-family:Inter,sans-serif;min-width:200px">
          <div style="font-size:11px;color:#64748b;text-transform:uppercase;font-weight:700;letter-spacing:0.05em;margin-bottom:4px">
            ${isRouteCheckpoint ? '🎯 Route Checkpoint' : hasAlert ? '🚨 Alert Active' : '📹 Camera Node'}
          </div>
          <div style="font-weight:800;font-size:14px;color:#0f172a;margin-bottom:6px">${cam.name}</div>
          <div style="font-size:12px;color:#475569;margin-bottom:4px">📍 ${cam.location_name}</div>
          <div style="font-size:11px;color:#94a3b8;font-family:monospace">
            ${cam.latitude.toFixed(4)}°N, ${cam.longitude.toFixed(4)}°E
          </div>
          <div style="margin-top:6px;padding:3px 6px;border-radius:4px;display:inline-block;
            font-size:10px;font-weight:700;
            background:${cam.is_active ? '#dcfce7' : '#f1f5f9'};
            color:${cam.is_active ? '#16a34a' : '#64748b'}">
            ${cam.is_active ? '● ONLINE' : '○ OFFLINE'}
          </div>
          ${cam.vendor ? `<span style="margin-left:6px;font-size:10px;color:#3b82f6;font-weight:700">${cam.vendor}</span>` : ''}
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.addTo(leafletMapRef.current);
      markersRef.current.push(marker);
    });
  }, [cameras, alerts, mapReady, routeData]);

  // Route polyline + checkpoint markers
  useEffect(() => {
    if (!leafletMapRef.current || !mapReady || !L) return;

    // Remove old route
    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }

    if (!routeData || !routeData.checkpoints || routeData.checkpoints.length < 2) return;

    const checkpoints = routeData.checkpoints.filter((cp: any) => cp.latitude && cp.longitude);
    if (checkpoints.length < 2) return;

    const coords = checkpoints.map((cp: any) => [cp.latitude, cp.longitude]);

    // Draw animated polyline
    const polyline = L.polyline(coords, {
      color: '#0891b2',
      weight: 4,
      opacity: 0.85,
      dashArray: '8 6',
    }).addTo(leafletMapRef.current);

    // Add numbered checkpoint markers
    checkpoints.forEach((cp: any, i: number) => {
      const html = `
        <div style="
          width:28px;height:28px;border-radius:50%;
          background:#0891b2;border:3px solid #fff;
          box-shadow:0 2px 8px rgba(0,0,0,0.35);
          display:flex;align-items:center;justify-content:center;
          font-size:11px;font-weight:800;color:#fff;
          font-family:monospace;
        ">${i + 1}</div>
      `;
      const icon = L.divIcon({ html, className: '', iconSize: [28, 28], iconAnchor: [14, 14], popupAnchor: [0, -16] });
      const m = L.marker([cp.latitude, cp.longitude], { icon });

      const pop = `
        <div style="font-family:Inter,sans-serif;min-width:180px">
          <div style="font-size:11px;color:#0891b2;font-weight:800;margin-bottom:4px">
            Checkpoint #${i + 1} of ${checkpoints.length}
          </div>
          <div style="font-weight:700;font-size:13px;color:#0f172a;margin-bottom:4px">${cp.location_name || cp.camera_name}</div>
          <div style="font-size:11px;color:#64748b">
            🕒 ${new Date(cp.timestamp).toLocaleString('en-IN')}
          </div>
          <div style="font-size:11px;color:#94a3b8;font-family:monospace;margin-top:3px">
            ${Number(cp.latitude).toFixed(4)}°N, ${Number(cp.longitude).toFixed(4)}°E
          </div>
          ${cp.confidence ? `<div style="font-size:10px;color:#16a34a;margin-top:4px;font-weight:700">ANPR Confidence: ${(cp.confidence * 100).toFixed(1)}%</div>` : ''}
        </div>
      `;
      m.bindPopup(pop);
      m.addTo(leafletMapRef.current);
      markersRef.current.push(m);
    });

    routeLayerRef.current = polyline;

    // Fit map to route
    try {
      leafletMapRef.current.fitBounds(polyline.getBounds(), { padding: [40, 40] });
    } catch {}
  }, [routeData, mapReady]);

  // When selectedPlate changes from outside
  useEffect(() => {
    if (selectedPlate && selectedPlate !== searchPlate) {
      setSearchPlate(selectedPlate);
      fetchRoute(selectedPlate);
    }
  }, [selectedPlate]);

  const fetchRoute = useCallback(async (plate: string) => {
    if (!plate.trim()) return;
    setLoadingRoute(true);
    setRouteError('');
    try {
      const data = await getVehicleRoute(plate.trim());
      setRouteData(data);
      if (onSelectPlate) onSelectPlate(plate.trim());
      if (!data?.checkpoints?.length || data.checkpoints_count === 0) {
        setRouteError(`No sightings found for plate "${plate}". Try simulating a route first.`);
      }
    } catch (err: any) {
      setRouteError('Failed to fetch route data. Check backend connection.');
    } finally {
      setLoadingRoute(false);
    }
  }, [onSelectPlate]);

  const clearRoute = () => {
    setRouteData(null);
    setRouteError('');
    if (routeLayerRef.current && leafletMapRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Map Controls */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem',
        display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between',
        alignItems: 'center', gap: '0.75rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            🗺️ Gujarat Police GIS Vehicle Tracker
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
            Real-time cross-camera route reconstruction · {cameras.length} cameras · {alerts.length} active alerts
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Enter plate (e.g. GJ01AB1234)"
            value={searchPlate}
            onChange={e => setSearchPlate(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && fetchRoute(searchPlate)}
            style={{
              padding: '0.5rem 0.875rem',
              background: 'var(--bg-primary)', border: '1.5px solid var(--border-color)',
              borderRadius: '8px', color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)', fontWeight: 700,
              fontSize: '0.875rem', width: '200px', outline: 'none'
            }}
          />
          <button
            onClick={() => fetchRoute(searchPlate)}
            disabled={loadingRoute}
            style={{
              padding: '0.5rem 1rem',
              background: 'var(--accent-blue)', color: '#fff',
              border: 'none', borderRadius: '8px',
              fontWeight: 700, fontSize: '0.85rem', cursor: loadingRoute ? 'wait' : 'pointer'
            }}
          >
            {loadingRoute ? '⏳ Tracing…' : '🔍 Trace Route'}
          </button>
          {routeData && (
            <button
              onClick={clearRoute}
              style={{
                padding: '0.5rem 0.8rem',
                background: 'var(--bg-primary)', border: '1.5px solid var(--border-color)',
                borderRadius: '8px', color: 'var(--text-secondary)',
                fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer'
              }}
            >
              ✕ Clear
            </button>
          )}
        </div>
      </div>

      {routeError && (
        <div style={{
          background: '#fff7ed', border: '1px solid rgba(217,119,6,0.3)',
          borderRadius: '8px', padding: '0.75rem 1rem',
          fontSize: '0.875rem', color: '#92400e', fontWeight: 500
        }}>
          ⚠️ {routeError}
        </div>
      )}

      {/* Map Legend */}
      <div style={{
        display: 'flex', gap: '1.25rem', flexWrap: 'wrap',
        padding: '0.6rem 1rem',
        background: 'var(--bg-card)', border: '1px solid var(--border-color)',
        borderRadius: '8px', fontSize: '0.78rem', fontWeight: 600
      }}>
        <span style={{ color: '#1d4ed8' }}>● Camera Node ({cameras.length})</span>
        <span style={{ color: '#dc2626' }}>● Active Alert ({alerts.length})</span>
        <span style={{ color: '#0891b2' }}>● Route Checkpoint ({routeData?.checkpoints_count || 0})</span>
        {routeData?.plate_number && (
          <span style={{ color: '#7c3aed', fontFamily: 'var(--font-mono)' }}>
            🎯 Tracking: {routeData.plate_number} ({routeData.checkpoints_count} sightings)
          </span>
        )}
      </div>

      {/* Leaflet Map */}
      <div className="map-wrapper">
        <div
          ref={mapRef}
          style={{ height: '500px', width: '100%', background: '#e8edf2' }}
        />
        {!mapReady && (
          <div style={{
            height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#f0f4f8', flexDirection: 'column', gap: '0.5rem'
          }}>
            <span style={{ fontSize: '1.5rem', animation: 'spin 1s linear infinite', display: 'inline-block' }}>🌐</span>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading GIS Map…</p>
          </div>
        )}
      </div>

      {/* Checkpoint Timeline */}
      {routeData && routeData.checkpoints_count > 0 && (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)', padding: '1.25rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
            🚗 Trajectory: <span style={{ fontFamily: 'var(--font-mono)', color: '#0891b2' }}>{routeData.plate_number}</span>
            &nbsp;— {routeData.checkpoints_count} Checkpoints
          </h4>
          <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
            {routeData.checkpoints.map((cp: any, i: number) => (
              <div key={i} style={{
                minWidth: '200px',
                background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
                borderRadius: '10px', padding: '0.875rem',
                borderLeft: '3px solid #0891b2'
              }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0891b2', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                  Checkpoint {i + 1}/{routeData.checkpoints_count}
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                  {cp.location_name || cp.camera_name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  🕒 {new Date(cp.timestamp).toLocaleString('en-IN')}
                </div>
                {cp.confidence && (
                  <div style={{ fontSize: '0.72rem', color: 'var(--status-green)', fontWeight: 700, marginTop: '0.25rem' }}>
                    ANPR: {(cp.confidence * 100).toFixed(1)}%
                  </div>
                )}
                {cp.is_simulated && (
                  <span style={{ fontSize: '0.68rem', background: '#fef3c7', color: '#92400e', padding: '1px 5px', borderRadius: '4px', fontWeight: 700, marginTop: '0.25rem', display: 'inline-block' }}>
                    SIMULATED
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
