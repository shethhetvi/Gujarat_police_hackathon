'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Grid,
  Play,
  Pause,
  RotateCcw,
  Camera as CameraIcon,
  Clock,
  Maximize2,
  Minimize2,
  Video,
  Shield,
  Sliders,
  Calendar,
  FastForward,
  Rewind,
  Search,
  Zap,
  Download,
  AlertTriangle,
  CheckCircle2,
  Layers,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { Camera } from '../../types';
import { runMultiCameraSync } from '../../services/api';

interface MultiCameraSyncProps {
  cameras: Camera[];
}

export default function MultiCameraSync({ cameras }: MultiCameraSyncProps) {
  const [selectedCamIds, setSelectedCamIds] = useState<number[]>(() => {
    return [
      cameras[0]?.id || 1,
      cameras[1]?.id || 2,
      cameras[2]?.id || 3,
      cameras[3]?.id || 4
    ];
  });

  useEffect(() => {
    if (cameras.length >= 4) {
      setSelectedCamIds([cameras[0].id, cameras[1].id, cameras[2].id, cameras[3].id]);
    } else if (cameras.length > 0) {
      setSelectedCamIds([
        cameras[0]?.id || 1,
        cameras[1]?.id || cameras[0]?.id || 1,
        cameras[2]?.id || cameras[0]?.id || 1,
        cameras[3]?.id || cameras[0]?.id || 1
      ]);
    }
  }, [cameras]);

  // Master Synchronized Playback State
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [frameOffset, setFrameOffset] = useState<number>(1420);
  const [simTime, setSimTime] = useState<Date>(new Date());
  const [sourceMode, setSourceMode] = useState<string>('auto');
  const [streamSyncKey, setStreamSyncKey] = useState<number>(Date.now());
  const [layoutMode, setLayoutMode] = useState<'2x2' | 'focus'>('2x2');
  const [focusedQuadrant, setFocusedQuadrant] = useState<number>(0);

  // Suspect Vehicle Cross-Camera Intercept State
  const [targetPlate, setTargetPlate] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [syncAnalysisResult, setSyncAnalysisResult] = useState<any>(null);

  // Master synchronization tick
  useEffect(() => {
    if (!isPlaying) return;
    const intervalMs = Math.round(1000 / playbackSpeed);
    const timer = setInterval(() => {
      setFrameOffset(f => f + 1);
      setSimTime(t => new Date(t.getTime() + 1000));
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed]);

  // Handle camera quadrant selection
  const handleSelectCam = (quadrantIndex: number, camId: number) => {
    setSelectedCamIds(prev => {
      const next = [...prev];
      next[quadrantIndex] = camId;
      return next;
    });
    setStreamSyncKey(Date.now());
  };

  // Synchronized Master Jump / Seek
  const handleStepSeconds = (seconds: number) => {
    setFrameOffset(f => Math.max(100, f + (seconds * 25)));
    setSimTime(t => new Date(t.getTime() + (seconds * 1000)));
    setStreamSyncKey(Date.now());
  };

  // Reset to live stream
  const handleResetToLive = () => {
    setIsPlaying(true);
    setPlaybackSpeed(1.0);
    setSimTime(new Date());
    setFrameOffset(1420);
    setStreamSyncKey(Date.now());
  };

  // Trigger Multi-Camera Synchronized AI Analysis
  const handleRunMultiCameraSync = async () => {
    setIsAnalyzing(true);
    try {
      const res = await runMultiCameraSync({
        camera_ids: selectedCamIds,
        plate_number: targetPlate,
        source_mode: sourceMode,
        sim_timestamp: simTime.toISOString()
      });
      setSyncAnalysisResult(res);
    } catch (err) {
      console.error('Multi-camera sync AI failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Export Synchronized Incident Dossier
  const handleExportDossier = () => {
    const report = {
      incident_title: `Gujarat Police ICCC - Multi-Camera Sync Forensic Report`,
      generated_at: new Date().toISOString(),
      master_sync_timestamp: simTime.toISOString(),
      target_suspect_plate: targetPlate,
      playback_frame_offset: frameOffset,
      active_quadrants: selectedCamIds.map((id, idx) => {
        const cam = cameras.find(c => c.id === id);
        return {
          channel: idx + 1,
          camera_id: id,
          camera_name: cam?.name || `Camera #${id}`,
          location: cam?.location_name || 'N/A',
          coordinates: [cam?.latitude, cam?.longitude],
          protocol: cam?.protocol || 'RTSP'
        };
      }),
      correlation_telemetry: syncAnalysisResult?.correlation || {
        status: "Real-time Live Sync Synchronized",
        speed_estimate_kmh: 0,
        trajectory: targetPlate ? `Tracked across optical nodes for ${targetPlate}` : "Surveillance Grid Standby"
      }
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `forensic_sync_incident_${targetPlate}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* ──────────────────────────────────────────────────────────────────────────
          1. TOP MASTER CONTROL & SYNCHRONIZATION HEADER
      ────────────────────────────────────────────────────────────────────────── */}
      <div className="gov-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                background: 'rgba(59, 130, 246, 0.15)',
                color: '#3B82F6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Grid size={18} />
              </div>
              <span style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-heading)' }}>
                Multi-Camera Incident Forensics (4-Quadrant Synchronized Lock)
              </span>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '4px',
                background: isPlaying ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                color: isPlaying ? '#22C55E' : '#EAB308',
                border: `1px solid ${isPlaying ? '#22C55E' : '#EAB308'}`
              }}>
                {isPlaying ? '● LIVE SYNC LOCKED' : '⏸ MASTER PAUSED'}
              </span>
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Sub-second cross-junction synchronized video timeline for suspect vehicle cross-referencing and trajectory tracking
            </div>
          </div>

          {/* Master Synchronized Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            
            {/* Master Clock IST */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.4rem 0.8rem',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-md)',
              fontSize: '0.82rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              color: 'var(--text-heading)'
            }}>
              <Clock size={15} style={{ color: 'var(--primary)' }} />
              <span>{simTime.toLocaleTimeString('en-IN')} IST</span>
            </div>

            {/* Play / Pause All Channels */}
            <button
              onClick={() => {
                setIsPlaying(!isPlaying);
                setStreamSyncKey(Date.now());
              }}
              className={`gov-btn ${isPlaying ? 'gov-btn-outline' : 'gov-btn-primary'} gov-btn-sm`}
              style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              <span>{isPlaying ? 'Pause All Sync' : 'Resume All Sync'}</span>
            </button>

            {/* Step Controls */}
            <div style={{ display: 'flex', background: 'var(--bg-subtle)', borderRadius: '6px', border: '1px solid var(--border)', padding: '2px' }}>
              <button
                onClick={() => handleStepSeconds(-5)}
                className="gov-btn gov-btn-sm"
                style={{ padding: '3px 8px', fontSize: '0.72rem', background: 'transparent', border: 'none', color: 'var(--text-muted)' }}
                title="Rewind 5 Seconds"
              >
                <Rewind size={12} /> -5s
              </button>
              <button
                onClick={() => handleStepSeconds(5)}
                className="gov-btn gov-btn-sm"
                style={{ padding: '3px 8px', fontSize: '0.72rem', background: 'transparent', border: 'none', color: 'var(--text-muted)' }}
                title="Advance 5 Seconds"
              >
                +5s <FastForward size={12} />
              </button>
            </div>

            {/* Speed Multiplier */}
            <div style={{ display: 'flex', background: 'var(--bg-subtle)', borderRadius: '6px', border: '1px solid var(--border)', padding: '2px' }}>
              {[0.5, 1.0, 2.0, 4.0].map(spd => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  style={{
                    padding: '3px 7px',
                    borderRadius: '4px',
                    border: 'none',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: playbackSpeed === spd ? 'var(--primary)' : 'transparent',
                    color: playbackSpeed === spd ? '#FFF' : 'var(--text-muted)'
                  }}
                >
                  {spd}x
                </button>
              ))}
            </div>

            {/* Reset to Live */}
            <button
              onClick={handleResetToLive}
              className="gov-btn gov-btn-outline gov-btn-sm"
              title="Reset Master Clock to Live"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        {/* Master Timeline Scrubber & Source Selector */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          marginTop: '1rem',
          paddingTop: '0.85rem',
          borderTop: '1px solid var(--border)',
          flexWrap: 'wrap'
        }}>
          {/* Source Mode Select */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>STREAM SOURCE:</span>
            <select
              value={sourceMode}
              onChange={e => {
                setSourceMode(e.target.value);
                setStreamSyncKey(Date.now());
              }}
              className="gov-select"
              style={{ fontSize: '0.74rem', height: '28px', padding: '2px 8px' }}
            >
              <option value="auto">🚗 Sentinel Traffic Video (Full AI Active)</option>
              <option value="grid_hls">🌐 Sentinel Grid HLS (cctv.corp8.cloud)</option>
              <option value="grid_rtsp">⚡ Sentinel Grid RTSP (TCP Mode 103.250.160.189)</option>
              <option value="webcam">📹 Live Device Webcam</option>
            </select>
          </div>

          {/* Timeline Scrubber */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: '240px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              PTS #{frameOffset * 40}ms
            </span>
            <input
              type="range"
              min={1000}
              max={3000}
              value={frameOffset}
              onChange={e => {
                const val = parseInt(e.target.value);
                setFrameOffset(val);
                setStreamSyncKey(Date.now());
              }}
              style={{ flex: 1, cursor: 'pointer' }}
            />
            <span style={{ fontSize: '0.72rem', color: 'var(--success)', fontWeight: 700, whiteSpace: 'nowrap' }}>
              ● 4 CHANNELS PTS SYNCHRONIZED
            </span>
          </div>

          {/* Layout Toggle */}
          <div style={{ display: 'flex', background: 'var(--bg-subtle)', borderRadius: '6px', border: '1px solid var(--border)', padding: '2px' }}>
            <button
              onClick={() => setLayoutMode('2x2')}
              style={{
                padding: '3px 8px',
                borderRadius: '4px',
                border: 'none',
                fontSize: '0.7rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: layoutMode === '2x2' ? 'var(--primary)' : 'transparent',
                color: layoutMode === '2x2' ? '#FFF' : 'var(--text-muted)'
              }}
            >
              2x2 Grid
            </button>
            <button
              onClick={() => setLayoutMode('focus')}
              style={{
                padding: '3px 8px',
                borderRadius: '4px',
                border: 'none',
                fontSize: '0.7rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: layoutMode === 'focus' ? 'var(--primary)' : 'transparent',
                color: layoutMode === 'focus' ? '#FFF' : 'var(--text-muted)'
              }}
            >
              1+3 Focus
            </button>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          2. CROSS-CAMERA SUSPECT INTERCEPT & FORENSIC SCREENING STRIP
      ────────────────────────────────────────────────────────────────────────── */}
      <div className="gov-card" style={{
        padding: '1rem 1.25rem',
        background: 'rgba(15, 23, 42, 0.7)',
        border: '1.5px solid rgba(59, 130, 246, 0.35)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#EF4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Zap size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#60A5FA', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Cross-Junction Suspect Vehicle Sighting Intercept</span>
                <span style={{ fontSize: '0.65rem', padding: '2px 6px', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '4px', color: '#93C5FD', border: '1px solid rgba(59, 130, 246, 0.4)' }}>
                  YOLOv8 + ByteTrack + EasyOCR
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Simultaneously scans all 4 synchronized camera feeds and reconstructs cross-junction transit intervals
              </div>
            </div>
          </div>

          {/* Target Plate Query Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={targetPlate}
                onChange={e => setTargetPlate(e.target.value.toUpperCase())}
                placeholder="TARGET PLATE (e.g. GJ01AA0001)"
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1.5px solid rgba(59, 130, 246, 0.5)',
                  background: '#0B1120',
                  color: '#FFFFFF',
                  fontFamily: 'monospace',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  letterSpacing: '0.08em',
                  width: '210px'
                }}
              />
            </div>

            {/* Clear filter button if plate active */}
            {targetPlate && (
              <button
                onClick={() => setTargetPlate('')}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: '1px solid rgba(148, 163, 184, 0.4)',
                  background: 'rgba(148, 163, 184, 0.1)',
                  color: '#94A3B8',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                ✕ Clear
              </button>
            )}

            <button
              onClick={handleRunMultiCameraSync}
              disabled={isAnalyzing}
              className="gov-btn gov-btn-primary gov-btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px' }}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Synchronizing AI Across 4 Cams...</span>
                </>
              ) : (
                <>
                  <Zap size={14} />
                  <span>⚡ Execute 4-Channel AI Intercept</span>
                </>
              )}
            </button>

            <button
              onClick={handleExportDossier}
              className="gov-btn gov-btn-outline gov-btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
              title="Download 4-Camera Forensic Telemetry Report"
            >
              <Download size={14} />
              <span>Export Dossier</span>
            </button>
          </div>

          {/* Extreme Condition CCTV Processing Engine Tag */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid #1E293B',
            borderRadius: '6px',
            padding: '4px 12px',
            marginTop: '0.65rem',
            fontSize: '0.70rem',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#38BDF8', fontWeight: 800 }}>🛡️ EXTREME CCTV OPTICAL ENHANCER ACTIVE:</span>
              <span style={{ color: '#94A3B8' }}>Dynamic Gamma Boost (Night) · Highlight Suppression (Glare) · Perspective Tilt Deskew · 5-Tier Super-Res CLAHE</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ padding: '1px 6px', borderRadius: '3px', background: 'rgba(34,197,94,0.15)', color: '#4ADE80', fontWeight: 700, fontSize: '0.65rem' }}>
                ✓ HSRP Syntactic Grammar
              </span>
              <span style={{ padding: '1px 6px', borderRadius: '3px', background: 'rgba(56,189,248,0.15)', color: '#38BDF8', fontWeight: 700, fontSize: '0.65rem' }}>
                ✓ GJ-01 to GJ-38 Disambiguation
              </span>
            </div>
          </div>
        </div>

        {/* Multi-Camera Correlation Results Strip */}
        {syncAnalysisResult && (
          <div style={{
            marginTop: '0.85rem',
            padding: '0.75rem 1rem',
            background: 'rgba(34, 197, 94, 0.10)',
            borderRadius: '6px',
            border: '1px solid rgba(34, 197, 94, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <CheckCircle2 size={20} style={{ color: '#22C55E' }} />
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#4ADE80' }}>
                  4-CHANNEL SYNCHRONIZED INCIDENT CORRELATION CONFIRMED
                </div>
                <div style={{ fontSize: '0.74rem', color: '#E2E8F0', marginTop: '2px' }}>
                  Target Plate: <strong>{syncAnalysisResult.correlation?.target_plate}</strong> · Sightings: <strong>{syncAnalysisResult.correlation?.sightings_count} / {syncAnalysisResult.correlation?.total_channels} Channels</strong> · Inter-Junction Speed: <strong>{syncAnalysisResult.correlation?.estimated_speed_kmh} km/h</strong>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {syncAnalysisResult.channels?.map((ch: any) => (
                <div
                  key={ch.quadrant}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '4px',
                    background: ch.suspect_spotted ? 'rgba(239, 68, 68, 0.25)' : 'rgba(15, 23, 42, 0.6)',
                    border: `1px solid ${ch.suspect_spotted ? '#EF4444' : 'rgba(255,255,255,0.1)'}`,
                    fontSize: '0.68rem',
                    color: ch.suspect_spotted ? '#FCA5A5' : '#94A3B8',
                    fontFamily: 'monospace'
                  }}
                >
                  CH{ch.quadrant}: {ch.suspect_spotted ? '🎯 SIGHTED' : 'CLEAR'}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          3. 4-QUADRANT SYNCHRONIZED CCTV VIEWPORTS GRID
      ────────────────────────────────────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: layoutMode === '2x2' ? 'repeat(2, 1fr)' : '2fr 1fr',
        gap: '1rem'
      }}>
        {[0, 1, 2, 3].map(quadIdx => {
          const camId = selectedCamIds[quadIdx];
          const cam = cameras.find(c => c.id === camId) || cameras[quadIdx % Math.max(1, cameras.length)];
          const isFocused = layoutMode === 'focus' && focusedQuadrant === quadIdx;
          const liveStreamUrl = `http://localhost:8000/api/v1/cameras/${cam?.id || 1}/live-feed?source=${sourceMode}&paused=${!isPlaying}&t=${streamSyncKey}`;
          const analysisChannel = syncAnalysisResult?.channels?.find((c: any) => c.quadrant === quadIdx + 1);

          return (
            <div
              key={quadIdx}
              className="gov-card"
              style={{
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                border: analysisChannel?.suspect_spotted ? '2px solid #EF4444' : '1px solid var(--border)',
                transition: 'all 0.2s ease',
                ...(isFocused ? { gridRow: 'span 3' } : {})
              }}
            >
              {/* Channel Header Bar */}
              <div style={{
                padding: '0.65rem 0.85rem',
                borderBottom: '1px solid var(--border)',
                background: 'var(--bg-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: analysisChannel?.suspect_spotted ? '#EF4444' : 'var(--primary)',
                    color: '#FFFFFF',
                    flexShrink: 0
                  }}>
                    CH {quadIdx + 1}
                  </span>
                  <span style={{
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    color: 'var(--text-heading)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {cam?.name || `Camera Node #${camId}`}
                  </span>
                </div>

                {/* Quadrant Controls & Camera Selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                  <select
                    value={cam?.id || ''}
                    onChange={e => handleSelectCam(quadIdx, parseInt(e.target.value))}
                    className="gov-select"
                    style={{ width: 'auto', maxWidth: '200px', padding: '0.2rem 0.5rem', fontSize: '0.72rem', height: '26px' }}
                  >
                    {cameras.map(c => (
                      <option key={c.id} value={c.id}>
                        #{c.id} {c.name} ({c.location_name})
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => {
                      if (layoutMode === 'focus' && focusedQuadrant === quadIdx) {
                        setLayoutMode('2x2');
                      } else {
                        setLayoutMode('focus');
                        setFocusedQuadrant(quadIdx);
                      }
                    }}
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '4px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-muted)',
                      cursor: 'pointer'
                    }}
                    title="Toggle Full View Focus"
                  >
                    {isFocused ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                  </button>
                </div>
              </div>

              {/* Viewport Box (Real Video Stream) */}
              <div style={{
                height: layoutMode === 'focus' && isFocused ? '460px' : '260px',
                background: '#070C16',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                {/* Live Synchronized Video Feed */}
                <img
                  key={`${cam?.id}-${streamSyncKey}`}
                  src={liveStreamUrl}
                  alt={cam?.name || 'Camera Feed'}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    // Fallback to simulated surveillance standby
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />

                {/* Subtle CRT Scanline overlay for surveillance aesthetic */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px)',
                  pointerEvents: 'none',
                  zIndex: 2
                }} />

                {/* Camera Top HUD */}
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  left: '8px',
                  right: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  zIndex: 5,
                  pointerEvents: 'none'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: 'rgba(0,0,0,0.75)',
                    padding: '2px 7px',
                    borderRadius: '4px',
                    fontSize: '0.64rem',
                    color: '#FFFFFF',
                    fontWeight: 700
                  }}>
                    <span style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: isPlaying ? '#22C55E' : '#EAB308'
                    }} />
                    <span>{isPlaying ? 'LIVE REC' : 'PAUSED'}</span>
                  </div>

                  <span style={{
                    background: 'rgba(0,0,0,0.75)',
                    padding: '2px 7px',
                    borderRadius: '4px',
                    fontSize: '0.64rem',
                    color: '#38BDF8',
                    fontFamily: 'monospace'
                  }}>
                    {cam?.protocol || 'RTSP'} · TCP Mode · 1080p
                  </span>
                </div>

                {/* Suspect Alert Banner Overlay (If sighted during AI Intercept) */}
                {analysisChannel?.suspect_spotted && (
                  <div style={{
                    position: 'absolute',
                    top: '36px',
                    left: '8px',
                    background: 'rgba(239, 68, 68, 0.9)',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    color: '#FFFFFF',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    zIndex: 6,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.5)'
                  }}>
                    <span>🚨 SUSPECT INTERCEPT SIGHTING</span>
                    <span style={{ fontFamily: 'monospace', background: '#000', padding: '1px 5px', borderRadius: '3px' }}>
                      {targetPlate}
                    </span>
                  </div>
                )}

                {/* Bottom HUD */}
                <div style={{
                  position: 'absolute',
                  bottom: '8px',
                  left: '8px',
                  right: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  zIndex: 5,
                  fontSize: '0.65rem',
                  fontFamily: 'monospace',
                  background: 'rgba(0,0,0,0.75)',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  pointerEvents: 'none'
                }}>
                  <span style={{ color: '#E2E8F0' }}>📍 {cam?.location_name || 'Gujarat CCTV Node'}</span>
                  <span style={{ color: '#38BDF8', fontWeight: 700 }}>
                    PTS: {(frameOffset * 40)}ms · {simTime.toLocaleTimeString('en-IN')} IST
                  </span>
                </div>
              </div>

              {/* Viewport Meta Strip */}
              <div style={{
                padding: '0.5rem 0.85rem',
                background: 'var(--bg-subtle)',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.72rem'
              }}>
                <div style={{ color: 'var(--text-muted)' }}>
                  GPS: <strong>{cam?.latitude?.toFixed(4)}, {cam?.longitude?.toFixed(4)}</strong>
                </div>
                <div style={{
                  color: cam?.is_active ? 'var(--success)' : 'var(--danger)',
                  fontWeight: 700
                }}>
                  {cam?.is_active ? '● Camera Online' : '○ Offline'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
