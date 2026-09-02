import React, { useState, useEffect } from 'react';
import { Camera } from '../../types';

interface CameraGridProps {
  cameras: Camera[];
  onAddCamera?: () => void;
}

export const CameraGrid: React.FC<CameraGridProps> = ({ cameras, onAddCamera }) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [filterVendor, setFilterVendor] = useState<string>('ALL');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString('en-GB'));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const vendors = Array.from(new Set(cameras.map((c) => c.vendor).filter(Boolean)));

  const filteredCameras = cameras.filter((c) =>
    filterVendor === 'ALL' ? true : c.vendor === filterVendor
  );

  return (
    <div>
      {/* Action Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.25rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Vendor Filter:</span>
          <select
            value={filterVendor}
            onChange={(e) => setFilterVendor(e.target.value)}
            style={{
              padding: '0.4rem 0.8rem',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '0.8rem'
            }}
          >
            <option value="ALL">All Hardware Vendors ({cameras.length})</option>
            {vendors.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>

        {onAddCamera && (
          <button
            onClick={onAddCamera}
            style={{
              backgroundColor: '#0284c7',
              color: '#fff',
              border: 'none',
              padding: '0.55rem 1.1rem',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            📹 + Onboard CCTV Feed
          </button>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '1.25rem'
      }}>
        {filteredCameras.map((camera, index) => (
          <div
            key={camera.id}
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
            }}
          >
            {/* High-Tech CCTV Surveillance Viewport */}
            <div style={{
              height: '210px',
              backgroundColor: '#05070a',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)'
            }}>
              {/* Surveillance Scanlines / CRT raster */}
              <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.15) 1px, transparent 1px, transparent 2px)',
                pointerEvents: 'none',
                opacity: 0.8
              }} />

              {/* Dynamic Scanning Line */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                backgroundColor: 'rgba(56, 189, 248, 0.4)',
                boxShadow: '0 0 8px rgba(56, 189, 248, 0.8)',
                animation: 'scanline 3s linear infinite'
              }} />

              {/* Viewport Corner Brackets */}
              <div style={{ position: 'absolute', top: '10px', left: '10px', width: '12px', height: '12px', borderTop: '2px solid rgba(56, 189, 248, 0.6)', borderLeft: '2px solid rgba(56, 189, 248, 0.6)' }} />
              <div style={{ position: 'absolute', top: '10px', right: '10px', width: '12px', height: '12px', borderTop: '2px solid rgba(56, 189, 248, 0.6)', borderRight: '2px solid rgba(56, 189, 248, 0.6)' }} />
              <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '12px', height: '12px', borderBottom: '2px solid rgba(56, 189, 248, 0.6)', borderLeft: '2px solid rgba(56, 189, 248, 0.6)' }} />
              <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '12px', height: '12px', borderBottom: '2px solid rgba(56, 189, 248, 0.6)', borderRight: '2px solid rgba(56, 189, 248, 0.6)' }} />

              {/* Top Left: Live Status & Rec Indicator */}
              <div style={{
                position: 'absolute',
                top: '12px',
                left: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '0.72rem'
              }}>
                <span style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: camera.is_active ? 'var(--alert-red)' : 'var(--text-muted)',
                  boxShadow: camera.is_active ? '0 0 6px var(--alert-red)' : 'none'
                }} />
                <span style={{ fontWeight: 700, color: '#fff' }}>
                  {camera.is_active ? 'REC • LIVE' : 'OFFLINE'}
                </span>
                <span style={{ color: 'var(--text-muted)' }}>|</span>
                <span style={{ color: '#38bdf8' }}>{camera.vendor || 'ONVIF'}</span>
              </div>

              {/* Top Right: Protocol & Resolution */}
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '14px',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '0.7rem',
                color: 'var(--text-secondary)'
              }}>
                {camera.protocol} // 1080p @ 30fps
              </div>

              {/* Center: Simulated AI Target Bounding Box Overlay */}
              <div style={{
                width: '160px',
                height: '90px',
                border: '1.5px dashed rgba(16, 185, 129, 0.6)',
                borderRadius: '4px',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '4px',
                backgroundColor: 'rgba(16, 185, 129, 0.05)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: '#10b981' }}>
                  <span>AI_TRACK #{100 + camera.id * 7}</span>
                  <span>96.4%</span>
                </div>
                <div style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#67e8f9', letterSpacing: '1px' }}>
                  [ ANPR SCANNING ]
                </div>
                <div style={{ fontSize: '0.62rem', color: '#10b981' }}>
                  BYTE_TRACK_V2
                </div>
              </div>

              {/* Bottom Bar: Node ID & Live Gujarat Police Timecode */}
              <div style={{
                position: 'absolute',
                bottom: '12px',
                left: '14px',
                right: '14px',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.7rem',
                color: '#94a3b8',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                padding: '2px 8px',
                borderRadius: '4px'
              }}>
                <span>CAM-{String(camera.id).padStart(3, '0')} // SEC-{String(index + 1).padStart(2, '0')}</span>
                <span style={{ color: '#f87171', fontWeight: 700 }}>{timeStr} IST</span>
              </div>
            </div>

            {/* Camera Details */}
            <div style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{camera.name}</h4>
                <span style={{
                  fontSize: '0.7rem',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(59, 130, 246, 0.15)',
                  color: '#60a5fa'
                }}>
                  {camera.protocol}
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                📍 {camera.location_name}
              </p>
              <div style={{
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
                marginTop: '0.5rem',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span>Lat: {camera.latitude.toFixed(4)}°N</span>
                <span>Lon: {camera.longitude.toFixed(4)}°E</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
