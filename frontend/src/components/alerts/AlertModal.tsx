'use client';
import React from 'react';
import { Alert } from '../../types';
import { API_BASE } from '../../services/api';

interface AlertModalProps {
  alert: Alert | null;
  onClose: () => void;
  onAcknowledge: (id: number) => void;
  onTrackRoute: (plateNumber: string) => void;
}

const SEV_COLORS: Record<string, string> = {
  CRITICAL: '#dc2626', HIGH: '#d97706', MEDIUM: '#ca8a04', LOW: '#16a34a'
};

export const AlertModal: React.FC<AlertModalProps> = ({ alert, onClose, onAcknowledge, onTrackRoute }) => {
  if (!alert) return null;

  const sevColor = SEV_COLORS[alert.severity] || '#d97706';
  const snapshotUrl = alert.snapshot_url
    ? (alert.snapshot_url.startsWith('http') ? alert.snapshot_url : `${API_BASE}${alert.snapshot_url}`)
    : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box"
        style={{ maxWidth: '560px', padding: '1.75rem' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '12px',
              background: sevColor + '18',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.2rem'
            }}>
              🚨
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Intercept Alert
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Watchlist vehicle detected by AI ANPR
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
              borderRadius: '8px', width: '32px', height: '32px',
              cursor: 'pointer', fontSize: '1rem', color: 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>

        {/* Severity Banner */}
        <div style={{
          padding: '0.6rem 1rem', borderRadius: '8px', marginBottom: '1.25rem',
          background: sevColor + '12', border: `1px solid ${sevColor}30`,
          display: 'flex', alignItems: 'center', gap: '0.75rem'
        }}>
          <span style={{
            padding: '0.2rem 0.65rem', borderRadius: '20px',
            fontSize: '0.72rem', fontWeight: 800,
            background: sevColor + '20', color: sevColor, textTransform: 'uppercase'
          }}>
            {alert.severity}
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '1.1rem',
            fontWeight: 800, color: sevColor, letterSpacing: '0.05em'
          }}>
            {alert.plate_number}
          </span>
          {alert.is_simulated && (
            <span style={{
              marginLeft: 'auto', padding: '0.2rem 0.55rem', borderRadius: '20px',
              fontSize: '0.7rem', fontWeight: 700,
              background: '#fef3c7', color: '#92400e'
            }}>
              DEMO MODE
            </span>
          )}
        </div>

        {/* Snapshot */}
        <div style={{
          height: '220px', borderRadius: '10px', overflow: 'hidden',
          background: '#0a0f1a', border: '1px solid var(--border-color)',
          position: 'relative', marginBottom: '1.25rem'
        }}>
          {snapshotUrl ? (
            <img
              src={snapshotUrl}
              alt="Vehicle snapshot"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          ) : (
            <div style={{
              height: '100%', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              color: '#475569'
            }}>
              <span style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📷</span>
              <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>AI Plate Crop Snapshot</p>
              <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                Image served from /snapshots/ on backend
              </p>
            </div>
          )}
          {/* Overlay HUD */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
            padding: '0.5rem 0.75rem'
          }}>
            <p style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
              CAM #{alert.camera_id || '??'} • {alert.location_name || 'Gujarat CCTV Node'}
            </p>
          </div>
        </div>

        {/* Detail Grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem',
          marginBottom: '1.25rem'
        }}>
          {[
            { label: 'Plate Number', value: alert.plate_number, mono: true, color: '#1d4ed8' },
            { label: 'Severity Level', value: alert.severity, color: sevColor },
            { label: 'Detection Site', value: alert.location_name || 'Gujarat CCTV Node' },
            { label: 'Alert Time', value: new Date(alert.timestamp).toLocaleString('en-IN') },
          ].map(item => (
            <div key={item.label} style={{
              padding: '0.75rem 1rem',
              background: 'var(--bg-primary)',
              borderRadius: '8px', border: '1px solid var(--border-color)'
            }}>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>
                {item.label}
              </p>
              <p style={{
                fontWeight: 700, fontSize: '0.9rem',
                color: item.color || 'var(--text-primary)',
                fontFamily: item.mono ? 'var(--font-mono)' : 'var(--font-sans)'
              }}>
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button
            onClick={() => { onTrackRoute(alert.plate_number); onClose(); }}
            style={{
              padding: '0.65rem 1.25rem', borderRadius: '8px',
              background: '#eff6ff', color: '#1d4ed8',
              border: '1px solid rgba(29,78,216,0.25)',
              fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer'
            }}
          >
            🗺️ Track Route on Map
          </button>
          <button
            onClick={() => { onAcknowledge(alert.id); onClose(); }}
            style={{
              padding: '0.65rem 1.25rem', borderRadius: '8px',
              background: 'var(--status-green)', color: '#fff',
              border: 'none', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer'
            }}
          >
            ✓ Acknowledge Alert
          </button>
        </div>
      </div>
    </div>
  );
};
