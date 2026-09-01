import React from 'react';
import { Camera, Alert } from '../../types';

interface GisMapProps {
  cameras: Camera[];
  alerts: Alert[];
}

export const GisMap: React.FC<GisMapProps> = ({ cameras, alerts }) => {
  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: '10px',
      overflow: 'hidden',
      height: '520px',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{
        padding: '0.875rem 1.25rem',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(17, 24, 39, 0.6)'
      }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>🗺️ Gujarat State GIS Surveillance Map</h3>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          {cameras.length} Active Feeds Mapped • Leaflet / OpenStreetMap Layer
        </span>
      </div>

      <div style={{
        flex: 1,
        backgroundColor: '#0d1524',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '0.75rem',
        color: 'var(--text-secondary)'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'rgba(6, 182, 212, 0.1)',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.75rem'
        }}>
          📍
        </div>
        <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>GIS Map & Vehicle Route Tracking Engine</p>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Plots camera geo-coordinates and links multi-camera sightings (Ahmedabad ➔ Vadodara ➔ Surat corridor).
        </span>
      </div>
    </div>
  );
};
