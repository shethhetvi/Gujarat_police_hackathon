'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  Radio,
  Camera as CameraIcon,
  Maximize2,
  Volume2,
  VolumeX,
  Zap,
  Shield,
  Eye,
  Crosshair,
  AlertTriangle
} from 'lucide-react';
import { Camera, Alert } from '../../types';
import { soundEffects } from '../../services/audio';

interface LiveVideoWallWidgetProps {
  cameras: Camera[];
  alerts: Alert[];
  onTriggerAlert: (plate: string) => void;
  onSelectPlate?: (plate: string) => void;
}

export default function LiveVideoWallWidget({
  cameras,
  alerts,
  onTriggerAlert,
  onSelectPlate
}: LiveVideoWallWidgetProps) {
  const [activeCamId, setActiveCamId] = useState<number>(cameras[0]?.id || 1);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [detectedVehicles, setDetectedVehicles] = useState<any[]>([
    { id: 1, plate: 'GJ01AB1234', type: 'SUV (White Fortuner)', speed: 68, isMatch: true, conf: 98.6, x: 50, y: 55 },
    { id: 2, plate: 'GJ01XY4411', type: 'Sedan (Silver Honda)', speed: 54, isMatch: false, conf: 97.2, x: 22, y: 40 },
    { id: 3, plate: 'GJ27EF9012', type: 'SUV (Black Scorpio)', speed: 62, isMatch: true, conf: 99.1, x: 78, y: 45 }
  ]);

  const [frameTick, setFrameTick] = useState(0);
  const activeCamera = cameras.find(c => c.id === activeCamId) || cameras[0];

  // Dynamic animation tick: moves simulated vehicles across traffic lanes
  useEffect(() => {
    const timer = setInterval(() => {
      setFrameTick(t => t + 1);
      setDetectedVehicles(prev => prev.map(v => {
        let newX = v.x + (v.isMatch ? 1.2 : 0.8);
        if (newX > 90) newX = 10;
        return {
          ...v,
          x: newX,
          speed: Math.floor(v.speed + (Math.random() * 4 - 2))
        };
      }));
    }, 120);

    return () => clearInterval(timer);
  }, []);

  const handleToggleAudio = () => {
    const next = !isAudioMuted;
    setIsAudioMuted(next);
    soundEffects.setMuted(next);
  };

  const handleTriggerIntercept = (plate: string) => {
    soundEffects.playAlertSiren();
    onTriggerAlert(plate);
  };

  return (
    <div className="gov-card" style={{ overflow: 'hidden' }}>
      <div className="gov-card-header" style={{ background: 'linear-gradient(90deg, var(--bg-card), var(--primary-light))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            background: 'var(--danger)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF'
          }}>
            <Video size={16} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span style={{ fontWeight: 900, fontSize: '0.96rem', color: 'var(--text-heading)' }}>
                Live Netram CCTV Optical Surveillance Wall
              </span>
              <span className="police-chip police-chip-critical" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                LIVE FEED · 30 FPS
              </span>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Real-time YOLOv8 vehicle detection & neural ANPR optical scanner
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Camera Node Switcher */}
          <select
            value={activeCamId}
            onChange={e => setActiveCamId(parseInt(e.target.value))}
            className="gov-select"
            style={{ width: 'auto', padding: '0.25rem 0.65rem', fontSize: '0.78rem', fontWeight: 700 }}
          >
            {cameras.map(c => (
              <option key={c.id} value={c.id}>
                CAM-{String(c.id).padStart(2, '0')}: {c.name}
              </option>
            ))}
          </select>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleAudio}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--r-md)',
              border: '1px solid var(--border)',
              background: 'var(--bg-subtle)',
              color: isAudioMuted ? 'var(--text-dim)' : 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            title={isAudioMuted ? 'Unmute tactical alarms' : 'Mute tactical alarms'}
          >
            {isAudioMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
        </div>
      </div>

      <div className="gov-card-body" style={{ padding: '0.85rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', alignItems: 'stretch' }}>
          {/* Main CCTV Feed Viewport */}
          <div style={{
            height: '280px',
            background: '#040711',
            borderRadius: 'var(--r-lg)',
            position: 'relative',
            overflow: 'hidden',
            border: '1.5px solid var(--border)',
            boxShadow: 'inset 0 0 40px rgba(0,0,0,0.8)'
          }}>
            {/* Scanlines Effect */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
              pointerEvents: 'none',
              zIndex: 3
            }} />

            {/* Real Live Video Stream from Backend */}
            <img
              key={activeCamId}
              src={`http://localhost:8000/api/v1/cameras/${activeCamera?.id || 1}/live-feed?source=auto`}
              alt={activeCamera?.name || 'Live CCTV Feed'}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />

            {/* Top HUD Overlay */}
            <div style={{
              position: 'absolute',
              top: '10px',
              left: '12px',
              right: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              zIndex: 5,
              fontSize: '0.72rem',
              color: '#FFFFFF'
            }}>
              <span style={{
                background: 'rgba(0,0,0,0.85)',
                padding: '3px 8px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 800,
                border: '1px solid rgba(239, 68, 68, 0.4)'
              }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#EF4444', animation: 'beaconPulse 1.2s infinite' }} />
                <span>REC · NETRAM CCTV-0{activeCamId}</span>
              </span>

              <span style={{ background: 'rgba(0,0,0,0.85)', padding: '3px 8px', borderRadius: '4px', fontFamily: 'monospace', color: '#38BDF8', fontWeight: 700 }}>
                {activeCamera?.protocol || 'RTSP'} · 1080p @ 30fps
              </span>
            </div>

            {/* Animated Vehicles with YOLOv8 Bounding Boxes */}
            {detectedVehicles.map(v => (
              <div
                key={v.id}
                style={{
                  position: 'absolute',
                  left: `${v.x}%`,
                  top: `${v.y}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 4,
                  transition: 'left 0.12s linear'
                }}
              >
                {/* Bounding Box Frame */}
                <div style={{
                  width: v.isMatch ? '140px' : '110px',
                  height: v.isMatch ? '75px' : '55px',
                  border: `2px solid ${v.isMatch ? '#EF4444' : '#22C55E'}`,
                  borderRadius: '4px',
                  background: v.isMatch ? 'rgba(239, 68, 68, 0.18)' : 'rgba(34, 197, 94, 0.08)',
                  boxShadow: v.isMatch ? '0 0 14px rgba(239, 68, 68, 0.6)' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '3px 5px'
                }}>
                  {/* Top Tag */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.58rem',
                    fontFamily: 'monospace',
                    fontWeight: 900,
                    color: v.isMatch ? '#EF4444' : '#22C55E'
                  }}>
                    <span>{v.isMatch ? '🚨 TARGET MATCH' : 'CLEARED'}</span>
                    <span>{v.speed} km/h</span>
                  </div>

                  {/* Vehicle License Plate Center */}
                  <div style={{
                    fontFamily: 'monospace',
                    fontWeight: 900,
                    fontSize: v.isMatch ? '0.9rem' : '0.78rem',
                    color: '#FFFFFF',
                    textAlign: 'center',
                    letterSpacing: '0.06em',
                    textShadow: '0 2px 4px rgba(0,0,0,0.9)'
                  }}>
                    {v.plate}
                  </div>

                  {/* Bottom Stats */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.52rem',
                    color: '#94A3B8',
                    fontFamily: 'monospace'
                  }}>
                    <span>{v.type.split(' ')[0]}</span>
                    <span style={{ color: '#38BDF8' }}>{v.conf}%</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Bottom Location & Timestamp HUD */}
            <div style={{
              position: 'absolute',
              bottom: '8px',
              left: '12px',
              right: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.7rem',
              fontFamily: 'monospace',
              color: '#CBD5E1',
              zIndex: 5,
              fontWeight: 700
            }}>
              <span>📍 {activeCamera?.location_name || 'Ahmedabad S.G. Highway'}</span>
              <span style={{ color: '#FCD34D' }} suppressHydrationWarning>{new Date().toLocaleTimeString('en-IN')} IST</span>
            </div>
          </div>

          {/* Quick Intercept Action Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div className="caption-label" style={{ marginBottom: '0.2rem' }}>
              Optical Intercept Trigger
            </div>

            {/* Suspect Target Card */}
            <div style={{
              padding: '0.85rem',
              background: 'var(--danger-light)',
              border: '1.5px solid var(--danger-border)',
              borderRadius: 'var(--r-md)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.45rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="license-plate-badge" style={{ fontSize: '0.88rem' }}>
                  GJ01AB1234
                </span>
                <span className="police-chip police-chip-critical" style={{ fontSize: '0.66rem' }}>
                  CRITICAL
                </span>
              </div>

              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--danger)' }}>
                White Fortuner · Stolen (Armed)
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                FIR #4092 Navrangpura PS · Tracking live in camera field of view
              </div>

              <button
                onClick={() => handleTriggerIntercept('GJ01AB1234')}
                className="gov-btn gov-btn-danger"
                style={{ marginTop: '0.25rem', width: '100%', fontSize: '0.82rem', fontWeight: 800 }}
              >
                <Zap size={14} />
                <span>🚨 Intercept Target Now</span>
              </button>
            </div>

            {/* Camera Diagnostics Bar */}
            <div style={{
              padding: '0.75rem',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-md)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
              fontSize: '0.74rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Optic Node:</span>
                <span style={{ fontWeight: 700 }}>CAM-0{activeCamId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Inference Rate:</span>
                <span style={{ fontWeight: 800, color: 'var(--success)' }}>30.2 FPS</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Optical Confidence:</span>
                <span style={{ fontWeight: 800, color: 'var(--primary)' }}>98.6%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
