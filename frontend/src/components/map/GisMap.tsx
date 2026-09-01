import React, { useState, useEffect } from 'react';
import { Camera, Alert } from '../../types';
import { getVehicleRoute } from '../../services/api';

interface GisMapProps {
  cameras: Camera[];
  alerts: Alert[];
  selectedPlate?: string;
  onSelectPlate?: (plate: string) => void;
}

export const GisMap: React.FC<GisMapProps> = ({ cameras, alerts, selectedPlate, onSelectPlate }) => {
  const [routeData, setRouteData] = useState<any>(null);
  const [searchPlate, setSearchPlate] = useState(selectedPlate || 'GJ01AB1234');
  const [loadingRoute, setLoadingRoute] = useState(false);

  useEffect(() => {
    if (selectedPlate) {
      setSearchPlate(selectedPlate);
      fetchRoute(selectedPlate);
    }
  }, [selectedPlate]);

  const fetchRoute = async (plate: string) => {
    if (!plate) return;
    setLoadingRoute(true);
    try {
      const data = await getVehicleRoute(plate);
      setRouteData(data);
    } catch (err) {
      console.error("Error fetching route:", err);
    } finally {
      setLoadingRoute(false);
    }
  };

  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: '12px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      gap: '0'
    }}>
      {/* Map Control Bar */}
      <div style={{
        padding: '1rem 1.5rem',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(17, 24, 39, 0.7)',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>🗺️ Gujarat Police GIS Multi-Camera Vehicle Tracker</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Real-time visual route reconstruction across state highway camera nodes
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search Plate (e.g. GJ01AB1234)"
            value={searchPlate}
            onChange={(e) => setSearchPlate(e.target.value)}
            style={{
              padding: '0.5rem 0.8rem',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              color: '#38bdf8',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              fontSize: '0.85rem'
            }}
          />
          <button
            onClick={() => fetchRoute(searchPlate)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#0284c7',
              border: 'none',
              color: '#fff',
              fontWeight: 600,
              borderRadius: '6px',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            {loadingRoute ? 'Tracing...' : 'Trace Route'}
          </button>
        </div>
      </div>

      {/* Visual GIS Canvas & Gujarat Nodes Simulation */}
      <div style={{
        minHeight: '520px',
        backgroundColor: '#070c18',
        position: 'relative',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.05) 0%, transparent 80%)'
      }}>
        {/* Gujarat Geo Grid Visualizer Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 8px #10b981'
            }} />
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              GUJARAT STATE CCTV GIS RADAR // SECTOR 01-08 // LAT 20.1-24.7°N, LON 68.1-74.4°E
            </span>
          </div>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--status-green)' }}>
              ● Online Feeds ({cameras.length})
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--alert-red)' }}>
              ▲ Intercept Alerts ({alerts.length})
            </span>
          </div>
        </div>

        {/* Dynamic Trajectory SVG Map Canvas */}
        <div style={{
          position: 'relative',
          height: '240px',
          backgroundColor: 'rgba(11, 19, 36, 0.85)',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          borderRadius: '10px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem'
        }}>
          {/* Subtle Grid Lines */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'linear-gradient(rgba(30, 41, 59, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(30, 41, 59, 0.3) 1px, transparent 1px)',
            backgroundSize: '30px 30px',
            opacity: 0.7
          }} />

          {/* SVG Map Canvas with Animated Polylines */}
          <svg style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
            <defs>
              <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="1" />
              </linearGradient>
            </defs>

            {/* Connecting Polylines for Checkpoints */}
            {routeData?.checkpoints?.length > 1 && (
              <polyline
                points={routeData.checkpoints.map((cp: any, i: number) => {
                  const stepX = 100 + (i * ((800 - 200) / (routeData.checkpoints.length - 1 || 1)));
                  const stepY = 120 + ((i % 2 === 0 ? -40 : 40));
                  return `${stepX},${stepY}`;
                }).join(' ')}
                fill="none"
                stroke="url(#routeGradient)"
                strokeWidth="4"
                strokeDasharray="6 4"
                strokeLinecap="round"
              />
            )}

            {/* Render Nodes on Map */}
            {cameras.map((cam, idx) => {
              const isCheckpoint = routeData?.checkpoints?.some((cp: any) => cp.camera_id === cam.id);
              const hasAlert = alerts.some((a) => a.camera_id === cam.id);
              const nodeX = 100 + (idx * 160);
              const nodeY = 120 + (idx % 2 === 0 ? -40 : 40);

              return (
                <g key={cam.id} transform={`translate(${nodeX}, ${nodeY})`}>
                  {/* Pulse circle if checkpoint */}
                  {isCheckpoint && (
                    <circle r="20" fill="rgba(6, 182, 212, 0.25)">
                      <animate attributeName="r" values="12;24;12" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <circle
                    r="9"
                    fill={isCheckpoint ? '#06b6d4' : hasAlert ? '#ef4444' : '#3b82f6'}
                    stroke="#fff"
                    strokeWidth="2"
                  />
                  <text
                    y="-15"
                    textAnchor="middle"
                    fill={isCheckpoint ? '#67e8f9' : '#cbd5e1'}
                    fontSize="11"
                    fontFamily="var(--font-mono)"
                    fontWeight="700"
                  >
                    {cam.name.split(' ')[0]}
                  </text>
                </g>
              );
            })}
          </svg>

          {(!routeData || routeData.checkpoints_count === 0) && (
            <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <span style={{ fontSize: '1.4rem' }}>🛰️</span>
              <p style={{ marginTop: '0.3rem' }}>Search any plate above or click "Simulate Route" to plot live movement trajectory</p>
            </div>
          )}
        </div>

        {/* Nodes Representation on Gujarat Map */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          margin: '0.5rem 0'
        }}>
          {cameras.map((cam) => {
            const hasAlert = alerts.some((a) => a.camera_id === cam.id);
            const isCheckpoint = routeData?.checkpoints?.some((cp: any) => cp.camera_id === cam.id);

            return (
              <div
                key={cam.id}
                style={{
                  backgroundColor: isCheckpoint ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-card)',
                  border: isCheckpoint
                    ? '2px solid #06b6d4'
                    : hasAlert
                    ? '2px solid var(--alert-red)'
                    : '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '1rem',
                  position: 'relative',
                  boxShadow: isCheckpoint ? '0 0 15px rgba(6, 182, 212, 0.3)' : 'none'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    backgroundColor: isCheckpoint ? '#06b6d4' : 'rgba(59, 130, 246, 0.2)',
                    color: isCheckpoint ? '#000' : '#60a5fa',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontWeight: 700
                  }}>
                    NODE #{cam.id}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    {cam.latitude.toFixed(2)}°N, {cam.longitude.toFixed(2)}°E
                  </span>
                </div>

                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>{cam.name}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  📍 {cam.location_name}
                </p>

                {isCheckpoint && (
                  <div style={{
                    marginTop: '0.75rem',
                    padding: '0.4rem',
                    backgroundColor: 'rgba(6, 182, 212, 0.2)',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    color: '#67e8f9',
                    fontWeight: 600
                  }}>
                    🎯 Sighting Recorded on Route
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Route History Timeline if traced */}
        {routeData && routeData.checkpoints_count > 0 && (
          <div style={{
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(6, 182, 212, 0.4)',
            borderRadius: '8px',
            padding: '1rem',
            marginTop: '1rem'
          }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.5rem' }}>
              🚗 Chronological Trajectory: Plate {routeData.plate_number} ({routeData.checkpoints_count} Checkpoints Recorded)
            </h4>
            <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', padding: '0.5rem 0' }}>
              {routeData.checkpoints.map((cp: any, i: number) => (
                <div
                  key={i}
                  style={{
                    minWidth: '220px',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    padding: '0.75rem'
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: '#06b6d4', fontWeight: 700 }}>
                    Checkpoint #{i + 1}
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: '0.25rem' }}>
                    {cp.location_name}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    🕒 {new Date(cp.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
