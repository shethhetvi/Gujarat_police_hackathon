'use client';

import React from 'react';
import {
  Activity,
  AlertTriangle,
  Car,
  Camera as CameraIcon,
  Clock,
  Shield,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { Alert, DetectionEvent, Camera } from '../../types';

interface AIActivityTimelineProps {
  alerts: Alert[];
  detections: DetectionEvent[];
  cameras: Camera[];
  onSelectAlert: (alert: Alert) => void;
  onSelectDetection: (detection: DetectionEvent) => void;
}

export default function AIActivityTimeline({
  alerts,
  detections,
  cameras,
  onSelectAlert,
  onSelectDetection
}: AIActivityTimelineProps) {
  // Merge recent alerts and detections into a unified chronological feed
  const timelineEvents: {
    id: string;
    type: 'ALERT' | 'DETECTION';
    plateNumber: string;
    title: string;
    location: string;
    timestamp: string;
    severity?: string;
    matched?: boolean;
    rawAlert?: Alert;
    rawDetection?: DetectionEvent;
  }[] = [];

  alerts.slice(0, 10).forEach(a => {
    timelineEvents.push({
      id: `alert-${a.id}`,
      type: 'ALERT',
      plateNumber: a.plate_number,
      title: `Watchlist Intercept Triggered (${a.severity})`,
      location: a.location_name || 'Gujarat CCTV Node',
      timestamp: a.timestamp,
      severity: a.severity,
      matched: true,
      rawAlert: a
    });
  });

  detections.slice(0, 15).forEach(d => {
    const cam = cameras.find(c => c.id === d.camera_id);
    timelineEvents.push({
      id: `det-${d.id}`,
      type: 'DETECTION',
      plateNumber: d.plate_number || 'VEHICLE',
      title: d.matched ? 'ANPR Watchlist Match Logged' : 'Vehicle Scanned & Verified Clear',
      location: cam?.location_name || `Camera Node #${d.camera_id}`,
      timestamp: d.timestamp,
      severity: d.matched ? 'HIGH' : 'LOW',
      matched: d.matched,
      rawDetection: d
    });
  });

  // Sort latest first
  timelineEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="gov-card">
      <div className="gov-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={18} style={{ color: 'var(--primary)' }} />
          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-heading)' }}>
            Real-Time AI Surveillance & Dispatch Timeline
          </span>
        </div>
        <span className="police-chip police-chip-online" style={{ fontSize: '0.68rem' }}>
          LIVE FEED
        </span>
      </div>

      <div className="gov-card-body" style={{ maxHeight: '380px', overflowY: 'auto' }}>
        {timelineEvents.length === 0 ? (
          <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-dim)' }}>
            <Clock size={28} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Waiting for AI detection events…</div>
            <div style={{ fontSize: '0.74rem' }}>Trigger 'Simulate Alert' to test real-time stream.</div>
          </div>
        ) : (
          <div style={{ position: 'relative', paddingLeft: '1.25rem' }}>
            {/* Timeline vertical line */}
            <div style={{
              position: 'absolute',
              left: '6px',
              top: '8px',
              bottom: '8px',
              width: '2px',
              background: 'var(--border)'
            }} />

            {timelineEvents.map((ev, i) => {
              const isAlert = ev.type === 'ALERT';
              const dotColor = isAlert ? 'var(--danger)' : ev.matched ? 'var(--warning)' : 'var(--success)';

              return (
                <div
                  key={ev.id}
                  onClick={() => {
                    if (ev.rawAlert) onSelectAlert(ev.rawAlert);
                    else if (ev.rawDetection) onSelectDetection(ev.rawDetection);
                  }}
                  style={{
                    position: 'relative',
                    marginBottom: '1rem',
                    cursor: 'pointer',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--r-md)',
                    background: isAlert ? 'var(--danger-light)' : 'var(--bg-subtle)',
                    border: '1px solid',
                    borderColor: isAlert ? 'var(--danger-border)' : 'var(--border)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {/* Timeline node dot */}
                  <div style={{
                    position: 'absolute',
                    left: '-1.45rem',
                    top: '12px',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: dotColor,
                    border: '2px solid var(--bg-card)',
                    boxShadow: `0 0 4px ${dotColor}`
                  }} />

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <span className="license-plate-badge" style={{ fontSize: '0.78rem', padding: '0.1rem 0.4rem' }}>
                        {ev.plateNumber}
                      </span>
                      <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-heading)' }}>
                        {ev.title}
                      </span>
                    </div>

                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }} suppressHydrationWarning>
                      {new Date(ev.timestamp).toLocaleTimeString('en-IN')}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>📍 {ev.location}</span>
                    <span style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.7rem' }}>Inspect →</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
