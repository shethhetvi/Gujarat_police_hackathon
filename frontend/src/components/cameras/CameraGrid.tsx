'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Camera } from '../../types';

interface CameraGridProps {
  cameras: Camera[];
  onAddCamera?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const CameraGrid: React.FC<CameraGridProps> = ({
  cameras, onAddCamera, onRefresh, isRefreshing = false
}) => {
  const [timeStr, setTimeStr] = useState('');
  const [filterVendor, setFilterVendor] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [scanFrames, setScanFrames] = useState<Record<number, number>>({});

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(now.toLocaleDateString('en-IN') + '  ' + now.toLocaleTimeString('en-IN'));
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);

  // Animate scan counters per camera
  useEffect(() => {
    const t = setInterval(() => {
      setScanFrames(prev => {
        const next = { ...prev };
        cameras.forEach(c => {
          next[c.id] = (prev[c.id] || 0) + Math.floor(Math.random() * 3 + 1);
        });
        return next;
      });
    }, 800);
    return () => clearInterval(t);
  }, [cameras]);

  const vendors = Array.from(new Set(cameras.map(c => c.vendor).filter(Boolean)));
  const filtered = cameras.filter(c => {
    const matchVendor = filterVendor === 'ALL' || c.vendor === filterVendor;
    const matchStatus = filterStatus === 'ALL' || (filterStatus === 'ONLINE' ? c.is_active : !c.is_active);
    return matchVendor && matchStatus;
  });

  const activeCount = cameras.filter(c => c.is_active).length;

  return (
    <div>
      {/* Controls bar */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem',
        marginBottom: '1.25rem', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '0.75rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Live CCTV Surveillance Feeds</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
            {activeCount} of {cameras.length} feeds online · Vendor-neutral RTSP & ONVIF ingestion
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="form-select"
            style={{ width: 'auto', padding: '0.45rem 2rem 0.45rem 0.7rem', fontSize: '0.82rem' }}
          >
            <option value="ALL">All Status</option>
            <option value="ONLINE">Online Only</option>
            <option value="OFFLINE">Offline Only</option>
          </select>

          <select
            value={filterVendor}
            onChange={e => setFilterVendor(e.target.value)}
            className="form-select"
            style={{ width: 'auto', padding: '0.45rem 2rem 0.45rem 0.7rem', fontSize: '0.82rem' }}
          >
            <option value="ALL">All Vendors ({cameras.length})</option>
            {vendors.map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh camera list from backend"
            style={{
              padding: '0.45rem 0.9rem',
              background: isRefreshing ? 'var(--bg-primary)' : 'var(--bg-primary)',
              border: '1.5px solid var(--border-strong)',
              borderRadius: '8px', color: 'var(--text-secondary)',
              fontSize: '0.82rem', fontWeight: 600, cursor: isRefreshing ? 'wait' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.35rem'
            }}
          >
            <span style={{ display: 'inline-block', animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }}>
              🔄
            </span>
            {isRefreshing ? 'Refreshing…' : 'Refresh'}
          </button>

          {onAddCamera && (
            <button
              onClick={onAddCamera}
              style={{
                padding: '0.45rem 0.9rem',
                background: 'var(--accent-blue)', color: '#fff',
                border: 'none', borderRadius: '8px',
                fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.35rem'
              }}
            >
              📹 + Add Camera
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state" style={{
          background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)', padding: '4rem'
        }}>
          <div className="empty-state-icon">📹</div>
          <p style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            No cameras found
          </p>
          <p>Add a CCTV camera node to begin AI ANPR screening.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.25rem'
        }}>
          {filtered.map((camera, idx) => {
            const frameCount = scanFrames[camera.id] || 0;

            return (
              <div key={camera.id} className="camera-card">
                {/* CCTV Viewport */}
                <div className="camera-viewport">
                  <div className="camera-scanlines" />

                  {/* Scan beam */}
                  <div style={{
                    position: 'absolute', left: 0, right: 0, height: '2px',
                    background: camera.is_active
                      ? 'linear-gradient(to right, transparent, rgba(56,189,248,0.8), transparent)'
                      : 'rgba(100,116,139,0.4)',
                    animation: camera.is_active ? 'scanline 3.5s linear infinite' : 'none',
                    boxShadow: camera.is_active ? '0 0 8px rgba(56,189,248,0.5)' : 'none'
                  }} />

                  {/* Corner brackets */}
                  {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(pos => (
                    <div key={pos} style={{
                      position: 'absolute',
                      ...(pos.includes('top') ? { top: '10px' } : { bottom: '10px' }),
                      ...(pos.includes('left') ? { left: '10px' } : { right: '10px' }),
                      width: '14px', height: '14px',
                      borderTop: pos.includes('top') ? `2px solid rgba(56,189,248,${camera.is_active ? '0.7' : '0.25'})` : 'none',
                      borderBottom: pos.includes('bottom') ? `2px solid rgba(56,189,248,${camera.is_active ? '0.7' : '0.25'})` : 'none',
                      borderLeft: pos.includes('left') ? `2px solid rgba(56,189,248,${camera.is_active ? '0.7' : '0.25'})` : 'none',
                      borderRight: pos.includes('right') ? `2px solid rgba(56,189,248,${camera.is_active ? '0.7' : '0.25'})` : 'none',
                    }} />
                  ))}

                  {/* Top-left status bar */}
                  <div style={{
                    position: 'absolute', top: '10px', left: '14px',
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: 'rgba(0,0,0,0.65)', padding: '3px 9px',
                    borderRadius: '4px', fontSize: '0.7rem'
                  }}>
                    <span style={{
                      width: '6px', height: '6px', borderRadius: '50%',
                      background: camera.is_active ? '#ef4444' : '#64748b',
                      boxShadow: camera.is_active ? '0 0 5px #ef4444' : 'none',
                      animation: camera.is_active ? 'blink 1.5s ease-in-out infinite' : 'none'
                    }} />
                    <span style={{ color: '#fff', fontWeight: 700, letterSpacing: '0.03em' }}>
                      {camera.is_active ? '● REC LIVE' : '○ OFFLINE'}
                    </span>
                    <span style={{ color: '#64748b' }}>│</span>
                    <span style={{ color: '#38bdf8' }}>{camera.vendor || 'ONVIF'}</span>
                  </div>

                  {/* Top-right: protocol */}
                  <div style={{
                    position: 'absolute', top: '10px', right: '14px',
                    background: 'rgba(0,0,0,0.6)', padding: '2px 7px',
                    borderRadius: '4px', fontSize: '0.68rem', color: '#94a3b8'
                  }}>
                    {camera.protocol} · 1080p
                  </div>

                  {/* AI Detection Overlay Box */}
                  {camera.is_active && (
                    <div style={{
                      position: 'absolute',
                      top: '50%', left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '150px', height: '80px',
                      border: '1.5px dashed rgba(16,185,129,0.7)',
                      borderRadius: '4px',
                      display: 'flex', flexDirection: 'column',
                      justifyContent: 'space-between', padding: '4px 6px',
                      background: 'rgba(16,185,129,0.06)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: '#10b981' }}>
                        <span>TRK #{100 + camera.id * 7 + (frameCount % 10)}</span>
                        <span>{(94 + (frameCount % 5)).toFixed(1)}%</span>
                      </div>
                      <div style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#67e8f9', letterSpacing: '0.05em', fontFamily: 'var(--font-mono)' }}>
                        [ ANPR SCANNING ]
                      </div>
                      <div style={{ fontSize: '0.58rem', color: '#10b981', fontFamily: 'var(--font-mono)' }}>
                        BYTETRACK_V2 · {frameCount} frames
                      </div>
                    </div>
                  )}

                  {/* Bottom bar */}
                  <div style={{
                    position: 'absolute', bottom: '10px', left: '14px', right: '14px',
                    display: 'flex', justifyContent: 'space-between',
                    background: 'rgba(0,0,0,0.65)', padding: '2px 8px',
                    borderRadius: '4px', fontSize: '0.68rem'
                  }}>
                    <span style={{ color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                      CAM-{String(camera.id).padStart(3, '0')} // {camera.location_name?.split(',')[0]}
                    </span>
                    <span style={{ color: '#f87171', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                      {timeStr}
                    </span>
                  </div>
                </div>

                {/* Camera Info */}
                <div style={{ padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                      {camera.name}
                    </h4>
                    <span style={{
                      fontSize: '0.68rem', padding: '2px 7px', borderRadius: '20px',
                      background: camera.is_active ? 'var(--status-green-bg)' : '#f1f5f9',
                      color: camera.is_active ? 'var(--status-green)' : 'var(--text-muted)',
                      fontWeight: 700, border: `1px solid ${camera.is_active ? 'rgba(22,163,74,0.25)' : 'var(--border-color)'}`,
                      flexShrink: 0, marginLeft: '0.5rem'
                    }}>
                      {camera.is_active ? '● Online' : '○ Offline'}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    📍 {camera.location_name}
                  </p>

                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    fontSize: '0.72rem', fontFamily: 'var(--font-mono)',
                    color: 'var(--text-muted)',
                    padding: '0.45rem 0.6rem',
                    background: 'var(--bg-primary)', borderRadius: '6px',
                    border: '1px solid var(--border-color)'
                  }}>
                    <span>Lat: {camera.latitude?.toFixed(4)}°N</span>
                    <span>·</span>
                    <span>Lon: {camera.longitude?.toFixed(4)}°E</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
