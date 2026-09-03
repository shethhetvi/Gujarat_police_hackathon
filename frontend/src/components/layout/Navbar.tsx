'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Bell,
  Sun,
  Moon,
  Zap,
  Navigation,
  ChevronDown,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { OfficerProfile, NotificationItem } from '../../types';

interface NavbarProps {
  activeTab?: string;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenSearch: () => void;
  backendOnline: boolean;
  wsStatus: 'connecting' | 'connected' | 'disconnected';
  notifications: NotificationItem[];
  onMarkAllNotificationsRead: () => void;
  onSimulateAlert: () => void;
  onSimulateRoute: () => void;
  isSimulating: boolean;
  trackPlate: string;
  onTrackPlateChange: (p: string) => void;
}

export const defaultOfficer: OfficerProfile = {
  name: 'PI J. Patel',
  badge_number: '4821',
  role: 'Police Inspector (Tech & Surveillance)',
  police_station: 'Crime Branch Headquarters',
  district: 'Ahmedabad City',
  shift: 'Shift A (08:00 - 20:00)',
  status: 'ON DUTY'
};

const TAB_TITLES: Record<string, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Dashboard',
    subtitle: 'View all information & live status about Gujarat Police surveillance grid'
  },
  cameras: {
    title: 'Live CCTV Surveillance Grid',
    subtitle: 'Real-time optical streaming nodes across Gujarat state highways'
  },
  map: {
    title: 'Tactical GIS Route Tracking',
    subtitle: 'AI highway trajectory interpolation & checkpoint intercept'
  },
  multicam: {
    title: 'Multi-Camera Synchronized Playback',
    subtitle: 'Correlate suspect vehicles across multiple highway CCTV nodes'
  },
  watchlist: {
    title: 'Statewide Threat Watchlist',
    subtitle: 'Active suspect targets registered under Crime Branch & State FIRs'
  },
  analytics: {
    title: 'Traffic Intelligence & AI Analytics',
    subtitle: 'Automated vehicle classification, density trends & violation heatmaps'
  },
  reports: {
    title: 'Evidence Dossier Generator',
    subtitle: 'Court-admissible case files under Section 65B Indian Evidence Act'
  },
  detections: {
    title: 'Optical Detection Audit Log',
    subtitle: 'Chronological optical ANPR plate recognition event telemetry'
  },
  settings: {
    title: 'System Settings & Calibration',
    subtitle: 'Neural model threshold, RTSP buffer & network settings'
  }
};

export default function Navbar({
  activeTab = 'dashboard',
  theme,
  onToggleTheme,
  onOpenSearch,
  backendOnline,
  notifications,
  onMarkAllNotificationsRead,
  onSimulateAlert,
  onSimulateRoute,
  isSimulating
}: NavbarProps) {
  const [istTime, setIstTime] = useState('');
  const [showOfficerMenu, setShowOfficerMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const officerRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setIstTime(now.toLocaleTimeString('en-IN', { hour12: true }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (officerRef.current && !officerRef.current.contains(e.target as Node)) {
        setShowOfficerMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;
  const currentTabInfo = TAB_TITLES[activeTab] || TAB_TITLES.dashboard;

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1.25rem 2rem 1rem 2rem',
      background: 'transparent',
      gap: '1rem',
      flexWrap: 'wrap'
    }}>
      {/* ── Left: Clean Dashboard Title & Subtitle (Solar Sync Style) ── */}
      <div>
        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: 800,
          color: 'var(--text-heading, #111827)',
          letterSpacing: '-0.02em',
          lineHeight: 1.15,
          margin: 0
        }}>
          {currentTabInfo.title}
        </h1>
        <p style={{
          fontSize: '0.82rem',
          color: 'var(--text-muted, #6B7280)',
          fontWeight: 500,
          marginTop: '4px',
          margin: '4px 0 0 0'
        }}>
          {currentTabInfo.subtitle}
        </p>
      </div>

      {/* ── Right: Search Pill + Demo Actions + Clock + Notifications + Profile (Solar Sync Style) ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        {/* Search Bar Capsule with Circular Emerald Button */}
        <div
          onClick={onOpenSearch}
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-card, #FFFFFF)',
            border: '1.5px solid var(--border, #D5E2DC)',
            borderRadius: '9999px',
            padding: '4px 6px 4px 18px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
            transition: 'all 0.15s ease',
            width: '260px'
          }}
        >
          <span style={{
            flex: 1,
            fontSize: '0.85rem',
            color: '#9CA3AF',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            Search…
          </span>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#10B981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            flexShrink: 0,
            boxShadow: '0 2px 6px rgba(16, 185, 129, 0.35)'
          }}>
            <Search size={15} />
          </div>
        </div>

        {/* Live IST Clock Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          padding: '0.4rem 0.75rem',
          borderRadius: '9999px',
          background: 'var(--bg-card, #FFFFFF)',
          border: '1.5px solid var(--border, #D5E2DC)',
          fontSize: '0.78rem',
          fontWeight: 700,
          color: 'var(--text-heading, #374151)',
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
        }}>
          <Clock size={13} style={{ color: '#10B981' }} />
          <span style={{ fontFamily: 'var(--font-mono)' }} suppressHydrationWarning>{istTime || 'IST'}</span>
        </div>

        {/* Demo Simulator Buttons */}
        <button
          onClick={onSimulateAlert}
          disabled={isSimulating}
          style={{
            padding: '0.42rem 0.8rem',
            borderRadius: '9999px',
            border: 'none',
            background: '#EF4444',
            color: '#FFFFFF',
            fontSize: '0.76rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
          }}
          title="Trigger Demo ANPR Intercept Alert"
        >
          <Zap size={13} />
          <span>{isSimulating ? '…' : 'Sim Alert'}</span>
        </button>

        <button
          onClick={onSimulateRoute}
          disabled={isSimulating}
          style={{
            padding: '0.42rem 0.8rem',
            borderRadius: '9999px',
            border: 'none',
            background: '#2563EB',
            color: '#FFFFFF',
            fontSize: '0.76rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)'
          }}
          title="Simulate Highway Checkpoint Route"
        >
          <Navigation size={13} />
          <span>Sim Route</span>
        </button>

        {/* Notification Bell (Solar Sync Style) */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--bg-card, #FFFFFF)',
              border: '1.5px solid var(--border, #D5E2DC)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: unreadCount > 0 ? '#EF4444' : '#6B7280',
              cursor: 'pointer',
              position: 'relative',
              boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
            }}
            title="Notifications"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                minWidth: '16px',
                height: '16px',
                borderRadius: '8px',
                background: '#EF4444',
                color: '#FFFFFF',
                fontSize: '0.62rem',
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 3px',
                boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)'
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Drawer */}
          {showNotifications && (
            <div style={{
              position: 'absolute',
              top: '46px',
              right: 0,
              width: '320px',
              background: 'var(--bg-card, #FFFFFF)',
              border: '1.5px solid var(--border, #D5E2DC)',
              borderRadius: '18px',
              boxShadow: '0 15px 35px rgba(0, 0, 0, 0.12)',
              zIndex: 1000,
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '0.85rem 1.15rem',
                borderBottom: '1px solid var(--border, #E5E7EB)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--bg-subtle, #F9FAFB)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Bell size={14} style={{ color: '#10B981' }} />
                  <span style={{ fontWeight: 800, fontSize: '0.86rem', color: 'var(--text-heading)' }}>
                    Notifications
                  </span>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllNotificationsRead}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#10B981',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#9CA3AF' }}>
                    <CheckCircle2 size={26} style={{ margin: '0 auto 0.5rem', color: '#10B981' }} />
                    <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>All notifications cleared</div>
                  </div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      style={{
                        padding: '0.75rem 1.15rem',
                        borderBottom: '1px solid var(--border, #E5E7EB)',
                        display: 'flex',
                        gap: '0.65rem',
                        alignItems: 'flex-start'
                      }}
                    >
                      <span style={{ fontSize: '1.1rem' }}>
                        {n.severity === 'CRITICAL' || n.severity === 'HIGH' ? '🚨' : n.severity === 'INFO' ? 'ℹ️' : '📹'}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-heading)' }}>
                          {n.title}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#6B7280', marginTop: '2px' }}>
                          {n.message}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Officer Avatar (Solar Sync Style) */}
        <div style={{ position: 'relative' }} ref={officerRef}>
          <div
            onClick={() => setShowOfficerMenu(!showOfficerMenu)}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.35)',
              border: '2px solid #FFFFFF'
            }}
            title={defaultOfficer.name}
          >
            JP
          </div>

          {/* Officer Menu Popover */}
          {showOfficerMenu && (
            <div style={{
              position: 'absolute',
              top: '46px',
              right: 0,
              width: '240px',
              background: 'var(--bg-card, #FFFFFF)',
              border: '1.5px solid var(--border, #D5E2DC)',
              borderRadius: '18px',
              boxShadow: '0 15px 35px rgba(0, 0, 0, 0.12)',
              zIndex: 1000,
              padding: '0.9rem'
            }}>
              <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-heading)' }}>
                {defaultOfficer.name}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#6B7280', marginTop: '2px' }}>
                Badge #{defaultOfficer.badge_number} · Crime Branch
              </div>
              <div style={{
                marginTop: '0.65rem',
                paddingTop: '0.65rem',
                borderTop: '1px solid var(--border, #E5E7EB)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151' }}>Theme</span>
                <button
                  onClick={onToggleTheme}
                  style={{
                    padding: '2px 8px',
                    borderRadius: '6px',
                    border: '1px solid var(--border, #D5E2DC)',
                    background: 'var(--bg-subtle, #F9FAFB)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
