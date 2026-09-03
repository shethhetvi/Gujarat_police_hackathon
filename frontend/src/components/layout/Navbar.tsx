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
      height: '60px',
      background: 'var(--bg-panel)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1rem',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: 'var(--shadow-sm)'
    }}>
      {/* ── Left: Official Gujarat Police Seal & Title ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '9px',
          background: 'linear-gradient(135deg, #0F4C81, #1E3A8A)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FCD34D',
          border: '1.5px solid #FCD34D',
          boxShadow: '0 2px 6px rgba(15, 76, 129, 0.25)'
        }}>
          <Shield size={22} style={{ strokeWidth: 2.2 }} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{
              fontWeight: 800,
              fontSize: '1rem',
              color: 'var(--text-heading)',
              letterSpacing: '-0.01em',
              lineHeight: 1.15
            }}>
              GUJARAT POLICE
            </span>
            <span style={{
              fontSize: '0.65rem',
              fontWeight: 800,
              padding: '1px 5px',
              borderRadius: '3px',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              border: '1px solid var(--primary-border)'
            }}>
              ICCC
            </span>
          </div>
          <div style={{
            fontSize: '0.68rem',
            color: 'var(--text-muted)',
            fontWeight: 500,
            lineHeight: 1.2
          }}>
            SentinelGrid · Smart Surveillance Grid
          </div>
        </div>
      </div>

      {/* ── Center: Global Search Bar (Ctrl+K) ── */}
      <div style={{ flex: 1, maxWidth: '340px', margin: '0 1rem' }}>
        <button
          onClick={onOpenSearch}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.45rem 0.75rem',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-md)',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '0.82rem',
            transition: 'all 0.15s ease'
          }}
          className="gov-search-trigger"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Search size={15} style={{ color: 'var(--text-dim)' }} />
            <span>Search plate, camera, alert…</span>
          </div>
          <kbd style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-strong)',
            borderRadius: '4px',
            padding: '1px 5px',
            fontSize: '0.68rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)'
          }}>
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* ── Right: IST Clock, Status, Simulators, Theme, Officer, Notifications ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
        {/* Live IST Clock */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          padding: '0.35rem 0.6rem',
          borderRadius: 'var(--r-md)',
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border)',
          fontSize: '0.74rem',
          fontWeight: 600,
          color: 'var(--text-muted)'
        }}>
          <Clock size={13} style={{ color: 'var(--primary)' }} />
          <span style={{ fontFamily: 'var(--font-mono)' }}>{istTime || 'IST Clock'}</span>
        </div>

        {/* Backend & WS Status Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.3rem 0.6rem',
          borderRadius: 'var(--r-md)',
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border)',
          fontSize: '0.72rem',
          fontWeight: 700
        }}>
          <span style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: backendOnline ? 'var(--success)' : 'var(--warning)',
            boxShadow: backendOnline ? '0 0 6px rgba(22, 163, 74, 0.5)' : 'none'
          }} />
          <span style={{ color: backendOnline ? 'var(--success)' : 'var(--warning)' }}>
            {backendOnline ? 'ONLINE' : 'SIMULATOR'}
          </span>
        </div>

        {/* Demo Simulation Action Buttons */}
        <button
          onClick={onSimulateAlert}
          disabled={isSimulating}
          className="gov-btn gov-btn-danger gov-btn-xs"
          title="Simulate Real-time ANPR Alert"
        >
          <Zap size={12} />
          <span>{isSimulating ? '…' : 'Sim Alert'}</span>
        </button>

        <button
          onClick={onSimulateRoute}
          disabled={isSimulating}
          className="gov-btn gov-btn-primary gov-btn-xs"
          title="Simulate Highway Route"
        >
          <Navigation size={12} />
          <span>Sim Route</span>
        </button>

        {/* Light / Dark Mode Toggle */}
        <button
          onClick={onToggleTheme}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--r-md)',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon size={15} /> : <Sun size={15} style={{ color: '#FCD34D' }} />}
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
