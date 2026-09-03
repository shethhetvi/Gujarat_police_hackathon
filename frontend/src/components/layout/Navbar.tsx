'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Bell,
  Sun,
  Moon,
  Shield,
  Radio,
  Zap,
  Navigation,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Clock,
  LogOut
} from 'lucide-react';
import { OfficerProfile, NotificationItem } from '../../types';

interface NavbarProps {
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

export default function Navbar({
  theme,
  onToggleTheme,
  onOpenSearch,
  backendOnline,
  wsStatus,
  notifications,
  onMarkAllNotificationsRead,
  onSimulateAlert,
  onSimulateRoute,
  isSimulating,
  trackPlate,
  onTrackPlateChange
}: NavbarProps) {
  const [istTime, setIstTime] = useState('');
  const [showOfficerMenu, setShowOfficerMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const officerRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Live IST Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      };
      setIstTime(new Intl.DateTimeFormat('en-IN', options).format(now));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Close popovers on click outside
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

  return (
    <header className="app-header" style={{
      height: '68px',
      background: 'linear-gradient(90deg, #0A1628 0%, #0F233D 50%, #0A1628 100%)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.25rem',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)'
    }}>
      {/* ── Left: Official Gujarat Police Seal & Title (High Contrast) ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexShrink: 0 }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #1E3A8A 0%, #0F172A 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FCD34D',
          border: '1.5px solid #FCD34D',
          boxShadow: '0 0 12px rgba(252, 211, 77, 0.35)'
        }}>
          <Shield size={24} style={{ strokeWidth: 2.2 }} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              fontWeight: 900,
              fontSize: '1.08rem',
              color: '#FFFFFF',
              letterSpacing: '0.02em',
              lineHeight: 1.15
            }}>
              GUJARAT POLICE
            </span>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              padding: '2px 7px',
              borderRadius: '4px',
              background: '#10B981',
              color: '#FFFFFF',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)'
            }}>
              ICCC NETRAM
            </span>
          </div>
          <div style={{
            fontSize: '0.72rem',
            color: '#94A3B8',
            fontWeight: 500,
            lineHeight: 1.2,
            marginTop: '2px'
          }}>
            Integrated Command & Control Centre · Smart Surveillance Grid
          </div>
        </div>
      </div>

      {/* ── Center: Search Capsule with Emerald Action Button ── */}
      <div style={{ flex: 1, maxWidth: '380px', margin: '0 1.5rem' }}>
        <div
          onClick={onOpenSearch}
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            borderRadius: '9999px',
            padding: '4px 6px 4px 16px',
            cursor: 'pointer',
            boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.3)',
            transition: 'all 0.15s ease'
          }}
        >
          <span style={{ flex: 1, fontSize: '0.84rem', color: '#CBD5E1' }}>
            Search plate, camera, alert…
          </span>
          <kbd style={{
            background: 'rgba(255, 255, 255, 0.12)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '4px',
            padding: '2px 5px',
            fontSize: '0.65rem',
            fontFamily: 'monospace',
            color: '#94A3B8',
            marginRight: '8px'
          }}>
            Ctrl+K
          </kbd>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#10B981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)'
          }}>
            <Search size={15} />
          </div>
        </div>
      </div>

      {/* ── Right: Multi-Contrast Controls Cluster ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexShrink: 0 }}>
        {/* Live IST Clock */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.4rem 0.75rem',
          borderRadius: '10px',
          background: 'rgba(255, 255, 255, 0.07)',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          fontSize: '0.78rem',
          fontWeight: 700,
          color: '#FCD34D'
        }}>
          <Clock size={14} style={{ color: '#FCD34D' }} />
          <span style={{ fontFamily: 'var(--font-mono)' }} suppressHydrationWarning>{istTime || 'IST Clock'}</span>
        </div>

        {/* Backend & WS Status Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.35rem 0.7rem',
          borderRadius: '10px',
          background: backendOnline ? 'rgba(34, 197, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)',
          border: `1px solid ${backendOnline ? 'rgba(34, 197, 94, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
          fontSize: '0.72rem',
          fontWeight: 800
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: backendOnline ? '#22C55E' : '#F59E0B',
            boxShadow: backendOnline ? '0 0 8px #22C55E' : '0 0 8px #F59E0B'
          }} />
          <span style={{ color: backendOnline ? '#4ADE80' : '#FCD34D' }}>
            {backendOnline ? 'GRID ONLINE' : 'SIMULATOR'}
          </span>
        </div>

        {/* Demo Simulation Action Buttons */}
        <button
          onClick={onSimulateAlert}
          disabled={isSimulating}
          style={{
            padding: '0.4rem 0.75rem',
            borderRadius: '10px',
            border: 'none',
            background: '#EF4444',
            color: '#FFFFFF',
            fontSize: '0.76rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.35)'
          }}
          title="Simulate Real-time ANPR Alert"
        >
          <Zap size={13} />
          <span>{isSimulating ? '…' : 'Sim Alert'}</span>
        </button>

        <button
          onClick={onSimulateRoute}
          disabled={isSimulating}
          style={{
            padding: '0.4rem 0.75rem',
            borderRadius: '10px',
            border: 'none',
            background: '#2563EB',
            color: '#FFFFFF',
            fontSize: '0.76rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.35)'
          }}
          title="Simulate Highway Route"
        >
          <Navigation size={13} />
          <span>Sim Route</span>
        </button>

        {/* Light / Dark Mode Toggle Button */}
        <button
          onClick={onToggleTheme}
          style={{
            padding: '0.35rem 0.65rem',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            color: '#FFFFFF',
            cursor: 'pointer',
            fontSize: '0.74rem',
            fontWeight: 700
          }}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? (
            <>
              <Moon size={14} style={{ color: '#38BDF8' }} />
              <span>Dark</span>
            </>
          ) : (
            <>
              <Sun size={14} style={{ color: '#FCD34D' }} />
              <span>Light</span>
            </>
          )}
        </button>

        {/* Notification Bell */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--r-md)',
              background: unreadCount > 0 ? 'var(--danger-light)' : 'var(--bg-subtle)',
              border: unreadCount > 0 ? '1px solid var(--danger-border)' : '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: unreadCount > 0 ? 'var(--danger)' : 'var(--text-muted)',
              cursor: 'pointer',
              position: 'relative'
            }}
            title="Notifications"
          >
            <Bell size={15} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                minWidth: '14px',
                height: '14px',
                borderRadius: '7px',
                background: 'var(--danger)',
                color: '#FFFFFF',
                fontSize: '0.6rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 2px'
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Drawer */}
          {showNotifications && (
            <div style={{
              position: 'absolute',
              top: '40px',
              right: 0,
              width: '320px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-lg)',
              boxShadow: 'var(--shadow-modal)',
              zIndex: 1000,
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '0.75rem 1rem',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--bg-subtle)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Bell size={14} style={{ color: 'var(--primary)' }} />
                  <span style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--text-heading)' }}>
                    Notifications
                  </span>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllNotificationsRead}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--primary)',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                    <CheckCircle2 size={26} style={{ margin: '0 auto 0.4rem', color: 'var(--success)' }} />
                    <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-main)' }}>All Clear</div>
                    <div style={{ fontSize: '0.72rem' }}>No unread intercept notifications</div>
                  </div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      style={{
                        padding: '0.65rem 0.85rem',
                        borderBottom: '1px solid var(--border)',
                        background: n.read ? 'transparent' : 'var(--primary-light)',
                        display: 'flex',
                        gap: '0.5rem'
                      }}
                    >
                      <div style={{ marginTop: '2px' }}>
                        {n.severity === 'CRITICAL' ? (
                          <AlertTriangle size={15} style={{ color: 'var(--danger)' }} />
                        ) : (
                          <Radio size={15} style={{ color: 'var(--warning)' }} />
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-heading)' }}>
                          {n.title}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {n.message}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginTop: '3px' }}>
                          {n.timestamp}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Officer Profile Badge & Dropdown */}
        <div style={{ position: 'relative' }} ref={officerRef}>
          <button
            onClick={() => setShowOfficerMenu(!showOfficerMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.25rem 0.55rem 0.25rem 0.35rem',
              borderRadius: 'var(--r-md)',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border)',
              cursor: 'pointer'
            }}
          >
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: 'var(--primary)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.72rem'
            }}>
              JP
            </div>
            <div style={{ textAlign: 'left', lineHeight: 1.15 }}>
              <div style={{ fontWeight: 700, fontSize: '0.75rem', color: 'var(--text-heading)' }}>
                {defaultOfficer.name}
              </div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-dim)' }}>
                #{defaultOfficer.badge_number}
              </div>
            </div>
            <ChevronDown size={12} style={{ color: 'var(--text-dim)' }} />
          </button>

          {/* Officer Menu Popover */}
          {showOfficerMenu && (
            <div style={{
              position: 'absolute',
              top: '40px',
              right: 0,
              width: '260px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-lg)',
              boxShadow: 'var(--shadow-modal)',
              zIndex: 1000,
              padding: '0.9rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', paddingBottom: '0.65rem', borderBottom: '1px solid var(--border)' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.88rem'
                }}>
                  JP
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-heading)' }}>
                    {defaultOfficer.name}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {defaultOfficer.role}
                  </div>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    color: 'var(--success)',
                    marginTop: '2px'
                  }}>
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--success)' }} />
                    ACTIVE ON DUTY
                  </div>
                </div>
              </div>

              <div style={{ padding: '0.65rem 0', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.72rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>Badge Number:</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>#{defaultOfficer.badge_number}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>Station:</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{defaultOfficer.police_station}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>Shift:</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{defaultOfficer.shift}</span>
                </div>
              </div>

              <div style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                <button
                  style={{
                    width: '100%',
                    padding: '0.4rem',
                    borderRadius: 'var(--r-md)',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-subtle)',
                    color: 'var(--text-muted)',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                    cursor: 'pointer'
                  }}
                  onClick={() => setShowOfficerMenu(false)}
                >
                  <LogOut size={12} />
                  <span>Handover Shift</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
