import React from 'react';
import { Alert } from '../../types';
import { API_BASE } from '../../services/api';

interface AlertModalProps {
  alert: Alert | null;
  onClose: () => void;
  onAcknowledge: (id: number) => void;
  onTrackRoute: (plateNumber: string) => void;
}

export const AlertModal: React.FC<AlertModalProps> = ({ alert, onClose, onAcknowledge, onTrackRoute }) => {
  if (!alert) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    }}>
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid rgba(239, 68, 68, 0.4)',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '540px',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.2rem' }}>🚨</span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--alert-red)' }}>
              Watchlist Vehicle Intercept Alert
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {/* Snapshot / Visual Area */}
        <div style={{
          height: '200px',
          backgroundColor: '#070b12',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {alert.snapshot_url ? (
            <img
              src={alert.snapshot_url.startsWith('http') ? alert.snapshot_url : `${API_BASE}${alert.snapshot_url}`}
              alt="Vehicle Snapshot"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                // Fallback if image not found on disk
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '2rem' }}>📷</span>
              <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Automated AI Plate Crop & Snapshot</p>
            </div>
          )}
          {alert.is_simulated && (
            <div style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              backgroundColor: 'rgba(245, 158, 11, 0.9)',
              color: '#000',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '0.7rem',
              fontWeight: 700
            }}>
              SIMULATED MATCH
            </div>
          )}
        </div>

        {/* Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>Target Plate:</span>
            <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.1rem', color: '#38bdf8' }}>
              {alert.plate_number}
            </p>
          </div>
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>Severity Level:</span>
            <p style={{ fontWeight: 700, color: 'var(--alert-red)' }}>{alert.severity}</p>
          </div>
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>Camera Location:</span>
            <p style={{ color: 'var(--text-primary)' }}>{alert.location_name || 'Gujarat Highway Junction'}</p>
          </div>
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>Detected At:</span>
            <p style={{ color: 'var(--text-primary)' }}>{new Date(alert.timestamp).toLocaleString()}</p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
          <button
            onClick={() => {
              onTrackRoute(alert.plate_number);
              onClose();
            }}
            style={{
              padding: '0.6rem 1.2rem',
              backgroundColor: 'rgba(6, 182, 212, 0.2)',
              border: '1px solid rgba(6, 182, 212, 0.5)',
              color: '#06b6d4',
              borderRadius: '6px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            🗺️ Track Route on GIS Map
          </button>
          <button
            onClick={() => {
              onAcknowledge(alert.id);
              onClose();
            }}
            style={{
              padding: '0.6rem 1.2rem',
              backgroundColor: '#059669',
              border: 'none',
              color: '#fff',
              borderRadius: '6px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            ✓ Acknowledge Alert
          </button>
        </div>
      </div>
    </div>
  );
};
