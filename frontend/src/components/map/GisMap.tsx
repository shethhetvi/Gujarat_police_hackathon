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
        minHeight: '480px',
        backgroundColor: '#070c18',
        position: 'relative',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        {/* Gujarat Geo Grid Visualizer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            SURVEILLANCE GRID // GUJARAT SECTOR 01-08 // LEAFLET OSM LAYER
          </span>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--status-green)' }}>
              ● Camera Active ({cameras.length})
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--alert-red)' }}>
              ▲ Watchlist Match Alert ({alerts.length})
            </span>
          </div>
        </div>

        {/* Nodes Representation on Gujarat Map (Ahmedabad -> Vadodara -> Surat -> Rajkot) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          margin: '1rem 0'
        }}>
          {cameras.map((cam, idx) => {
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
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
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
