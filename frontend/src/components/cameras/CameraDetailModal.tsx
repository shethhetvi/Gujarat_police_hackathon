'use client';

import React, { useState } from 'react';
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
  CheckCircle2,
  Play,
  Zap,
  AlertTriangle,
  ImageIcon
} from 'lucide-react';
import { Camera } from '../../types';

interface CameraDetailModalProps {
  camera: Camera | null;
  isOpen: boolean;
  onClose: () => void;
  onAlertTriggered?: () => void;
}

export default function CameraDetailModal({
  camera,
  isOpen,
  onClose,
  onAlertTriggered
}: CameraDetailModalProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [testPlate, setTestPlate] = useState('');
  const [viewMode, setViewMode] = useState<'STREAM' | 'SNAPSHOT'>('STREAM');
  const [sourceMode, setSourceMode] = useState<'auto' | 'webcam' | 'rtsp'>('auto');
  const [streamKey, setStreamKey] = useState(Date.now());

  if (!isOpen || !camera) return null;

  const handleRunAnalytics = async () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    try {
      const q = testPlate ? `?plate_number=${encodeURIComponent(testPlate)}` : '';
      const res = await fetch(`http://localhost:8000/api/v1/cameras/${camera.id}/analyze${q}`, {
        method: 'POST'
      });
      const data = await res.json();
      setAnalysisResult(data);
      setViewMode('SNAPSHOT');
      if (onAlertTriggered) {
        onAlertTriggered();
      }
    } catch (err) {
      console.error('Failed to run AI analytics:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const streamSrc = `http://localhost:8000/api/v1/cameras/${camera.id}/live-feed?source=${sourceMode}&t=${streamKey}`;

  return (
    <div className="cmd-backdrop" onClick={onClose} style={{ zIndex: 1150 }}>
      <div className="cmd-modal" style={{ maxWidth: '750px' }} onClick={e => e.stopPropagation()}>
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
              width: '38px',
              height: '38px',
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
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-heading)' }}>
                {camera.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Node ID: CAM-{String(camera.id).padStart(3, '0')} · {camera.location_name}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Source Selector */}
            <select
              value={sourceMode}
              onChange={(e) => {
                setSourceMode(e.target.value as any);
                setStreamKey(Date.now());
              }}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                color: 'var(--text-main)',
                fontSize: '0.72rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <option value="auto">🚗 Sentinel Traffic Video</option>
              <option value="grid_hls">🌐 Sentinel Grid HLS (cctv.corp8.cloud)</option>
              <option value="grid_rtsp">⚡ Sentinel Grid RTSP (103.250.160.189)</option>
              <option value="webcam">📹 Live Webcam</option>
            </select>

            {/* View Mode Toggle */}
            <div style={{
              display: 'flex',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '2px'
            }}>
              <button
                onClick={() => setViewMode('STREAM')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '4px',
                  border: 'none',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: viewMode === 'STREAM' ? '#2563EB' : 'transparent',
                  color: viewMode === 'STREAM' ? '#FFF' : 'var(--text-muted)'
                }}
              >
                ● Live Video Stream
              </button>
              <button
                onClick={() => setViewMode('SNAPSHOT')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '4px',
                  border: 'none',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: viewMode === 'SNAPSHOT' ? '#2563EB' : 'transparent',
                  color: viewMode === 'SNAPSHOT' ? '#FFF' : 'var(--text-muted)'
                }}
              >
                📷 AI Snapshot Crop
              </button>
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
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Live Video Feed Frame */}
          <div style={{
            height: '300px',
            background: '#0B1120',
            borderRadius: 'var(--r-lg)',
            border: '1.5px solid var(--border)',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {viewMode === 'STREAM' ? (
              /* Live MJPEG Stream from Backend */
              <img
                key={camera.id}
                src={streamSrc}
                alt={camera.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0F172A', position: 'relative' }}>
                {analysisResult?.snapshot_url ? (
                  <img
                    src={`http://localhost:8000${analysisResult.snapshot_url}`}
                    alt="AI Detection Snapshot"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Click "Run Analytics" to capture a live frame & snapshot
                  </div>
                )}
                {analysisResult && (
                  <div style={{ position: 'absolute', bottom: '10px', left: '12px', background: 'rgba(0,0,0,0.8)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.72rem', color: '#67E8F9', fontFamily: 'monospace' }}>
                    🎯 ANPR CROPPED ROI · {analysisResult?.detection?.plate_number || 'Detected Vehicle'}
                  </div>
                )}
              </div>
            )}

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
              color: '#FFFFFF',
              pointerEvents: 'none'
            }}>
              <span style={{
                background: 'rgba(0,0,0,0.75)',
                padding: '3px 8px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: camera.is_active ? '#22C55E' : '#EF4444' }} />
                <span>{camera.is_active ? 'LIVE AI INFERENCE (HD)' : 'OFFLINE'}</span>
              </span>

              <span style={{ background: 'rgba(0,0,0,0.75)', padding: '3px 8px', borderRadius: '4px', fontFamily: 'monospace' }}>
                YOLOv8 + ByteTrack + EasyOCR · 1080p
              </span>
            </div>
          </div>

          {/* Real-time AI Analytics Action Box */}
          <div style={{
            padding: '1rem',
            background: 'rgba(15, 23, 42, 0.6)',
            borderRadius: 'var(--r-md)',
            border: '1.5px solid rgba(59, 130, 246, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#60A5FA', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Zap size={16} /> Execute Live AI ANPR & Watchlist Screening
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Captures frame, runs YOLOv8 vehicle detection + OCR, and cross-references police watchlist.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="text"
                  value={testPlate}
                  onChange={(e) => setTestPlate(e.target.value.toUpperCase())}
                  placeholder="Target Plate"
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    background: '#0F172A',
                    border: '1px solid var(--border)',
                    color: '#FFF',
                    fontSize: '0.8rem',
                    fontFamily: 'monospace',
                    width: '130px'
                  }}
                />
                <button
                  onClick={handleRunAnalytics}
                  disabled={isAnalyzing}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    background: isAnalyzing ? '#475569' : '#2563EB',
                    color: '#FFF',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: isAnalyzing ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  {isAnalyzing ? 'Processing AI...' : '⚡ Run Analytics'}
                </button>
              </div>
            </div>

            {/* Analysis Result Banner */}
            {analysisResult && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{
                  padding: '0.75rem',
                  borderRadius: '6px',
                  background: analysisResult.alert?.id ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                  border: `1px solid ${analysisResult.alert?.id ? '#EF4444' : '#22C55E'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.78rem'
                }}>
                  <div>
                    <span style={{ fontWeight: 800, color: analysisResult.alert?.id ? '#F87171' : '#4ADE80' }}>
                      {analysisResult.alert?.id ? '🚨 WATCHLIST MATCH DETECTED' : '✓ VEHICLE SCREENED (CLEAR)'}
                    </span>
                    <div style={{ color: '#E2E8F0', marginTop: '2px', fontFamily: 'monospace' }}>
                      Plate: <strong>{analysisResult.alert?.plate_number || testPlate}</strong> · Status: {analysisResult.message || 'Analyzed'}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>
                    Alert ID: #{analysisResult.alert?.id || 'N/A'}
                  </span>
                </div>

                {/* Extreme CCTV Enhancement Diagnostics */}
                {analysisResult.optical_enhancement && (
                  <div style={{
                    padding: '0.65rem 0.85rem',
                    borderRadius: '6px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid #334155',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38BDF8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        🛡️ EXTREME CCTV OPTICAL ENHANCEMENT ENGINE
                      </span>
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '3px',
                        background: analysisResult.optical_enhancement.lighting_condition === 'NORMAL' ? 'rgba(34,197,94,0.2)' : 'rgba(234,179,8,0.25)',
                        color: analysisResult.optical_enhancement.lighting_condition === 'NORMAL' ? '#4ADE80' : '#FACC15'
                      }}>
                        {analysisResult.optical_enhancement.lighting_condition}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                      <span style={{ fontSize: '0.68rem', padding: '2px 6px', borderRadius: '4px', background: '#1E293B', color: '#94A3B8' }}>
                        🌙 Gamma: <strong style={{ color: '#E2E8F0' }}>{analysisResult.optical_enhancement.gamma_correction}</strong>
                      </span>
                      <span style={{ fontSize: '0.68rem', padding: '2px 6px', borderRadius: '4px', background: '#1E293B', color: '#94A3B8' }}>
                        ☀️ Anti-Glare: <strong style={{ color: '#E2E8F0' }}>{analysisResult.optical_enhancement.anti_glare_filter}</strong>
                      </span>
                      <span style={{ fontSize: '0.68rem', padding: '2px 6px', borderRadius: '4px', background: '#1E293B', color: '#94A3B8' }}>
                        📐 Deskew: <strong style={{ color: '#E2E8F0' }}>{analysisResult.optical_enhancement.perspective_deskew}</strong>
                      </span>
                      <span style={{ fontSize: '0.68rem', padding: '2px 6px', borderRadius: '4px', background: '#1E293B', color: '#94A3B8' }}>
                        🔍 Super-Res: <strong style={{ color: '#E2E8F0' }}>{analysisResult.optical_enhancement.super_resolution}</strong>
                      </span>
                      <span style={{ fontSize: '0.68rem', padding: '2px 6px', borderRadius: '4px', background: '#1E293B', color: '#94A3B8' }}>
                        🇮🇳 RTO Validation: <strong style={{ color: '#4ADE80' }}>{analysisResult.optical_enhancement.rto_phonetic_grammar}</strong>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Diagnostic Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            <div style={{ padding: '0.75rem', background: 'var(--bg-subtle)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
              <div className="caption-label">Stream Protocol</div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-heading)', marginTop: '2px' }}>
                {camera.protocol} (TCP Mode)
              </div>
            </div>

            <div style={{ padding: '0.75rem', background: 'var(--bg-subtle)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
              <div className="caption-label">Hardware Vendor</div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-heading)', marginTop: '2px' }}>
                {camera.vendor || 'Gujarat Police CCTV'}
              </div>
            </div>

            <div style={{ padding: '0.75rem', background: 'var(--bg-subtle)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
              <div className="caption-label">AI Processing FPS</div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--success)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                29.8 fps · Real-Time
              </div>
            </div>
          </div>

          {/* Location & Ingestion URI */}
          <div style={{ padding: '0.85rem 1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
            <div className="caption-label" style={{ marginBottom: '0.25rem' }}>Stream Ingestion URI</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>
              🔗 <strong>RTSP:</strong> {camera.stream_url || `rtsp://cctv.corp8.cloud:8554/stream/${camera.id}`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
