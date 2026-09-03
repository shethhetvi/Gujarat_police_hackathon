'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  Camera as CameraIcon,
  AlertTriangle,
  Crosshair,
  Car,
  ArrowRight,
  MapPin,
  Clock
} from 'lucide-react';
import { Camera, WatchlistEntry, Alert, DetectionEvent } from '../../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  cameras: Camera[];
  watchlist: WatchlistEntry[];
  alerts: Alert[];
  detections: DetectionEvent[];
  onSelectPlate: (plate: string) => void;
  onSelectCamera: (camId: number) => void;
  onSelectAlert: (alert: Alert) => void;
  onNavigateTab: (tab: string) => void;
}

export default function GlobalSearchModal({
  isOpen,
  onClose,
  cameras,
  watchlist,
  alerts,
  detections,
  onSelectPlate,
  onSelectCamera,
  onSelectAlert,
  onNavigateTab
}: GlobalSearchModalProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  // Search results
  const matchingAlerts = q
    ? alerts.filter(a => a.plate_number.toLowerCase().includes(q) || a.location_name?.toLowerCase().includes(q))
    : alerts.slice(0, 3);

  const matchingWatchlist = q
    ? watchlist.filter(w =>
        w.plate_number.toLowerCase().includes(q) ||
        w.category.toLowerCase().includes(q) ||
        w.description?.toLowerCase().includes(q) ||
        w.vehicle_make_model?.toLowerCase().includes(q)
      )
    : watchlist.slice(0, 3);

  const matchingCameras = q
    ? cameras.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.location_name.toLowerCase().includes(q) ||
        c.vendor?.toLowerCase().includes(q)
      )
    : cameras.slice(0, 3);

  const totalResults = matchingAlerts.length + matchingWatchlist.length + matchingCameras.length;

  return (
    <div className="cmd-backdrop" onClick={onClose}>
      <div className="cmd-modal" onClick={e => e.stopPropagation()}>
        {/* Header Input */}
        <div className="cmd-input-header">
          <Search size={20} style={{ color: 'var(--primary)' }} />
          <input
            ref={inputRef}
            type="text"
            className="cmd-input"
            placeholder="Search license plate, camera junction, FIR note, alert…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          )}
          <kbd style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            padding: '0.15rem 0.4rem',
            fontSize: '0.68rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)'
          }}>
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="cmd-results-list">
          {totalResults === 0 ? (
            <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center', color: 'var(--text-dim)' }}>
              <Search size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                No matches found for "{query}"
              </div>
              <div style={{ fontSize: '0.78rem', marginTop: '0.2rem' }}>
                Try searching for a vehicle plate (e.g. GJ01), camera junction or category.
              </div>
            </div>
          ) : (
            <>
              {/* Active Intercept Alerts */}
              {matchingAlerts.length > 0 && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.07em',
                    color: 'var(--danger)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}>
                    <AlertTriangle size={12} />
                    <span>Active Intercept Alerts ({matchingAlerts.length})</span>
                  </div>
                  {matchingAlerts.map(a => (
                    <div
                      key={a.id}
                      className="cmd-item"
                      onClick={() => {
                        onSelectAlert(a);
                        onClose();
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          background: 'var(--danger-light)',
                          color: 'var(--danger)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <AlertTriangle size={16} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span className="license-plate-badge" style={{ fontSize: '0.8rem', padding: '0.15rem 0.45rem' }}>
                              {a.plate_number}
                            </span>
                            <span className="police-chip police-chip-critical" style={{ fontSize: '0.65rem' }}>
                              {a.severity}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }} suppressHydrationWarning>
                            📍 {a.location_name || 'Gujarat CCTV Node'} · {new Date(a.timestamp).toLocaleTimeString('en-IN')}
                          </div>
                        </div>
                      </div>
                      <ArrowRight size={15} style={{ color: 'var(--text-dim)' }} />
                    </div>
                  ))}
                </div>
              )}

              {/* Watchlist Entries */}
              {matchingWatchlist.length > 0 && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.07em',
                    color: 'var(--warning)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}>
                    <Crosshair size={12} />
                    <span>Watchlist Targets ({matchingWatchlist.length})</span>
                  </div>
                  {matchingWatchlist.map(w => (
                    <div
                      key={w.id}
                      className="cmd-item"
                      onClick={() => {
                        onSelectPlate(w.plate_number);
                        onNavigateTab('watchlist');
                        onClose();
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          background: 'var(--warning-light)',
                          color: 'var(--warning)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Car size={16} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span className="license-plate-badge" style={{ fontSize: '0.8rem', padding: '0.15rem 0.45rem' }}>
                              {w.plate_number}
                            </span>
                            <span style={{ fontSize: '0.74rem', fontWeight: 600, textTransform: 'capitalize', color: 'var(--text-main)' }}>
                              {w.category} Vehicle
                            </span>
                            <span className={`police-chip police-chip-${w.priority.toLowerCase()}`} style={{ fontSize: '0.65rem' }}>
                              {w.priority}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {w.vehicle_make_model || 'Vehicle'} · {w.description || 'Watchlist registry entry'}
                          </div>
                        </div>
                      </div>
                      <ArrowRight size={15} style={{ color: 'var(--text-dim)' }} />
                    </div>
                  ))}
                </div>
              )}

              {/* Cameras */}
              {matchingCameras.length > 0 && (
                <div>
                  <div style={{
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.07em',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}>
                    <CameraIcon size={12} />
                    <span>CCTV Cameras & Junctions ({matchingCameras.length})</span>
                  </div>
                  {matchingCameras.map(c => (
                    <div
                      key={c.id}
                      className="cmd-item"
                      onClick={() => {
                        onSelectCamera(c.id);
                        onNavigateTab('cameras');
                        onClose();
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          background: 'var(--primary-light)',
                          color: 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <CameraIcon size={16} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-heading)' }}>
                            {c.name}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            📍 {c.location_name} · <span style={{ fontFamily: 'var(--font-mono)' }}>{c.vendor || 'RTSP'}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`police-chip ${c.is_active ? 'police-chip-online' : 'police-chip-offline'}`} style={{ fontSize: '0.65rem' }}>
                        {c.is_active ? '● LIVE' : '○ OFFLINE'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer info */}
        <div style={{
          padding: '0.6rem 1rem',
          borderTop: '1px solid var(--border)',
          background: 'var(--bg-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.72rem',
          color: 'var(--text-dim)'
        }}>
          <span>Press <strong>↵ Enter</strong> to select · <strong>Esc</strong> to close</span>
          <span>SentinelGrid Intelligent Search</span>
        </div>
      </div>
    </div>
  );
}
