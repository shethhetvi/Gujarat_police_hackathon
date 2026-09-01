import React from 'react';
import { Alert } from '../../types';

interface AlertFeedProps {
  alerts: Alert[];
  onAcknowledge: (id: number) => void;
}

export const AlertFeed: React.FC<AlertFeedProps> = ({ alerts, onAcknowledge }) => {
  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: '10px',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      height: '100%'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          🚨 Real-Time Watchlist Matches
        </h3>
        <span style={{
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          color: 'var(--alert-red)',
          padding: '0.2rem 0.6rem',
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: 700
        }}>
          {alerts.length} Active
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', maxHeight: '500px' }}>
        {alerts.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0' }}>
            No unacknowledged alerts. Feed active and screening.
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '8px',
                padding: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: '#f87171'
                  }}>
                    {alert.plate_number}
                  </span>
                  <span style={{
                    fontSize: '0.7rem',
                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                    color: '#f87171',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '4px'
                  }}>
                    {alert.severity}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  📍 {alert.location_name || 'Ahmedabad Ring Road'} • {new Date(alert.timestamp).toLocaleTimeString()}
                </div>
              </div>
              <button
                onClick={() => onAcknowledge(alert.id)}
                style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                  color: '#60a5fa',
                  border: '1px solid rgba(59, 130, 246, 0.4)',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Acknowledge
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
