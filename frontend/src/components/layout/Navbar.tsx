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
  Clock,
  Shield,
  Radio,
  User,
  AlertTriangle,
  Bot
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
  onRunLiveTestScenario?: () => void;
  onOpenAgent?: () => void;
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
  onRunLiveTestScenario,
  onOpenAgent,
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

  // Keyboard shortcut Ctrl+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onOpenSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenSearch]);

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
      gap: '1.25rem',
      flexWrap: 'wrap'
    }}>
      {/* ── Left: Clean Dashboard Title & Subtitle ── */}
      <div style={{ minWidth: '240px' }}>
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

      {/* ── Right: Perfectly Balanced, Evenly Ordered Command Controls ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem',
        flexWrap: 'nowrap'
      }}>
        {/* 1. Global Search Capsule */}
        <div
          onClick={onOpenSearch}
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-card, #FFFFFF)',
            border: '1.5px solid var(--border, #BFDEC9)',
            borderRadius: '9999px',
            padding: '3px 4px 3px 14px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
            transition: 'all 0.15s ease',
            width: '210px',
            height: '38px',
            boxSizing: 'border-box',
            flexShrink: 0
          }}
          title="Search Plate, Camera, or FIR (Ctrl + K)"
        >
          <span style={{
            flex: 1,
            fontSize: '0.80rem',
            color: '#9CA3AF',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            Search plate, FIR…
          </span>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: '#10B981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            flexShrink: 0,
            boxShadow: '0 2px 6px rgba(16, 185, 129, 0.35)'
          }}>
            <Search size={13} />
          </div>
        </div>

        {/* 2. Live IST Clock & Telemetry Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          padding: '0 0.85rem',
          height: '38px',
          boxSizing: 'border-box',
          borderRadius: '9999px',
          background: 'var(--bg-card, #FFFFFF)',
          border: '1.5px solid var(--border, #BFDEC9)',
          fontSize: '0.78rem',
          fontWeight: 700,
          color: 'var(--text-heading, #374151)',
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
          whiteSpace: 'nowrap',
          flexShrink: 0
        }}>
          <span style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: '#10B981',
            boxShadow: '0 0 6px #10B981',
            display: 'inline-block'
          }} />
          <Clock size={13} style={{ color: '#10B981' }} />
          <span style={{ fontFamily: 'var(--font-mono)' }} suppressHydrationWarning>{istTime || 'IST'}</span>
        </div>

        {/* Subtle Divider */}
        <div style={{ width: '1px', height: '22px', background: 'var(--border, #BFDEC9)', margin: '0 1px', flexShrink: 0 }} />

        {/* 3. Action Group: Live Test Scenario + Sim Alert + Sim Route */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 0 }}>
          {/* 1-Click Live Challenge Scenario */}
          {onRunLiveTestScenario && (
            <button
              onClick={onRunLiveTestScenario}
              disabled={isSimulating}
              style={{
                height: '38px',
                padding: '0 0.95rem',
                borderRadius: '9999px',
                border: '1.5px solid #F59E0B',
                background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
                color: '#FFFFFF',
                fontSize: '0.77rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: '0 3px 10px rgba(217, 119, 6, 0.35)',
                letterSpacing: '0.01em',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
                boxSizing: 'border-box'
              }}
              title="Execute Complete Live Evaluation Challenge: Track Watchlist Target, Trigger Voice Alert, Plot Route & Open Section 65B Dossier"
            >
              <Zap size={13} style={{ color: '#FEF08A' }} />
              <span>{isSimulating ? 'Executing…' : '⚡ Live Test Scenario'}</span>
            </button>
          )}

          {/* Sim Alert Button */}
          <button
            onClick={onSimulateAlert}
            disabled={isSimulating}
            style={{
              height: '38px',
              padding: '0 0.8rem',
              borderRadius: '9999px',
              border: '1.5px solid #FCA5A5',
              background: '#FEE2E2',
              color: '#DC2626',
              fontSize: '0.75rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              boxShadow: '0 2px 6px rgba(239, 68, 68, 0.15)',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
              boxSizing: 'border-box'
            }}
            title="Trigger Demo ANPR Intercept Alert"
          >
            <Zap size={12} />
            <span>Sim Alert</span>
          </button>

          {/* Sim Route Button */}
          <button
            onClick={onSimulateRoute}
            disabled={isSimulating}
            style={{
              height: '38px',
              padding: '0 0.8rem',
              borderRadius: '9999px',
              border: '1.5px solid #BFDBFE',
              background: '#EFF6FF',
              color: '#2563EB',
              fontSize: '0.75rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.15)',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
              boxSizing: 'border-box'
            }}
            title="Simulate Highway Checkpoint Trajectory"
          >
            <Navigation size={12} />
            <span>Sim Route</span>
          </button>

          {/* AI Copilot Agent Button */}
          {onOpenAgent && (
            <button
              onClick={onOpenAgent}
              style={{
                height: '38px',
                padding: '0 0.85rem',
                borderRadius: '9999px',
                border: '1.5px solid #10B981',
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                color: '#FFFFFF',
                fontSize: '0.75rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
                boxSizing: 'border-box'
              }}
              title="Open Autonomous Surveillance AI Agent"
            >
              <Bot size={13} style={{ color: '#A7F3D0' }} />
              <span>🤖 AI Agent</span>
            </button>
          )}
        </div>

        {/* Subtle Divider */}
        <div style={{ width: '1px', height: '22px', background: 'var(--border, #BFDEC9)', margin: '0 1px', flexShrink: 0 }} />

        {/* 4. Unified Officer & Notification Command Capsule (Perfect Alignment, Even Layout) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'var(--bg-card, #FFFFFF)',
          border: '1.5px solid var(--border, #BFDEC9)',
          borderRadius: '9999px',
          padding: '3px 10px 3px 6px',
          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.06)',
          gap: '8px',
          height: '38px',
          boxSizing: 'border-box',
          flexShrink: 0,
          position: 'relative'
        }}>
          {/* Notification Bell with Badge */}
          <div style={{ position: 'relative' }} ref={notifRef}>
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowOfficerMenu(false);
              }}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: showNotifications ? 'var(--bg-subtle, #EAF6EE)' : 'transparent',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: unreadCount > 0 ? '#EF4444' : '#4B5563',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.15s ease',
                padding: 0
              }}
              title="ICCC Alerts & Notifications"
            >
              <Bell size={15} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  minWidth: '15px',
                  height: '15px',
                  borderRadius: '50%',
                  background: '#EF4444',
                  color: '#FFFFFF',
                  fontSize: '0.60rem',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 2px',
                  border: '1.5px solid #FFFFFF'
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
                right: '-80px',
                width: '330px',
                background: 'var(--bg-card, #FFFFFF)',
                border: '1.5px solid var(--border, #BFDEC9)',
                borderRadius: '18px',
                boxShadow: '0 18px 40px rgba(0, 0, 0, 0.14)',
                zIndex: 1000,
                overflow: 'hidden'
              }}>
                <div style={{
                  padding: '0.85rem 1.15rem',
                  borderBottom: '1px solid var(--border, #BFDEC9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'var(--bg-subtle, #EAF6EE)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Bell size={14} style={{ color: '#10B981' }} />
                    <span style={{ fontWeight: 800, fontSize: '0.86rem', color: 'var(--text-heading)' }}>
                      Alert Notifications
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

          {/* Subtle Vertical Divider between Bell and Profile */}
          <div style={{ width: '1px', height: '20px', background: 'var(--border, #BFDEC9)' }} />

          {/* Officer Profile Interactive Trigger */}
          <div style={{ position: 'relative' }} ref={officerRef}>
            <div
              onClick={() => {
                setShowOfficerMenu(!showOfficerMenu);
                setShowNotifications(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                userSelect: 'none'
              }}
              title={`${defaultOfficer.name} · Badge #${defaultOfficer.badge_number} · Crime Branch`}
            >
              {/* Circular Avatar */}
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '0.74rem',
                boxShadow: '0 2px 6px rgba(16, 185, 129, 0.35)',
                flexShrink: 0
              }}>
                JP
              </div>

              {/* Officer Details */}
              <div style={{ textAlign: 'left', lineHeight: 1.15 }}>
                <div style={{
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  color: 'var(--text-heading, #111827)',
                  whiteSpace: 'nowrap'
                }}>
                  {defaultOfficer.name}
                </div>
                <div style={{
                  fontSize: '0.64rem',
                  color: '#6B7280',
                  fontWeight: 600,
                  whiteSpace: 'nowrap'
                }}>
                  #{defaultOfficer.badge_number} · Crime Branch
                </div>
              </div>

              <ChevronDown size={12} style={{ color: '#9CA3AF', marginLeft: '1px' }} />
            </div>

            {/* Officer Menu Popover */}
            {showOfficerMenu && (
              <div style={{
                position: 'absolute',
                top: '46px',
                right: 0,
                width: '250px',
                background: 'var(--bg-card, #FFFFFF)',
                border: '1.5px solid var(--border, #BFDEC9)',
                borderRadius: '18px',
                boxShadow: '0 18px 40px rgba(0, 0, 0, 0.14)',
                zIndex: 1000,
                padding: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '0.86rem'
                  }}>
                    JP
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-heading)' }}>
                      {defaultOfficer.name}
                    </div>
                    <div style={{ fontSize: '0.70rem', color: '#10B981', fontWeight: 700 }}>
                      Badge #{defaultOfficer.badge_number} · ON DUTY
                    </div>
                  </div>
                </div>

                <div style={{
                  fontSize: '0.72rem',
                  color: '#6B7280',
                  lineHeight: 1.5,
                  padding: '0.5rem 0',
                  borderTop: '1px solid var(--border, #BFDEC9)',
                  borderBottom: '1px solid var(--border, #BFDEC9)'
                }}>
                  <div><strong>Station:</strong> {defaultOfficer.police_station}</div>
                  <div><strong>District:</strong> {defaultOfficer.district}</div>
                  <div><strong>Shift:</strong> {defaultOfficer.shift}</div>
                </div>

                <div style={{
                  marginTop: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151' }}>Theme Mode</span>
                  <button
                    onClick={onToggleTheme}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '8px',
                      border: '1.5px solid var(--border, #BFDEC9)',
                      background: 'var(--bg-subtle, #EAF6EE)',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      color: 'var(--text-heading)'
                    }}
                  >
                    {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
