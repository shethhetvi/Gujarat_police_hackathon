'use client';
import React, { useState, useEffect } from 'react';
import { WsStatus } from '../../services/websocket';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSimulateSighting?: () => void;
  onSimulateRoute?: () => void;
  isSimulating?: boolean;
  wsStatus?: WsStatus;
  backendOnline?: boolean;
  unacknowledgedCount?: number;
  trackingPlate?: string;
  onTrackingPlateChange?: (p: string) => void;
}

const TABS = [
  { id: 'dashboard', label: 'Command Center', icon: '🏛️' },
  { id: 'cameras', label: 'Live Feeds', icon: '📹' },
  { id: 'map', label: 'GIS Tracking', icon: '🗺️' },
  { id: 'watchlist', label: 'Watchlist', icon: '🎯' },
  { id: 'detections', label: 'History', icon: '🔍' },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab, setActiveTab,
  onSimulateSighting, onSimulateRoute,
  isSimulating = false,
  wsStatus = 'disconnected',
  backendOnline = false,
  unacknowledgedCount = 0,
  trackingPlate = 'GJ01AB1234',
  onTrackingPlateChange
}) => {
  const [clock, setClock] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setClock(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' IST');
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);

  const wsColor = wsStatus === 'connected' ? '#22c55e' : wsStatus === 'connecting' ? '#f59e0b' : '#ef4444';
  const wsLabel = wsStatus === 'connected' ? 'Live' : wsStatus === 'connecting' ? 'Connecting' : 'Offline';

  return (
    <header style={{
      background: 'var(--bg-nav)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      position: 'sticky', top: 0, zIndex: 1000,
      boxShadow: '0 2px 12px rgba(0,0,0,0.2)'
    }}>
      {/* Top Bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.75rem 1.5rem',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        flexWrap: 'wrap', gap: '0.75rem'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #1d4ed8, #0891b2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem', flexShrink: 0
          }}>
            🛡️
          </div>
          <div>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              SENTINEL<span style={{ color: '#38bdf8' }}>GRID</span>
            </h1>
            <p style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.08em', lineHeight: 1 }}>
              GUJARAT POLICE · VMS COMMAND CENTER
            </p>
          </div>
        </div>

        {/* Status indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Backend status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <div style={{
              width: '7px', height: '7px', borderRadius: '50%',
              background: backendOnline ? '#22c55e' : '#ef4444',
              boxShadow: backendOnline ? '0 0 6px #22c55e' : '0 0 6px #ef4444'
            }} />
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>
              API {backendOnline ? 'Online' : 'Offline'}
            </span>
          </div>

          {/* WebSocket status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <div style={{
              width: '7px', height: '7px', borderRadius: '50%',
              background: wsColor, boxShadow: `0 0 6px ${wsColor}`,
              animation: wsStatus === 'connected' ? 'pulse-dot 2s ease-in-out infinite' : 'none'
            }} />
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>
              WS {wsLabel}
            </span>
          </div>

          {/* Clock */}
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.78rem',
            color: '#38bdf8', fontWeight: 700, letterSpacing: '0.05em'
          }}>
            {clock}
          </span>

          {/* Plate tracking input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap' }}>Track:</span>
            <input
              type="text"
              value={trackingPlate}
              onChange={e => onTrackingPlateChange?.(e.target.value.toUpperCase())}
              placeholder="GJ01AB1234"
              style={{
                padding: '0.3rem 0.6rem',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '6px',
                color: '#38bdf8',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                fontSize: '0.8rem',
                width: '130px',
                outline: 'none'
              }}
            />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: '0 1.5rem',
        gap: '0.25rem',
        overflowX: 'auto'
      }}>
        <div style={{ display: 'flex', flex: 1, gap: '0.25rem' }}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '0.7rem 1.1rem',
                  background: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                  border: 'none',
                  borderBottom: isActive ? '2px solid #3b82f6' : '2px solid transparent',
                  color: isActive ? '#60a5fa' : '#94a3b8',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                  display: 'flex', alignItems: 'center', gap: '0.35rem',
                  position: 'relative'
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.id === 'dashboard' && unacknowledgedCount > 0 && (
                  <span style={{
                    background: '#dc2626', color: '#fff',
                    fontSize: '0.65rem', fontWeight: 800,
                    padding: '1px 5px', borderRadius: '10px',
                    minWidth: '16px', textAlign: 'center'
                  }}>
                    {unacknowledgedCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Demo triggers */}
        <div style={{
          display: 'flex', gap: '0.4rem', alignItems: 'center',
          paddingLeft: '0.75rem', borderLeft: '1px solid rgba(255,255,255,0.08)',
          flexShrink: 0, paddingBottom: '2px'
        }}>
          <button
            onClick={onSimulateSighting}
            disabled={isSimulating}
            title="Trigger live ANPR detection & WebSocket alert"
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#f87171', border: '1px solid rgba(239,68,68,0.35)',
              padding: '0.4rem 0.75rem', borderRadius: '6px',
              fontSize: '0.76rem', fontWeight: 700, cursor: isSimulating ? 'wait' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '4px',
              opacity: isSimulating ? 0.6 : 1, transition: 'all 0.15s ease'
            }}
          >
            ⚡ {isSimulating ? 'Simulating…' : 'Simulate Alert'}
          </button>
          <button
            onClick={onSimulateRoute}
            disabled={isSimulating}
            title="Simulate 5-checkpoint highway trajectory"
            style={{
              background: 'rgba(6, 182, 212, 0.12)',
              color: '#22d3ee', border: '1px solid rgba(6,182,212,0.35)',
              padding: '0.4rem 0.75rem', borderRadius: '6px',
              fontSize: '0.76rem', fontWeight: 700, cursor: isSimulating ? 'wait' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '4px',
              opacity: isSimulating ? 0.6 : 1, transition: 'all 0.15s ease'
            }}
          >
            🗺️ Simulate Route
          </button>
        </div>
      </div>
    </header>
  );
};
