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
  Compass,
  AlertTriangle,
  Radio,
  Clock,
  Target,
  Send,
  Zap
} from 'lucide-react';
import { Camera, Alert, VehicleRouteResponse, PredictedJunction, PatrolUnit } from '../../types';
import { getVehicleRoute, getPredictiveIntercept } from '../../services/api';
import { soundEffects } from '../../services/audio';

let L: any = null;

interface GisMapProps {
  cameras: Camera[];
  alerts: Alert[];
  initialPlate?: string;
  onSelectPlate?: (plate: string) => void;
  onOpenDossier?: (plate: string) => void;
  onOpenDispatch?: (alert: Alert) => void;
}

// Map Tile Providers (High Resolution, Zero API Key / Free)
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
  vehicle_make_model: 'White Fortuner SUV',
  checkpoints_count: 5,
  total_distance_km: 18.6,
  average_velocity_kmh: 68.2,
  cloned_plate_anomaly: false,
  checkpoints: [
    {
      camera_id: 1,
      camera_name: 'Chimanbhai Bridge Junction',
      location_name: 'Subhash Bridge - RTO, Ahmedabad',
      latitude: 23.0645,
      longitude: 72.5780,
      timestamp: '2026-09-03T10:00:00.000Z',
      confidence: 0.985,
      speed_kmh: 58.0,
      speed_category: 'MODERATE',
      vehicle_color: 'White',
      vehicle_type: 'SUV',
      matched: true
    },
    {
      camera_id: 2,
      camera_name: 'Janpath Hotel Circle',
      location_name: 'Ashram Road Corridor, Ahmedabad',
      latitude: 23.0531,
      longitude: 72.5694,
      timestamp: '2026-09-03T10:14:00.000Z',
      confidence: 0.978,
      speed_kmh: 62.5,
      speed_category: 'MODERATE',
      vehicle_color: 'White',
      vehicle_type: 'SUV',
      matched: true
    },
    {
      camera_id: 3,
      camera_name: 'O.N.G.C. Chandkheda Circle',
      location_name: 'Gandhinagar-Ahmedabad Highway',
      latitude: 23.1025,
      longitude: 72.5935,
      timestamp: '2026-09-03T10:28:00.000Z',
      confidence: 0.991,
      speed_kmh: 76.0,
      speed_category: 'MODERATE',
      vehicle_color: 'White',
      vehicle_type: 'SUV',
      matched: true
    },
    {
      camera_id: 4,
      camera_name: 'Paldi Crossroad Circle',
      location_name: 'Paldi, Central Ahmedabad',
      latitude: 23.0135,
      longitude: 72.5620,
      timestamp: '2026-09-03T10:42:00.000Z',
      confidence: 0.965,
      speed_kmh: 54.0,
      speed_category: 'NORMAL',
      vehicle_color: 'White',
      vehicle_type: 'SUV',
      matched: true
    },
    {
      camera_id: 5,
      camera_name: 'Ahmedabad S.G. Highway Junction',
      location_name: 'S.G. Highway Express, Ahmedabad',
      latitude: 23.0338,
      longitude: 72.5085,
      timestamp: '2026-09-03T10:55:00.000Z',
      confidence: 0.989,
      speed_kmh: 84.5,
      speed_category: 'OVERSPEEDING',
      vehicle_color: 'White',
      vehicle_type: 'SUV',
      matched: true
    }
  ]
};

const DEFAULT_PREDICTED_JUNCTIONS: PredictedJunction[] = [
  {
    rank: 1,
    junction_id: 'j_sarkhej',
    junction_name: 'Sarkhej-Sanand Toll Crossroad',
    location_name: 'Sarkhej NH-47 Bypass, Ahmedabad',
    latitude: 22.9862,
    longitude: 72.4984,
    distance_km: 5.4,
    estimated_speed_kmh: 84.5,
    eta_minutes: 3.8,
    confidence_score: 0.92,
    tactical_advisory: 'Deploy tire-shredding spike strips & activate signal lock (Barricade Alpha)'
  },
  {
    rank: 2,
    junction_id: 'j_vadsar',
    junction_name: 'Vadodara Vadsar Circle',
    location_name: 'Vadsar Ring Road, Vadodara',
    latitude: 22.2950,
    longitude: 73.1740,
    distance_km: 98.2,
    estimated_speed_kmh: 84.5,
    eta_minutes: 69.7,
    confidence_score: 0.81,
    tactical_advisory: 'Station Highway Interceptor Unit & alert Vadodara CP (Barricade Bravo)'
  }
];

export default function GisMap({
  cameras,
  alerts,
  initialPlate = 'GJ01AB1234',
  onSelectPlate,
  onOpenDossier,
  onOpenDispatch
}: GisMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const markersGroupRef = useRef<any[]>([]);
  const routePolylinesRef = useRef<any[]>([]);
  const interceptVectorsRef = useRef<any[]>([]);
  const movingVehicleMarkerRef = useRef<any>(null);
  const coverageCirclesRef = useRef<any[]>([]);
  const pcrMarkersRef = useRef<any[]>([]);

  const [isMapReady, setIsMapReady] = useState(false);
  const [activeTileType, setActiveTileType] = useState<'streets' | 'satellite' | 'gray'>('streets');
  const [searchPlate, setSearchPlate] = useState(initialPlate);
  const [routeData, setRouteData] = useState<VehicleRouteResponse>(DEFAULT_GUJARAT_ROUTE);
  const [predictedJunctions, setPredictedJunctions] = useState<PredictedJunction[]>(DEFAULT_PREDICTED_JUNCTIONS);
  const [pcrUnits, setPcrUnits] = useState<PatrolUnit[]>([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  // Tactical Layer Toggles
  const [showPredictedIntercept, setShowPredictedIntercept] = useState(true);
  const [showPcrUnits, setShowPcrUnits] = useState(true);
  const [showCoverageZones, setShowCoverageZones] = useState(false);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackIndex, setPlaybackIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2 | 4>(1);

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

      if (mapInstanceRef.current) {
        try { mapInstanceRef.current.remove(); } catch {}
        mapInstanceRef.current = null;
      }
      if ((mapContainerRef.current as any)._leaflet_id) {
        (mapContainerRef.current as any)._leaflet_id = null;
      }

      // Centered precisely on Gujarat state (Ahmedabad-Gandhinagar hub)
      const map = L.map(mapContainerRef.current, {
        center: [23.0338, 72.5450],
        zoom: 11,
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

  // Fetch Trajectory & Predictive Intercept Data
  const handleTraceRoute = async (plateToTrace: string) => {
    const p = plateToTrace.trim();
    if (!p) return;

    setIsLoadingRoute(true);
    setIsPlaying(false);
    setPlaybackIndex(0);

    try {
      // 1. Fetch cross-camera correlated route
      const rData = await getVehicleRoute(p);
      if (rData?.checkpoints?.length) {
        setRouteData(rData);
      } else {
        setRouteData({ ...DEFAULT_GUJARAT_ROUTE, plate_number: p });
      }

      // 2. Fetch predictive interception intelligence
      try {
        const interceptData = await getPredictiveIntercept(p);
        if (interceptData?.predicted_intercept_junctions?.length) {
          setPredictedJunctions(interceptData.predicted_intercept_junctions);
        }
        if (interceptData?.nearest_pcr_units?.length) {
          setPcrUnits(interceptData.nearest_pcr_units);
        }
      } catch (err) {
        console.warn("Could not fetch predictive intercept data:", err);
      }

      if (onSelectPlate) onSelectPlate(p);
      soundEffects.playRadioChirp();
    } catch {
      setRouteData({ ...DEFAULT_GUJARAT_ROUTE, plate_number: p });
    } finally {
      setIsLoadingRoute(false);
    }
  };

  // Initial Load on Mount
  useEffect(() => {
    if (initialPlate) {
      handleTraceRoute(initialPlate);
    }
  }, [initialPlate]);

  // Update Camera Pins on Map
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapReady || !L) return;

    markersGroupRef.current.forEach(m => m.remove());
    markersGroupRef.current = [];
    coverageCirclesRef.current.forEach(c => c.remove());
    coverageCirclesRef.current = [];

    const activeCamsList = cameras.length > 0 ? cameras : [
      { id: 1, name: 'Chimanbhai Bridge Junction', location_name: 'Subhash Bridge - RTO, Ahmedabad', latitude: 23.0645, longitude: 72.5780, is_active: true, vendor: 'Hikvision', protocol: 'RTSP', stream_url: '' },
      { id: 2, name: 'Janpath Hotel Circle', location_name: 'Ashram Road Corridor, Ahmedabad', latitude: 23.0531, longitude: 72.5694, is_active: true, vendor: 'CP Plus', protocol: 'RTSP', stream_url: '' },
      { id: 3, name: 'O.N.G.C. Chandkheda Circle', location_name: 'Gandhinagar-Ahmedabad Highway', latitude: 23.1025, longitude: 72.5935, is_active: true, vendor: 'Dahua', protocol: 'RTSP', stream_url: '' },
      { id: 4, name: 'Paldi Crossroad Circle', location_name: 'Paldi, Central Ahmedabad', latitude: 23.0135, longitude: 72.5620, is_active: true, vendor: 'Honeywell', protocol: 'RTSP', stream_url: '' },
      { id: 5, name: 'Ahmedabad S.G. Highway Junction', location_name: 'SG Highway, Ahmedabad', latitude: 23.0338, longitude: 72.5085, is_active: true, vendor: 'Hikvision', protocol: 'RTSP', stream_url: '' }
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
        <div style="font-family:Inter,sans-serif;min-width:220px;padding:4px;">
          <div style="font-size:10px;font-weight:900;color:${markerColor};text-transform:uppercase;letter-spacing:0.06em;margin-bottom:3px">
            ${hasAlert ? '🚨 INTERCEPT ALERT NODE' : isRouteCheckpoint ? '🎯 CORRIDOR CHECKPOINT' : '📹 SURVEILLANCE NODE'}
          </div>
          <div style="font-weight:800;font-size:13px;color:#0F172A;margin-bottom:2px">${cam.name}</div>
          <div style="font-size:11.5px;color:#334155;font-weight:600">📍 ${cam.location_name}</div>
          <div style="display:flex;gap:6px;margin-top:6px;align-items:center;">
            <span style="font-size:10px;font-weight:800;padding:2px 7px;border-radius:10px;background:#DCFCE7;color:#16A34A">
              ● 1080p RTSP
            </span>
            <span style="font-size:10px;font-family:monospace;font-weight:700;color:#64748B">${cam.vendor || 'Hikvision'}</span>
          </div>
        </div>
      `;

      const marker = L.marker([cam.latitude, cam.longitude], { icon })
        .bindPopup(popupContent)
        .addTo(mapInstanceRef.current);

      markersGroupRef.current.push(marker);

      if (showCoverageZones && cam.is_active) {
        const circle = L.circle([cam.latitude, cam.longitude], {
          radius: 1000,
          color: markerColor,
          fillColor: markerColor,
          fillOpacity: 0.12,
          weight: 1.5,
          dashArray: '4, 4'
        }).addTo(mapInstanceRef.current);
        coverageCirclesRef.current.push(circle);
      }
    });
  }, [cameras, alerts, isMapReady, routeData, showCoverageZones]);

  // Render Speed-Coded Route Segments & Chronological Numbered Waypoints
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapReady || !L) return;

    routePolylinesRef.current.forEach(p => p.remove());
    routePolylinesRef.current = [];

    const currentRoute = routeData || DEFAULT_GUJARAT_ROUTE;
    const checkpoints = currentRoute.checkpoints.filter(cp => cp.latitude && cp.longitude);
    if (checkpoints.length < 2) return;

    // Segmented polylines with speed-based color coding
    for (let i = 0; i < checkpoints.length - 1; i++) {
      const cp1 = checkpoints[i];
      const cp2 = checkpoints[i + 1];
      const segSpeed = cp2.corridor_velocity_kmh || cp2.speed_kmh || 60.0;

      // Color coding: Green (<55), Amber (55-80), Red (>80)
      let segColor = '#16A34A';
      if (segSpeed > 80.0) segColor = '#DC2626';
      else if (segSpeed > 55.0) segColor = '#D97706';

      const poly = L.polyline(
        [[cp1.latitude, cp1.longitude], [cp2.latitude, cp2.longitude]],
        {
          color: segColor,
          weight: 5,
          opacity: 0.95,
          dashArray: '10, 6'
        }
      ).addTo(mapInstanceRef.current);

      poly.bindPopup(`
        <div style="font-family:Inter,sans-serif;padding:3px;">
          <div style="font-size:10px;font-weight:900;color:${segColor}">CORRIDOR SEGMENT ${i + 1} ➔ ${i + 2}</div>
          <div style="font-size:13px;font-weight:800;color:#0F172A">Velocity: ${segSpeed.toFixed(0)} km/h</div>
          <div style="font-size:11px;color:#64748B">${segSpeed > 80 ? '⚠️ OVER-SPEEDING DETECTED' : 'Normal Traffic Velocity'}</div>
        </div>
      `);

      routePolylinesRef.current.push(poly);
    }

    // Numbered checkpoint pins
    checkpoints.forEach((cp, idx) => {
      const isFirst = idx === 0;
      const isLast = idx === checkpoints.length - 1;
      const badgeBg = isLast ? '#DC2626' : isFirst ? '#16A34A' : '#0F4C81';

      const cpIconHtml = `
        <div style="
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: ${badgeBg};
          border: 2.5px solid #FFFFFF;
          box-shadow: 0 2px 10px rgba(0,0,0,0.4);
          color: #FFFFFF;
          font-family: monospace;
          font-weight: 900;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          ${isLast ? 'animation: beaconPulse 1.4s infinite;' : ''}
        ">
          ${idx + 1}
        </div>
      `;

      const icon = L.divIcon({
        html: cpIconHtml,
        className: '',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([cp.latitude, cp.longitude], { icon })
        .bindPopup(`
          <div style="font-family:Inter,sans-serif;padding:4px;min-width:210px">
            <div style="font-size:10px;font-weight:900;color:${badgeBg};text-transform:uppercase">
              WAYPOINT #${idx + 1} ${isLast ? '🚨 LATEST SIGHTING' : isFirst ? '🏁 ORIGIN' : ''}
            </div>
            <div style="font-weight:800;font-size:13px;margin:3px 0;color:#0F172A">${cp.location_name}</div>
            <div style="font-size:11.5px;color:#334155;font-weight:700">⚡ Instant Speed: ${cp.speed_kmh || 58} km/h</div>
            <div style="font-size:11px;color:#64748B">🕒 ${new Date(cp.timestamp).toLocaleTimeString('en-IN')}</div>
            ${cp.sha256_hash ? `<div style="font-size:9.5px;font-family:monospace;color:#0284C7;margin-top:4px">SEC 65B: ${cp.sha256_hash.slice(0, 12)}...</div>` : ''}
          </div>
        `)
        .addTo(mapInstanceRef.current);

      routePolylinesRef.current.push(marker);
    });

    try {
      const allCoords = checkpoints.map(c => [c.latitude, c.longitude]);
      const bounds = L.latLngBounds(allCoords);
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
    } catch {}
  }, [routeData, isMapReady]);

  // Render Predictive Escape Route & Intercept Junctions
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapReady || !L) return;

    interceptVectorsRef.current.forEach(v => v.remove());
    interceptVectorsRef.current = [];

    if (!showPredictedIntercept || !predictedJunctions?.length) return;

    const currentRoute = routeData || DEFAULT_GUJARAT_ROUTE;
    const checkpoints = currentRoute.checkpoints.filter(cp => cp.latitude && cp.longitude);
    if (checkpoints.length === 0) return;

    const lastCp = checkpoints[checkpoints.length - 1];

    predictedJunctions.forEach((pj, idx) => {
      // 1. Glowing Dashed Intercept Vector from Last Known Location
      const vector = L.polyline(
        [[lastCp.latitude, lastCp.longitude], [pj.latitude, pj.longitude]],
        {
          color: idx === 0 ? '#EF4444' : '#F59E0B',
          weight: 3.5,
          dashArray: '6, 8',
          opacity: 0.85
        }
      ).addTo(mapInstanceRef.current);

      interceptVectorsRef.current.push(vector);

      // 2. Pulsing Intercept Target Node Marker
      const interceptHtml = `
        <div style="
          position: relative;
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: ${idx === 0 ? '#EF4444' : '#F59E0B'}33;
            animation: ping 1.5s cubic-bezier(0,0,0.2,1) infinite;
          "></div>
          <div style="
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: ${idx === 0 ? '#DC2626' : '#D97706'};
            border: 2px solid #FFFFFF;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #FFFFFF;
            font-size: 13px;
            box-shadow: 0 0 14px ${idx === 0 ? '#DC2626' : '#D97706'};
          ">
            🎯
          </div>
        </div>
      `;

      const interceptIcon = L.divIcon({
        html: interceptHtml,
        className: '',
        iconSize: [38, 38],
        iconAnchor: [19, 19]
      });

      const interceptMarker = L.marker([pj.latitude, pj.longitude], { icon: interceptIcon })
        .bindPopup(`
          <div style="font-family:Inter,sans-serif;padding:4px;min-width:230px">
            <div style="font-size:10px;font-weight:900;color:${idx === 0 ? '#DC2626' : '#D97706'};text-transform:uppercase">
              🎯 PREDICTED INTERCEPT POINT #${pj.rank}
            </div>
            <div style="font-weight:800;font-size:13px;color:#0F172A;margin:2px 0">${pj.junction_name}</div>
            <div style="font-size:11.5px;color:#334155;font-weight:600">📍 ${pj.location_name}</div>
            <div style="display:flex;gap:6px;margin:6px 0;align-items:center;">
              <span style="font-size:11px;font-weight:800;padding:2px 8px;border-radius:6px;background:#FEE2E2;color:#DC2626">
                ⏱️ ETA: ${pj.eta_minutes} mins
              </span>
              <span style="font-size:11px;font-weight:700;color:#64748B">Distance: ${pj.distance_km} km</span>
            </div>
            <div style="font-size:11px;color:#0F4C81;background:#F0F9FF;padding:6px;border-radius:4px;font-weight:600;margin-top:4px">
              🛡️ <strong>Tactical Action:</strong> ${pj.tactical_advisory}
            </div>
          </div>
        `)
        .addTo(mapInstanceRef.current);

      interceptVectorsRef.current.push(interceptMarker);
    });
  }, [predictedJunctions, showPredictedIntercept, routeData, isMapReady]);

  // Render Nearest Active PCR Patrol Units
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapReady || !L) return;

    pcrMarkersRef.current.forEach(m => m.remove());
    pcrMarkersRef.current = [];

    if (!showPcrUnits) return;

    const unitsToRender = pcrUnits.length > 0 ? pcrUnits : [
      { id: 'pcr-1', name: 'PCR Van #14 (Crime Branch)', callsign: 'Falcon-14', officer: 'PSI R. Dave', latitude: 23.0380, longitude: 72.5190, distance_km: 1.8, eta_minutes: 2, status: 'AVAILABLE', type: 'VAN' },
      { id: 'pcr-2', name: 'Cheetah Mobile QRT #08', callsign: 'Cheetah-8', officer: 'HC M. Solanki', latitude: 23.0450, longitude: 72.5350, distance_km: 2.4, eta_minutes: 3, status: 'PATROLLING', type: 'BIKE' },
      { id: 'pcr-3', name: 'Sector Roadblock Barrier #03', callsign: 'Barrier-3', officer: 'ASI B. Vaghela', latitude: 23.0280, longitude: 72.5050, distance_km: 1.2, eta_minutes: 2, status: 'STANDBY', type: 'CHECKPOST' }
    ];

    unitsToRender.forEach(unit => {
      const pcrHtml = `
        <div style="
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #0284C7;
          border: 2px solid #FFFFFF;
          box-shadow: 0 0 10px rgba(2, 132, 199, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFFFFF;
          font-size: 14px;
        ">
          🚓
        </div>
      `;

      const pcrIcon = L.divIcon({
        html: pcrHtml,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([unit.latitude, unit.longitude], { icon: pcrIcon })
        .bindPopup(`
          <div style="font-family:Inter,sans-serif;padding:4px;min-width:210px">
            <div style="font-size:10px;font-weight:900;color:#0284C7;text-transform:uppercase">🚓 GUJARAT POLICE PATROL UNIT</div>
            <div style="font-weight:800;font-size:13px;color:#0F172A;margin:2px 0">${unit.name}</div>
            <div style="font-size:11.5px;color:#334155">👮 Officer: ${unit.officer} (${unit.callsign})</div>
            <div style="font-size:11px;color:#64748B;margin:3px 0">📍 Proximity: ${unit.distance_km} km | ETA: ${unit.eta_minutes} mins</div>
            <div style="display:inline-block;font-size:10px;font-weight:800;padding:2px 7px;border-radius:10px;background:#DCFCE7;color:#16A34A;margin-top:4px">
              STATUS: ${unit.status}
            </div>
          </div>
        `)
        .addTo(mapInstanceRef.current);

      pcrMarkersRef.current.push(marker);
    });
  }, [pcrUnits, showPcrUnits, isMapReady]);

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
              width: 38px;
              height: 38px;
              border-radius: 50%;
              background: #DC2626;
              border: 3px solid #FFFFFF;
              box-shadow: 0 0 18px rgba(220, 38, 38, 0.9);
              display: flex;
              align-items: center;
              justify-content: center;
              color: #FFFFFF;
              font-size: 19px;
              animation: beaconPulse 1.2s infinite;
            ">
              🚗
            </div>
          `;
          const carIcon = L.divIcon({
            html: carIconHtml,
            className: '',
            iconSize: [38, 38],
            iconAnchor: [19, 19]
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {/* Top Map Action Bar with Layer Switcher & Predictive Toggles */}
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
                title="Generate Official Police Dossier (Section 65B)"
              >
                <span>📄 Sec 65B Dossier</span>
              </button>
            )}
          </div>

          {/* Tactical Layer Toggles & Base Maps */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', color: 'var(--text-heading)', fontSize: '0.76rem', fontWeight: 700 }}>
              <input
                type="checkbox"
                checked={showPredictedIntercept}
                onChange={e => setShowPredictedIntercept(e.target.checked)}
              />
              <span style={{ color: '#DC2626' }}>🎯 Escape Intercepts</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', color: 'var(--text-heading)', fontSize: '0.76rem', fontWeight: 700 }}>
              <input
                type="checkbox"
                checked={showPcrUnits}
                onChange={e => setShowPcrUnits(e.target.checked)}
              />
              <span style={{ color: '#0284C7' }}>🚓 PCR Patrols</span>
            </label>

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
                🛰️ Recon
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
          </div>
        </div>
      </div>

      {/* Map Viewport Container */}
      <div className="map-container-box" style={{ height: '460px', position: 'relative' }}>
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

        {/* Tactical Legend Floating Widget */}
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          zIndex: 400,
          background: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '8px',
          padding: '8px 12px',
          color: '#FFFFFF',
          fontSize: '11px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
        }}>
          <div style={{ fontWeight: 800, fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94A3B8' }}>
            Speed & Route Key
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '4px', background: '#16A34A', borderRadius: '2px' }}></span>
            <span>Normal (&lt; 55 km/h)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '4px', background: '#D97706', borderRadius: '2px' }}></span>
            <span>Moderate (55 - 80 km/h)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '4px', background: '#DC2626', borderRadius: '2px' }}></span>
            <span>Over-Speeding (&gt; 80 km/h)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '4px', marginTop: '2px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#DC2626' }}></span>
            <span>Next Intercept Target</span>
          </div>
        </div>

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

      {/* ── Predictive Escape Route & Intercept Barricade Advisory Panel ── */}
      {showPredictedIntercept && predictedJunctions.length > 0 && (
        <div className="gov-card" style={{ padding: '0.85rem 1.15rem', borderLeft: '4px solid #DC2626' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.55rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Target size={18} style={{ color: '#DC2626' }} />
              <div>
                <span style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-heading)' }}>
                  Predictive Escape Route & Junction Interception
                </span>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                  Heading projection based on corridor velocity (<strong>{routeData.average_velocity_kmh || 68} km/h</strong>)
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '2px 8px', borderRadius: '12px', background: '#FEE2E2', color: '#DC2626' }}>
                TACTICAL ALERT: DEPLOY BARRICADES
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0.75rem' }}>
            {predictedJunctions.map((pj, idx) => (
              <div
                key={idx}
                style={{
                  padding: '0.75rem 0.95rem',
                  borderRadius: 'var(--r-md)',
                  background: idx === 0 ? 'rgba(220, 38, 38, 0.05)' : 'var(--bg-subtle)',
                  border: '1.5px solid',
                  borderColor: idx === 0 ? '#DC2626' : 'var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    fontSize: '0.70rem',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    color: idx === 0 ? '#DC2626' : '#D97706',
                    letterSpacing: '0.05em'
                  }}>
                    🎯 INTERCEPT POINT #{pj.rank} ({idx === 0 ? 'PRIMARY BARRICADE' : 'SECONDARY SAFETY'})
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 900,
                    fontSize: '0.82rem',
                    padding: '2px 7px',
                    borderRadius: '4px',
                    background: idx === 0 ? '#DC2626' : '#D97706',
                    color: '#FFFFFF'
                  }}>
                    ETA: {pj.eta_minutes} MINS
                  </span>
                </div>

                <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-heading)' }}>
                  {pj.junction_name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  📍 {pj.location_name} · Distance: {pj.distance_km} km
                </div>

                <div style={{
                  fontSize: '0.73rem',
                  fontWeight: 600,
                  color: '#0F4C81',
                  background: 'rgba(15, 76, 129, 0.08)',
                  padding: '5px 8px',
                  borderRadius: '4px',
                  marginTop: '4px'
                }}>
                  🛡️ <strong>Order:</strong> {pj.tactical_advisory}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
                Sequential Movement Scrubber & Timeline
              </span>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                Suspect: <strong className="license-plate-badge" style={{ padding: '1px 6px', fontSize: '0.78rem' }}>{routeData?.plate_number}</strong>
                {routeData.cloned_plate_anomaly && (
                  <span style={{ marginLeft: '6px', color: '#DC2626', fontWeight: 800 }}>⚠️ GHOST/CLONED ANOMALY</span>
                )}
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
            max={Math.max(0, routeData.checkpoints.length - 1)}
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

        {/* Checkpoint Timeline Cards with Speeds */}
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
            const spd = cp.corridor_velocity_kmh || cp.speed_kmh || 58;
            const spdColor = spd > 80 ? '#DC2626' : spd > 55 ? '#D97706' : '#16A34A';

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
                  minWidth: '170px',
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
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span style={{
                    fontSize: '0.66rem',
                    fontWeight: 800,
                    color: isActive ? 'var(--primary)' : 'var(--text-dim)',
                    textTransform: 'uppercase'
                  }}>
                    CP #{idx + 1}
                  </span>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    color: spdColor,
                    fontFamily: 'var(--font-mono)'
                  }}>
                    ⚡ {spd.toFixed(0)} km/h
                  </span>
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
