'use client';

import React from 'react';
import {
  LayoutDashboard,
  Video,
  Navigation,
  Grid,
  Crosshair,
  FileSearch,
  BarChart3,
  FileText,
  Settings,
  ChevronRight,
  Radio,
  HardDrive
} from 'lucide-react';

export type SidebarTab =
  | 'dashboard'
  | 'cameras'
  | 'map'
  | 'multicam'
  | 'watchlist'
  | 'detections'
  | 'analytics'
  | 'reports'
  | 'settings';

interface SidebarProps {
  activeTab: SidebarTab;
  onSelectTab: (tab: SidebarTab) => void;
  pendingAlertsCount: number;
  totalCamerasCount: number;
  activeCamerasCount: number;
  watchlistCount: number;
}

export default function Sidebar({
  activeTab,
  onSelectTab,
  pendingAlertsCount,
  totalCamerasCount,
  activeCamerasCount,
  watchlistCount
}: SidebarProps) {
  const menuItems: { id: SidebarTab; label: string; icon: React.ReactNode; badge?: string | number; badgeColor?: string }[] = [
    {
      id: 'dashboard',
      label: 'Command Center',
      icon: <LayoutDashboard size={18} />,
      badge: pendingAlertsCount > 0 ? pendingAlertsCount : undefined,
      badgeColor: 'var(--danger)'
    },
    {
      id: 'cameras',
      label: 'Live CCTV Grid',
      icon: <Video size={18} />,
      badge: `${activeCamerasCount}/${totalCamerasCount}`,
      badgeColor: 'var(--primary)'
    },
    {
      id: 'map',
      label: 'GIS Route Tracking',
      icon: <Navigation size={18} />
    },
    {
      id: 'multicam',
      label: 'Multi-Camera Sync',
      icon: <Grid size={18} />,
      badge: '4-SYNC',
      badgeColor: 'var(--secondary)'
    },
    {
      id: 'watchlist',
      label: 'Target Watchlist',
      icon: <Crosshair size={18} />,
      badge: watchlistCount > 0 ? watchlistCount : undefined,
      badgeColor: 'var(--warning)'
    },
    {
      id: 'detections',
      label: 'Detection Audit',
      icon: <FileSearch size={18} />
    },
    {
      id: 'analytics',
      label: 'Smart Analytics',
      icon: <BarChart3 size={18} />
    },
    {
      id: 'reports',
      label: 'Evidence Dossier',
      icon: <FileText size={18} />,
      badge: 'PDF',
      badgeColor: 'var(--success)'
    },
    {
      id: 'settings',
      label: 'ICCC Settings',
      icon: <Settings size={18} />
    }
  ];

  return (
    <aside className="sidebar" style={{
      width: '240px',
      background: 'var(--bg-panel)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '1rem 0.75rem',
      flexShrink: 0,
      userSelect: 'none'
    }}>
      {/* Primary Navigation Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <div style={{
          padding: '0.5rem 0.75rem 0.65rem',
          fontSize: '0.68rem',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--text-dim)'
        }}>
          Operations & Control
        </div>

        {menuItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--r-md)',
                background: isActive ? 'var(--primary-light)' : 'transparent',
                border: '1px solid',
                borderColor: isActive ? 'var(--primary-border)' : 'transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.84rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                textAlign: 'left'
              }}
              className="sidebar-nav-btn"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span style={{ color: isActive ? 'var(--primary)' : 'var(--text-dim)' }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span style={{
                  fontSize: '0.66rem',
                  fontWeight: 800,
                  padding: '0.15rem 0.45rem',
                  borderRadius: 'var(--r-full)',
                  background: isActive ? 'var(--primary)' : 'var(--bg-subtle)',
                  color: isActive ? '#FFFFFF' : item.badgeColor || 'var(--text-main)',
                  border: `1px solid ${item.badgeColor ? `${item.badgeColor}40` : 'var(--border)'}`,
                  lineHeight: 1
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Node Health & Jurisdiction Footer Card */}
      <div style={{
        marginTop: 'auto',
        padding: '0.85rem',
        borderRadius: 'var(--r-md)',
        background: 'var(--bg-subtle)',
        border: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Radio size={14} style={{ color: 'var(--success)' }} />
            <span style={{ fontWeight: 700, fontSize: '0.74rem', color: 'var(--text-heading)' }}>
              SURVEILLANCE NODE
            </span>
          </div>
          <span style={{
            fontSize: '0.62rem',
            fontWeight: 800,
            padding: '1px 5px',
            borderRadius: '3px',
            background: 'var(--success-light)',
            color: 'var(--success)',
            border: '1px solid var(--success-border)'
          }}>
            ACTIVE
          </span>
        </div>

        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
          Ahmedabad City Zone · Netram Grid V2
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.65rem',
          color: 'var(--text-dim)',
          fontFamily: 'var(--font-mono)',
          paddingTop: '0.35rem',
          borderTop: '1px solid var(--border)'
        }}>
          <span>AI Inference: 38ms</span>
          <span>FPS: 30.0</span>
        </div>
      </div>
    </aside>
  );
}
