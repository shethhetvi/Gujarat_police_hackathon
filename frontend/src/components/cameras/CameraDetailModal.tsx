'use client';

import React from 'react';
import {
  X,
  Camera as CameraIcon,
  Video,
  Activity,
  MapPin,
  Wifi,
  HardDrive,
  Shield,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { Camera } from '../../types';

interface CameraDetailModalProps {
  camera: Camera | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CameraDetailModal({ camera, isOpen, onClose }: CameraDetailModalProps) {
  if (!isOpen || !camera) return null;

  return (
    <div className="cmd-backdrop" onClick={onClose} style={{ zIndex: 1150 }}>
      <div className="cmd-modal" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CameraIcon size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-heading)' }}>
                {camera.name}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Node ID: CAM-{String(camera.id).padStart(3, '0')} · {camera.location_name}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Viewport Simulation Frame */}
          <div style={{
            height: '240px',
            background: '#0B1120',
            borderRadius: 'var(--r-lg)',
            border: '1px solid var(--border)',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)',
              pointerEvents: 'none'
            }} />

            {/* Top HUD */}
            <div style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              right: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.65rem',
              color: '#FFFFFF'
            }}>
              <span style={{
                background: 'rgba(0,0,0,0.7)',
                padding: '2px 8px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: camera.is_active ? '#22C55E' : '#EF4444' }} />
                <span>{camera.is_active ? 'LIVE FEED (HD)' : 'SIGNAL LOST'}</span>
              </span>

              <span style={{ background: 'rgba(0,0,0,0.7)', padding: '2px 8px', borderRadius: '4px', fontFamily: 'monospace' }}>
                {camera.protocol} · 1920x1080 @ 30fps
              </span>
            </div>

            {/* AI Bounding Box */}
            <div style={{
              width: '160px',
              height: '75px',
              border: '1.5px dashed rgba(34, 197, 94, 0.8)',
              borderRadius: '4px',
              background: 'rgba(34, 197, 94, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '4px'
            }}>
              <span style={{ fontSize: '0.6rem', color: '#22C55E', fontFamily: 'monospace', fontWeight: 800 }}>
                ANPR TRACKER ACTIVE
              </span>
              <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#FFFFFF', textAlign: 'center', fontWeight: 900 }}>
                GJ01AB1234
              </div>
              <span style={{ fontSize: '0.55rem', color: '#38BDF8', fontFamily: 'monospace', textAlign: 'right' }}>
                98.4% Confidence
              </span>
            </div>

            {/* Bottom HUD */}
            <div style={{
              position: 'absolute',
              bottom: '8px',
              left: '10px',
              right: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.65rem',
              fontFamily: 'monospace',
              color: '#94A3B8'
            }}>
              <span>📍 {camera.location_name}</span>
              <span style={{ color: '#FCD34D' }} suppressHydrationWarning>{new Date().toLocaleTimeString('en-IN')} IST</span>
            </div>
          </div>

          {/* Diagnostic Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            <div style={{ padding: '0.75rem', background: 'var(--bg-subtle)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
              <div className="caption-label">Stream Protocol</div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-heading)', marginTop: '2px' }}>
                {camera.protocol} (H.264)
              </div>
            </div>

            <div style={{ padding: '0.75rem', background: 'var(--bg-subtle)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
              <div className="caption-label">Hardware Vendor</div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-heading)', marginTop: '2px' }}>
                {camera.vendor || 'Hikvision'}
              </div>
            </div>

            <div style={{ padding: '0.75rem', background: 'var(--bg-subtle)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
              <div className="caption-label">Throughput / FPS</div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--success)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                29.8 fps · 4.2 Mbps
              </div>
            </div>
          </div>

          {/* Location & GPS */}
          <div style={{ padding: '0.85rem 1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
            <div className="caption-label" style={{ marginBottom: '0.25rem' }}>GPS Coordinates & Stream Ingestion URI</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>
              📍 <strong>Coordinates:</strong> {camera.latitude?.toFixed(5)}°N, {camera.longitude?.toFixed(5)}°E
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', marginTop: '4px', wordBreak: 'break-all' }}>
              🔗 <strong>RTSP:</strong> {camera.stream_url || `rtsp://cctv.gujaratpolice.gov.in/cam_${camera.id}`}
            </div>
          </div>

          {/* Maintenance & Jurisdictional Status */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className={`police-chip ${camera.is_active ? 'police-chip-online' : 'police-chip-offline'}`}>
              {camera.is_active ? '● OPERATIONAL STATE' : '○ DISCONNECTED'}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
              Last Heartbeat: 2s ago
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
