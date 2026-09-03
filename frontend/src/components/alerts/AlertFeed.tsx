'use client';
import React, { useCallback } from 'react';
import { Alert } from '../../types';

interface AlertFeedProps {
  alerts: Alert[];
  onAcknowledge: (id: number) => void;
  onSelectAlert?: (alert: Alert) => void;
}

const SEVERITY_CONFIG: Record<string, { border: string; bg: string; badge: string; badgeBg: string }> = {
  CRITICAL: { border: '#dc2626', bg: '#fef2f2', badge: '#dc2626', badgeBg: '#fee2e2' },
  HIGH: { border: '#d97706', bg: '#fffbeb', badge: '#d97706', badgeBg: '#fef3c7' },
  MEDIUM: { border: '#ca8a04', bg: '#fefce8', badge: '#ca8a04', badgeBg: '#fef9c3' },
  LOW: { border: '#16a34a', bg: '#f0fdf4', badge: '#16a34a', badgeBg: '#dcfce7' },
};

export const AlertFeed: React.FC<AlertFeedProps> = ({ alerts, onAcknowledge, onSelectAlert }) => {
  const cfg = useCallback((sev: string) => SEVERITY_CONFIG[sev] || SEVERITY_CONFIG.HIGH, []);

  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column',
      overflow: 'hidden', boxShadow: 'var(--shadow-sm)', height: '100%'
    }}>
      {/* Header */}
      <div style={{
        padding: '1rem 1.25rem',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: alerts.length > 0 ? 'linear-gradient(to right, #fff5f5, #fff)' : 'var(--bg-card)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {alerts.length > 0 && (
            <span style={{
              display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%',
              background: '#dc2626', animation: 'pulse-dot 1.5s ease-in-out infinite'
            }} />
          )}
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Watchlist Intercept Alerts
          </h3>
        </div>
        <span style={{
          padding: '0.2rem 0.65rem', borderRadius: '20px',
          fontSize: '0.72rem', fontWeight: 800,
          background: alerts.length > 0 ? '#fee2e2' : '#f1f5f9',
          color: alerts.length > 0 ? '#dc2626' : 'var(--text-muted)',
          border: `1px solid ${alerts.length > 0 ? 'rgba(220,38,38,0.2)' : 'var(--border-color)'}`
        }}>
          {alerts.length} {alerts.length === 1 ? 'Alert' : 'Alerts'}
        </span>
      </div>

      {/* Feed */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '0.75rem',
        display: 'flex', flexDirection: 'column', gap: '0.6rem',
        maxHeight: '520px'
      }}>
        {alerts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">✅</div>
            <p style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
              No Pending Alerts
            </p>
            <p style={{ fontSize: '0.8rem' }}>
              All feeds are clear. AI engine actively screening.
            </p>
          </div>
        ) : (
          alerts.map((alert) => {
            const s = cfg(alert.severity);
            return (
              <div
                key={alert.id}
                onClick={() => onSelectAlert?.(alert)}
                className="alert-card"
                style={{
                  borderLeftColor: s.border,
                  background: 'var(--bg-card)',
                }}
              >
                {/* Alert row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontWeight: 800,
                        fontSize: '0.95rem', color: '#0f172a', letterSpacing: '0.05em'
                      }}>
                        {alert.plate_number}
                      </span>
                      <span style={{
                        padding: '0.15rem 0.5rem', borderRadius: '20px',
                        fontSize: '0.68rem', fontWeight: 800,
                        background: s.badgeBg, color: s.badge,
                        textTransform: 'uppercase'
                      }}>
                        {alert.severity}
                      </span>
                      {alert.is_simulated && (
                        <span style={{
                          padding: '0.15rem 0.45rem', borderRadius: '20px',
                          fontSize: '0.65rem', fontWeight: 700,
                          background: '#fef3c7', color: '#92400e'
                        }}>
                          DEMO
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      📍 {alert.location_name || 'Gujarat Highway Junction'}
                    </p>
                    <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      🕒 {new Date(alert.timestamp).toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-end', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--accent-blue)', fontWeight: 600 }}>
                      Inspect →
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); onAcknowledge(alert.id); }}
                      style={{
                        padding: '0.3rem 0.7rem',
                        background: '#eff6ff', color: '#1d4ed8',
                        border: '1px solid rgba(29,78,216,0.25)',
                        borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700,
                        cursor: 'pointer', whiteSpace: 'nowrap'
                      }}
                    >
                      ✓ ACK
                    </button>
                  </div>
                </div>

                {alert.snapshot_url && (
                  <div style={{
                    marginTop: '0.5rem',
                    padding: '0.3rem 0.5rem',
                    background: '#eff6ff', borderRadius: '4px',
                    fontSize: '0.72rem', color: 'var(--accent-blue)', fontWeight: 600
                  }}>
                    📷 Snapshot available — click to view
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
