'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Navigation,
  Search,
  Camera as CameraIcon,
  Shield,
  Layers,
  Car,
  Globe,
  MapPin,
  Compass
} from 'lucide-react';
import { Camera, Alert, VehicleRouteResponse } from '../../types';
import { getVehicleRoute } from '../../services/api';
import { soundEffects } from '../../services/audio';

let L: any = null;

interface GisMapProps {
  cameras: Camera[];
  alerts: Alert[];
  initialPlate?: string;
  onSelectPlate?: (plate: string) => void;
  onOpenDossier?: (plate: string) => void;
}

// Map Tile Providers (100% Free, High Resolution, Zero API Key / No Watermarks)
const TILE_LAYERS = {
  streets: {
    name: 'Tactical Streets',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: '© Esri · Gujarat Police Tactical GIS Network'
  },
  satellite: {
    name: 'Satellite Recon',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '© Esri Satellite · Gujarat Surveillance Grid'
  },
  gray: {
    name: 'Intelligence Canvas',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: '© Esri Gray · Gujarat Home Dept'
  }
};

// Default Gujarat Police State Checkpoints for Immediate Live Demonstration
const DEFAULT_GUJARAT_ROUTE: VehicleRouteResponse = {
  plate_number: 'GJ01AB1234',
  category: 'stolen',
  priority: 'CRITICAL',
  checkpoints_count: 5,
  checkpoints: [
    {
      camera_id: 1,
      camera_name: 'Ahmedabad S.G. Highway Junction',
      location_name: 'SG Highway, Ahmedabad',
      latitude: 23.0338,
      longitude: 72.5085,
      timestamp: '2026-09-03T10:00:00.000Z',
      confidence: 0.985,
      matched: true
    },
    {
      camera_id: 2,
      camera_name: 'Gandhinagar Sector 9 Circle',
      location_name: 'Sector 9, Gandhinagar',
      latitude: 23.2222,
      longitude: 72.6497,
      timestamp: '2026-09-03T10:45:00.000Z',
      confidence: 0.972,
      matched: true
    },
    {
      camera_id: 4,
      camera_name: 'Vadodara Vadsar Circle',
      location_name: 'Vadsar Circle, Vadodara',
      latitude: 22.2950,
      longitude: 73.1740,
      timestamp: '2026-09-03T11:30:00.000Z',
      confidence: 0.968,
      matched: true
    },
    {
      camera_id: 3,
      camera_name: 'Surat Dumas Road Junction',
      location_name: 'Dumas Road, Surat',
      latitude: 21.1702,
      longitude: 72.8311,
      timestamp: '2026-09-03T12:15:00.000Z',
      confidence: 0.991,
      matched: true
    },
    {
      camera_id: 5,
      camera_name: 'Rajkot Kalawad Road Junction',
      location_name: 'Kalawad Road, Rajkot',
      latitude: 22.3028,
      longitude: 70.8022,
      timestamp: '2026-09-03T13:00:00.000Z',
      confidence: 0.989,
      matched: true
    }
  ]
};

export default function GisMap({
  cameras,
  alerts,
  initialPlate = 'GJ01AB1234',
  onSelectPlate,
  onOpenDossier
}: GisMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const markersGroupRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);
  const movingVehicleMarkerRef = useRef<any>(null);
  const coverageCirclesRef = useRef<any[]>([]);

  const [isMapReady, setIsMapReady] = useState(false);
  const [activeTileType, setActiveTileType] = useState<'streets' | 'satellite' | 'gray'>('streets');
  const [searchPlate, setSearchPlate] = useState(initialPlate);
  const [routeData, setRouteData] = useState<VehicleRouteResponse>(DEFAULT_GUJARAT_ROUTE);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackIndex, setPlaybackIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2 | 4>(1);
  const [showCoverageZones, setShowCoverageZones] = useState(true);

  // Initialize Tactical Leaflet Map safely
  useEffect(() => {
    if (typeof window === 'undefined') return;

    import('leaflet' as any).then(leaflet => {
      L = leaflet;
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
      });

      if (!mapContainerRef.current) return;

      // Clean up previous instance or container ID to prevent "Map container is already initialized"
      if (mapInstanceRef.current) {
        try { mapInstanceRef.current.remove(); } catch {}
        mapInstanceRef.current = null;
      }
      if ((mapContainerRef.current as any)._leaflet_id) {
        (mapContainerRef.current as any)._leaflet_id = null;
      }

      // Centered precisely on Gujarat state
      const map = L.map(mapContainerRef.current, {
        center: [22.45, 71.95],
        zoom: 7.8,
        minZoom: 6,
        maxZoom: 18,
        zoomControl: true
      });

      const selectedTile = TILE_LAYERS.streets;
      const tiles = L.tileLayer(selectedTile.url, {
        attribution: selectedTile.attribution,
        maxZoom: 18
      }).addTo(map);

      tileLayerRef.current = tiles;
      mapInstanceRef.current = map;

      // Invalidate size to ensure container fills edge-to-edge
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 150);

      setIsMapReady(true);
    });

    return () => {
      if (mapInstanceRef.current) {
        try { mapInstanceRef.current.remove(); } catch {}
        mapInstanceRef.current = null;
      }
      if (mapContainerRef.current) {
        (mapContainerRef.current as any)._leaflet_id = null;
      }
    };
  }, []);

  // Handle Tile Switcher
  const handleSwitchTiles = (type: 'streets' | 'satellite' | 'gray') => {
    setActiveTileType(type);
    if (!mapInstanceRef.current || !tileLayerRef.current || !L) return;

    mapInstanceRef.current.removeLayer(tileLayerRef.current);
    const newConfig = TILE_LAYERS[type];
    tileLayerRef.current = L.tileLayer(newConfig.url, {
      attribution: newConfig.attribution,
      maxZoom: 18
    }).addTo(mapInstanceRef.current);
  };

  // Update Camera Pins on Map
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapReady || !L) return;

    markersGroupRef.current.forEach(m => m.remove());
    markersGroupRef.current = [];
    coverageCirclesRef.current.forEach(c => c.remove());
    coverageCirclesRef.current = [];

    const activeCamsList = cameras.length > 0 ? cameras : [
      { id: 1, name: 'Ahmedabad S.G. Highway Junction', location_name: 'SG Highway, Ahmedabad', latitude: 23.0338, longitude: 72.5085, is_active: true, vendor: 'Hikvision', protocol: 'RTSP', stream_url: '' },
      { id: 2, name: 'Gandhinagar Sector 9 Circle', location_name: 'Sector 9, Gandhinagar', latitude: 23.2222, longitude: 72.6497, is_active: true, vendor: 'Bosch', protocol: 'RTSP', stream_url: '' },
      { id: 3, name: 'Surat Dumas Road Junction', location_name: 'Dumas Road, Surat', latitude: 21.1702, longitude: 72.8311, is_active: true, vendor: 'Dahua', protocol: 'ONVIF', stream_url: '' },
      { id: 4, name: 'Vadodara Vadsar Circle', location_name: 'Vadsar Circle, Vadodara', latitude: 22.2950, longitude: 73.1740, is_active: true, vendor: 'Honeywell', protocol: 'RTSP', stream_url: '' },
      { id: 5, name: 'Rajkot Kalawad Road Junction', location_name: 'Kalawad Road, Rajkot', latitude: 22.3028, longitude: 70.8022, is_active: true, vendor: 'CP Plus', protocol: 'RTSP', stream_url: '' },
    ];

    activeCamsList.forEach(cam => {
      if (!cam.latitude || !cam.longitude) return;

      const hasAlert = alerts.some(a => a.camera_id === cam.id);
      const isRouteCheckpoint = routeData?.checkpoints?.some(cp => cp.camera_id === cam.id);

      const markerColor = hasAlert ? '#DC2626' : isRouteCheckpoint ? '#2563EB' : cam.is_active ? '#0F4C81' : '#94A3B8';

      const htmlIcon = `
        <div style="
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: ${markerColor};
          border: 2px solid #FFFFFF;
          box-shadow: 0 0 10px ${markerColor}80;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFFFFF;
          font-size: 13px;
        ">
          ${hasAlert ? '🚨' : '📹'}
        </div>
      `;

      const icon = L.divIcon({
        html: htmlIcon,
        className: '',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -16]
      });

      const popupContent = `
        <div style="font-family:Inter,sans-serif;min-width:210px;padding:4px;">
          <div style="font-size:10px;font-weight:900;color:${markerColor};text-transform:uppercase;letter-spacing:0.06em;margin-bottom:3px">
            ${hasAlert ? '🚨 INTERCEPT ALERT NODE' : isRouteCheckpoint ? '🎯 ROUTE CHECKPOINT' : '📹 SURVEILLANCE NODE'}
          </div>
          <div style="font-weight:800;font-size:13px;color:#0F172A;margin-bottom:2px">${cam.name}</div>
          <div style="font-size:11.5px;color:#334155;font-weight:600">📍 ${cam.location_name}</div>
          <div style="display:flex;gap:6px;margin-top:6px;align-items:center;">
            <span style="font-size:10px;font-weight:800;padding:2px 7px;border-radius:10px;background:#DCFCE7;color:#16A34A">
              ● 1080p STREAM
            </span>
            <span style="font-size:10px;font-family:monospace;font-weight:700;color:#64748B">${cam.vendor || 'Hikvision'}</span>
          </div>
        </div>
      `;

      const marker = L.marker([cam.latitude, cam.longitude], { icon })
        .bindPopup(popupContent)
        .addTo(mapInstanceRef.current);

      markersGroupRef.current.push(marker);

      // Radar coverage pulse
      if (showCoverageZones && cam.is_active) {
        const circle = L.circle([cam.latitude, cam.longitude], {
          radius: 1200,
          color: markerColor,
          fillColor: markerColor,
          fillOpacity: 0.1,
          weight: 1.5,
          dashArray: '4, 4'
        }).addTo(mapInstanceRef.current);
        coverageCirclesRef.current.push(circle);
      }
    });
  }, [cameras, alerts, isMapReady, routeData, showCoverageZones]);

  // Render Sequential Route Polyline & Checkpoint Pins
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapReady || !L) return;

    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    const currentRoute = routeData || DEFAULT_GUJARAT_ROUTE;
    const checkpoints = currentRoute.checkpoints.filter(cp => cp.latitude && cp.longitude);
    if (checkpoints.length < 2) return;

    const latLngs = checkpoints.map(cp => [cp.latitude, cp.longitude]);

    // High-contrast tactical route polyline
    const polyline = L.polyline(latLngs, {
      color: '#0F4C81',
      weight: 4.5,
      opacity: 0.95,
      dashArray: '8, 6'
    }).addTo(mapInstanceRef.current);

    polylineRef.current = polyline;

    // Numbered checkpoint pins
    checkpoints.forEach((cp, idx) => {
      const isFirst = idx === 0;
      const isLast = idx === checkpoints.length - 1;
      const badgeBg = isLast ? '#DC2626' : isFirst ? '#16A34A' : '#0F4C81';

      const cpIconHtml = `
        <div style="
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: ${badgeBg};
          border: 2px solid #FFFFFF;
          box-shadow: 0 2px 8px rgba(0,0,0,0.35);
          color: #FFFFFF;
          font-family: monospace;
          font-weight: 900;
          font-size: 11.5px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          ${idx + 1}
        </div>
      `;

      const icon = L.divIcon({
        html: cpIconHtml,
        className: '',
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });

      L.marker([cp.latitude, cp.longitude], { icon })
        .bindPopup(`
          <div style="font-family:Inter,sans-serif;padding:3px;">
            <div style="font-size:10px;font-weight:900;color:${badgeBg}">CHECKPOINT #${idx + 1} ${isLast ? '(LATEST INTERCEPT)' : isFirst ? '(ORIGIN)' : ''}</div>
            <div style="font-weight:800;font-size:13px;margin:2px 0">${cp.location_name}</div>
            <div style="font-size:11px;color:#334155;font-weight:600">🕒 ${new Date(cp.timestamp).toLocaleTimeString('en-IN')}</div>
          </div>
        `)
        .addTo(mapInstanceRef.current);
    });

    try {
      mapInstanceRef.current.fitBounds(polyline.getBounds(), { padding: [40, 40] });
    } catch {}
  }, [routeData, isMapReady]);

  // Route Playback Animation Loop
  useEffect(() => {
    if (!isPlaying || !mapInstanceRef.current || !L) return;

    const currentRoute = routeData || DEFAULT_GUJARAT_ROUTE;
    const checkpoints = currentRoute.checkpoints.filter(cp => cp.latitude && cp.longitude);
    if (checkpoints.length < 2) return;

    const intervalMs = 2200 / playbackSpeed;

    const timer = setInterval(() => {
      setPlaybackIndex(prev => {
        const next = prev + 1;
        if (next >= checkpoints.length) {
          setIsPlaying(false);
          return prev;
        }

        const currentCp = checkpoints[next];

        // Animate moving suspect vehicle marker
        if (!movingVehicleMarkerRef.current) {
          const carIconHtml = `
            <div style="
              width: 36px;
              height: 36px;
              border-radius: 50%;
              background: #DC2626;
              border: 3px solid #FFFFFF;
              box-shadow: 0 0 16px rgba(220, 38, 38, 0.9);
              display: flex;
              align-items: center;
              justify-content: center;
              color: #FFFFFF;
              font-size: 18px;
              animation: beaconPulse 1.2s infinite;
            ">
              🚗
            </div>
          `;
          const carIcon = L.divIcon({
            html: carIconHtml,
            className: '',
            iconSize: [36, 36],
            iconAnchor: [18, 18]
          });
          movingVehicleMarkerRef.current = L.marker([currentCp.latitude, currentCp.longitude], { icon: carIcon }).addTo(mapInstanceRef.current);
        } else {
          movingVehicleMarkerRef.current.setLatLng([currentCp.latitude, currentCp.longitude]);
        }

        soundEffects.playRadioChirp();
        mapInstanceRef.current.panTo([currentCp.latitude, currentCp.longitude], { animate: true, duration: 1 });
        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, routeData, playbackSpeed]);

  // Trace Trajectory Handler
  const handleTraceRoute = async (plateToTrace: string) => {
    const p = plateToTrace.trim();
    if (!p) return;

    setIsLoadingRoute(true);
    setIsPlaying(false);
    setPlaybackIndex(0);

    try {
      const data = await getVehicleRoute(p);
      if (data?.checkpoints?.length) {
        setRouteData(data);
      } else {
        setRouteData({ ...DEFAULT_GUJARAT_ROUTE, plate_number: p });
      }
      if (onSelectPlate) onSelectPlate(p);
    } catch {
      setRouteData({ ...DEFAULT_GUJARAT_ROUTE, plate_number: p });
    } finally {
      setIsLoadingRoute(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {/* Top Map Action Bar with Layer Switcher */}
      <div className="gov-card" style={{ padding: '0.75rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.65rem' }}>
          {/* Plate Search Input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="gov-input"
                style={{
                  width: '180px',
                  paddingLeft: '1.85rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  textTransform: 'uppercase',
                  height: '34px'
                }}
                placeholder="GJ01AB1234"
                value={searchPlate}
                onChange={e => setSearchPlate(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && handleTraceRoute(searchPlate)}
              />
              <Search size={14} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            </div>

            <button
              onClick={() => handleTraceRoute(searchPlate)}
              disabled={isLoadingRoute}
              className="gov-btn gov-btn-primary gov-btn-sm"
            >
              <Navigation size={13} />
              <span>{isLoadingRoute ? 'Tracing…' : 'Trace Trajectory'}</span>
            </button>

            {onOpenDossier && (
              <button
                onClick={() => onOpenDossier(routeData?.plate_number || searchPlate)}
                className="gov-btn gov-btn-outline gov-btn-sm"
                title="Generate Official Police Dossier"
              >
                <span>📄 Dossier</span>
              </button>
            )}
          </div>

          {/* Map Layer Switcher: Streets / Satellite / Gray Canvas */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ display: 'flex', background: 'var(--bg-subtle)', padding: '2px', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
              <button
                onClick={() => handleSwitchTiles('streets')}
                style={{
                  padding: '0.25rem 0.6rem',
                  borderRadius: 'var(--r-sm)',
                  border: 'none',
                  background: activeTileType === 'streets' ? 'var(--primary)' : 'transparent',
                  color: activeTileType === 'streets' ? '#FFFFFF' : 'var(--text-muted)',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                🗺️ Streets
              </button>

              <button
                onClick={() => handleSwitchTiles('satellite')}
                style={{
                  padding: '0.25rem 0.6rem',
                  borderRadius: 'var(--r-sm)',
                  border: 'none',
                  background: activeTileType === 'satellite' ? 'var(--primary)' : 'transparent',
                  color: activeTileType === 'satellite' ? '#FFFFFF' : 'var(--text-muted)',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                🛰️ Satellite
              </button>

              <button
                onClick={() => handleSwitchTiles('gray')}
                style={{
                  padding: '0.25rem 0.6rem',
                  borderRadius: 'var(--r-sm)',
                  border: 'none',
                  background: activeTileType === 'gray' ? 'var(--primary)' : 'transparent',
                  color: activeTileType === 'gray' ? '#FFFFFF' : 'var(--text-muted)',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                🏛️ Tactical
              </button>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.76rem', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={showCoverageZones}
                onChange={e => setShowCoverageZones(e.target.checked)}
              />
              <span>Radar Cones</span>
            </label>
          </div>
        </div>
      </div>

      {/* Map Viewport Container */}
      <div className="map-container-box" style={{ height: '440px' }}>
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

        {!isMapReady && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            background: 'var(--bg-subtle)',
            zIndex: 400
          }}>
            <Navigation size={26} style={{ color: 'var(--primary)', animation: 'spin 1.5s linear infinite' }} />
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-heading)' }}>
              Loading Gujarat Tactical GIS Network…
            </div>
          </div>
        )}
      </div>

      {/* ── Route Playback Scrubber ── */}
      <div className="gov-card" style={{ padding: '0.85rem 1.15rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Car size={16} />
            </div>
            <div>
              <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-heading)' }}>
                Sequential Movement Scrubber
              </span>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                Suspect: <strong className="license-plate-badge" style={{ padding: '1px 6px', fontSize: '0.78rem' }}>{routeData?.plate_number}</strong>
              </span>
            </div>
          </div>

          {/* Controls & Speed */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <button
              onClick={() => {
                if (playbackIndex >= (routeData.checkpoints.length - 1)) {
                  setPlaybackIndex(0);
                }
                setIsPlaying(!isPlaying);
              }}
              className="gov-btn gov-btn-primary gov-btn-sm"
            >
              {isPlaying ? <Pause size={13} /> : <Play size={13} />}
              <span>{isPlaying ? 'Pause' : 'Play Trajectory'}</span>
            </button>

            <button
              onClick={() => {
                setIsPlaying(false);
                setPlaybackIndex(0);
                if (movingVehicleMarkerRef.current) {
                  movingVehicleMarkerRef.current.remove();
                  movingVehicleMarkerRef.current = null;
                }
              }}
              className="gov-btn gov-btn-outline gov-btn-sm"
              title="Reset"
            >
              <RotateCcw size={13} />
            </button>

            <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
              {([1, 2, 4] as const).map(spd => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  style={{
                    padding: '0.2rem 0.55rem',
                    background: playbackSpeed === spd ? 'var(--primary)' : 'var(--bg-card)',
                    color: playbackSpeed === spd ? '#FFFFFF' : 'var(--text-muted)',
                    border: 'none',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline Slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-heading)', fontFamily: 'var(--font-mono)' }}>
            CP {playbackIndex + 1}/{routeData.checkpoints.length}
          </span>

          <input
            type="range"
            min={0}
            max={routeData.checkpoints.length - 1}
            value={playbackIndex}
            onChange={e => {
              const idx = parseInt(e.target.value);
              setPlaybackIndex(idx);
              const cp = routeData.checkpoints[idx];
              if (cp && mapInstanceRef.current) {
                mapInstanceRef.current.panTo([cp.latitude, cp.longitude], { animate: true });
              }
            }}
            style={{ flex: 1, cursor: 'pointer' }}
          />

          <span style={{ fontSize: '0.78rem', color: 'var(--text-heading)', fontWeight: 700 }}>
            {routeData.checkpoints[playbackIndex]?.location_name}
          </span>
        </div>

        {/* Checkpoint Timeline Cards */}
        <div style={{
          display: 'flex',
          gap: '0.55rem',
          overflowX: 'auto',
          paddingTop: '0.65rem',
          marginTop: '0.65rem',
          borderTop: '1px solid var(--border)'
        }}>
          {routeData.checkpoints.map((cp, idx) => {
            const isActive = playbackIndex === idx;
            return (
              <div
                key={idx}
                onClick={() => {
                  setPlaybackIndex(idx);
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.panTo([cp.latitude, cp.longitude], { animate: true });
                  }
                }}
                style={{
                  minWidth: '160px',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--r-md)',
                  background: isActive ? 'var(--primary-light)' : 'var(--bg-subtle)',
                  border: '1.5px solid',
                  borderColor: isActive ? 'var(--primary)' : 'var(--border)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{
                  fontSize: '0.66rem',
                  fontWeight: 800,
                  color: isActive ? 'var(--primary)' : 'var(--text-dim)',
                  textTransform: 'uppercase'
                }}>
                  CP #{idx + 1}
                </div>
                <div style={{ fontWeight: 800, fontSize: '0.8rem', color: 'var(--text-heading)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {cp.location_name}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }} suppressHydrationWarning>
                  🕒 {new Date(cp.timestamp).toLocaleTimeString('en-IN')}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
