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
  Shield,
  UserCheck,
  HelpCircle,
  Sun,
  Moon
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
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export default function Sidebar({
  activeTab,
  onSelectTab,
  pendingAlertsCount,
  totalCamerasCount,
  activeCamerasCount,
  watchlistCount,
  theme = 'light',
  onToggleTheme
}: SidebarProps) {
  const menuItems = [
    { id: 'dashboard' as SidebarTab, label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'cameras' as SidebarTab, label: 'Live CCTV Grid', icon: <Video size={18} />, badge: `${activeCamerasCount}/${totalCamerasCount}` },
    { id: 'map' as SidebarTab, label: 'GIS Tracking', icon: <Navigation size={18} /> },
    { id: 'multicam' as SidebarTab, label: 'Multi-Camera Sync', icon: <Grid size={18} /> },
    { id: 'watchlist' as SidebarTab, label: 'Threat Watchlist', icon: <Crosshair size={18} />, badge: watchlistCount },
    { id: 'analytics' as SidebarTab, label: 'Analysis', icon: <BarChart3 size={18} /> },
    { id: 'reports' as SidebarTab, label: 'Dossier Report', icon: <FileText size={18} /> },
  ];

  const settingsItems = [
    { id: 'detections' as SidebarTab, label: 'Detection Audit', icon: <FileSearch size={18} /> },
    { id: 'settings' as SidebarTab, label: 'System Settings', icon: <Settings size={18} /> },
  ];

  return (
    <aside style={{
      width: '250px',
      height: '100vh',
      position: 'sticky',
      top: 0,
      background: 'rgba(255, 255, 255, 0.96)',
      backdropFilter: 'blur(16px)',
      borderRight: '1.5px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '1.5rem 1.15rem',
      flexShrink: 0,
      userSelect: 'none',
      overflowY: 'auto',
      zIndex: 50,
      boxShadow: '4px 0 24px rgba(16, 185, 129, 0.08)'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Brand Logo Header (Solar Sync Style) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0 0.5rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)'
          }}>
            <Shield size={18} />
          </div>
          <div>
            <div style={{
              fontWeight: 900,
              fontSize: '1.2rem',
              color: '#10B981',
              letterSpacing: '-0.02em',
              fontStyle: 'italic',
              lineHeight: 1
            }}>
              SentinelGrid
            </div>
            <div style={{ fontSize: '0.66rem', color: '#9CA3AF', fontWeight: 600, letterSpacing: '0.04em', marginTop: '2px' }}>
              GUJARAT POLICE ICCC
            </div>
          </div>
        </div>

        {/* SECTION 1: MENU */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <div style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            color: '#9CA3AF',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: '0 0.75rem 0.25rem'
          }}>
            Menu
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
                  padding: '0.7rem 1rem',
                  borderRadius: '14px',
                  background: isActive ? '#10B981' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#4B5563',
                  border: 'none',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isActive ? '0 4px 12px rgba(16, 185, 129, 0.28)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ color: isActive ? '#FFFFFF' : '#9CA3AF' }}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && !isActive && (
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '9999px',
                    background: '#F3F4F6',
                    color: '#6B7280'
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* SECTION 2: SETTINGS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <div style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            color: '#9CA3AF',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: '0 0.75rem 0.25rem'
          }}>
            Settings
          </div>

          {settingsItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.7rem 1rem',
                  borderRadius: '14px',
                  background: isActive ? '#10B981' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#4B5563',
                  border: 'none',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{ color: isActive ? '#FFFFFF' : '#9CA3AF' }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* BOTTOM: Light Mode Toggle Switch (Exact Reference Style!) */}
      <div style={{ padding: '0 0.5rem' }}>
        <div
          onClick={onToggleTheme}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            cursor: 'pointer',
            padding: '0.5rem 0'
          }}
        >
          {/* Pill Switch */}
          <div style={{
            width: '44px',
            height: '24px',
            borderRadius: '9999px',
            background: theme === 'light' ? '#10B981' : '#4B5563',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: theme === 'light' ? 'flex-end' : 'flex-start',
            transition: 'all 0.2s ease',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: '#FFFFFF',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
            }} />
          </div>

          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-heading)' }}>
            {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
          </span>
        </div>
      </div>
    </aside>
  );
}
