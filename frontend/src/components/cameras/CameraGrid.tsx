import React from 'react';
import { Camera } from '../../types';

interface CameraGridProps {
  cameras: Camera[];
}

export const CameraGrid: React.FC<CameraGridProps> = ({ cameras }) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
      gap: '1.25rem',
      padding: '1rem 0'
    }}>
      {cameras.map((camera) => (
        <div
          key={camera.id}
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div style={{
            height: '180px',
            backgroundColor: '#05070a',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem'
          }}>
            <div style={{
              position: 'absolute',
              top: '8px',
              left: '8px',
              backgroundColor: 'rgba(0, 0, 0, 0.65)',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: camera.is_active ? 'var(--status-green)' : 'var(--alert-red)'
              }} />
              {camera.is_active ? 'LIVE' : 'OFFLINE'}
            </div>
            <div style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              backgroundColor: 'rgba(0, 0, 0, 0.65)',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '0.7rem'
            }}>
              {camera.protocol}
            </div>
            <span>[ RTSP FEED: {camera.name} ]</span>
          </div>

          <div style={{ padding: '1rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{camera.name}</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              📍 {camera.location_name}
            </p>
            <div style={{
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-muted)',
              marginTop: '0.5rem'
            }}>
              Lat: {camera.latitude.toFixed(4)}, Lon: {camera.longitude.toFixed(4)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
