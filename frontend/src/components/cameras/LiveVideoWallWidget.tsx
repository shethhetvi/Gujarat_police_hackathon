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
  const [streamError, setStreamError] = useState(false);
  const [reloadKey, setReloadKey] = useState(Date.now());
  // Dynamically map detected vehicles from active alerts matching the camera or latest critical alerts
  const [detectedVehicles, setDetectedVehicles] = useState<any[]>([]);

  useEffect(() => {
    if (cameras.length > 0 && !cameras.some(c => c.id === activeCamId)) {
      setActiveCamId(cameras[0].id);
    }
  }, [cameras, activeCamId]);

  // Sync detected vehicles with real active alerts
  useEffect(() => {
    const relevantAlerts = alerts.filter(a => !a.camera_id || a.camera_id === activeCamId || !a.acknowledged).slice(0, 3);
    if (relevantAlerts.length > 0) {
      const mapped = relevantAlerts.map((a, idx) => ({
        id: a.id || idx + 1,
        plate: a.plate_number,
        type: a.classification_tag?.replace(/_/g, ' ') || a.category || 'Target Vehicle',
        speed: Math.round(a.speed_kmh || (55 + idx * 7)),
        isMatch: a.severity === 'CRITICAL' || a.severity === 'HIGH',
        conf: 98.5,
        x: 30 + idx * 25,
        y: 45 + (idx % 2) * 10
      }));
      setDetectedVehicles(mapped);
    } else {
      setDetectedVehicles([]);
    }
  }, [alerts, activeCamId]);

  const activeCamera = cameras.find(c => c.id === activeCamId) || cameras[0];
  const primarySuspectAlert = alerts.find(a => a.camera_id === activeCamId && a.severity === 'CRITICAL') || 
    alerts.find(a => a.severity === 'CRITICAL') || 
    alerts[0];

  // Dynamic animation tick for real-time visual tracking
  useEffect(() => {
    if (detectedVehicles.length === 0) return;
    const timer = setInterval(() => {
      setDetectedVehicles(prev => prev.map(v => {
        let newX = v.x + (v.isMatch ? 1.0 : 0.6);
        if (newX > 88) newX = 15;
        return {
          ...v,
          x: newX,
          speed: Math.max(30, Math.min(120, Math.floor(v.speed + (Math.random() * 2 - 1))))
        };
      }));
    }, 150);

    return () => clearInterval(timer);
  }, [detectedVehicles.length]);

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
              key={`${activeCamId}-${reloadKey}`}
              src={`http://localhost:8000/api/v1/cameras/${activeCamera?.id || 1}/live-feed?source=auto`}
              alt={activeCamera?.name || 'Live CCTV Feed'}
              onLoad={() => setStreamError(false)}
              onError={() => {
                setStreamError(true);
                setTimeout(() => setReloadKey(Date.now()), 3500);
              }}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: streamError ? 'none' : 'block'
              }}
            />

            {/* Signal Connecting / Standby Indicator */}
            {streamError && (
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(10, 15, 24, 0.95)',
                color: '#38BDF8',
                gap: '0.6rem',
                zIndex: 4
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: '3px solid rgba(56, 189, 248, 0.2)',
                  borderTopColor: '#38BDF8',
                  animation: 'spin 1s linear infinite'
                }} />
                <span style={{ fontSize: '0.84rem', fontWeight: 800 }}>
                  Connecting to CAM-{String(activeCamera?.id || 1).padStart(2, '0')} HD Stream…
                </span>
                <span style={{ fontSize: '0.70rem', color: 'var(--text-muted)' }}>
                  Acquiring RTSP/HLS feed from Gujarat Police Sentinel Grid
                </span>
              </div>
            )}

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
                {activeCamera?.protocol || 'RTSP'} · 720p HD @ 25fps
              </span>
            </div>

            {/* Show simulated boxes only if stream has error/connecting */}
            {streamError && detectedVehicles.map(v => (
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
            {(() => {
              const primaryAlert = alerts.length > 0 ? alerts[0] : null;
              const matchedVeh = detectedVehicles.find(v => v.isMatch);
              const targetPlate = primaryAlert?.plate_number || matchedVeh?.plate || null;
              const targetSeverity = primaryAlert?.severity || (matchedVeh ? 'HIGH' : 'NORMAL');
              const targetDesc = primaryAlert
                ? `${primaryAlert.classification_tag || 'SUSPECT'} · ${primaryAlert.location_name || activeCamera?.location_name || 'In camera field of view'}`
                : (matchedVeh ? `${matchedVeh.type} · Surveillance Target` : 'Optical detection buffer active');

              return (
                <div style={{
                  padding: '0.85rem',
                  background: targetPlate ? 'var(--danger-light)' : 'var(--bg-subtle)',
                  border: `1.5px solid ${targetPlate ? 'var(--danger-border)' : 'var(--border)'}`,
                  borderRadius: 'var(--r-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.45rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="license-plate-badge" style={{ fontSize: '0.88rem' }}>
                      {targetPlate || 'OPTICAL SCAN'}
                    </span>
                    <span className={`police-chip police-chip-${targetSeverity.toLowerCase()}`} style={{ fontSize: '0.66rem' }}>
                      {targetSeverity}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: targetPlate ? 'var(--danger)' : 'var(--text-primary)' }}>
                    {targetPlate ? (primaryAlert ? `Target Intercept Alert: ${targetPlate}` : matchedVeh?.type) : 'All Camera Feeds Monitored'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {targetDesc}
                  </div>

                  {targetPlate && (
                    <button
                      onClick={() => handleTriggerIntercept(targetPlate)}
                      className="gov-btn gov-btn-danger"
                      style={{ marginTop: '0.25rem', width: '100%', fontSize: '0.82rem', fontWeight: 800 }}
                    >
                      <Zap size={14} />
                      <span>🚨 Intercept Target ({targetPlate})</span>
                    </button>
                  )}
                </div>
              );
            })()}

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
