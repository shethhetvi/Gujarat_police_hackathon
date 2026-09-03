'use client';

import React, { useState, useEffect } from 'react';
import {
  Grid,
  Play,
  Pause,
  RotateCcw,
  Camera as CameraIcon,
  Clock,
  Maximize2,
  Video,
  Shield,
  Sliders,
  Calendar
} from 'lucide-react';
import { Camera } from '../../types';

interface MultiCameraSyncProps {
  cameras: Camera[];
}

export default function MultiCameraSync({ cameras }: MultiCameraSyncProps) {
  // Select 4 initial cameras
  const [selectedCamIds, setSelectedCamIds] = useState<number[]>([
    cameras[0]?.id || 1,
    cameras[1]?.id || 2,
    cameras[2]?.id || 3,
    cameras[3]?.id || 4
  ]);

  const [isPlaying, setIsPlaying] = useState(true);
  const [frameOffset, setFrameOffset] = useState(1420);
  const [simTime, setSimTime] = useState(new Date());

  // Synchronized playback tick
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setFrameOffset(f => f + 1);
      setSimTime(t => new Date(t.getTime() + 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const handleSelectCam = (quadrantIndex: number, camId: number) => {
    setSelectedCamIds(prev => {
      const next = [...prev];
      next[quadrantIndex] = camId;
      return next;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Header & Synchronized Master Control Strip */}
      <div className="gov-card" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Grid size={18} style={{ color: 'var(--primary)' }} />
              <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-heading)' }}>
                Multi-Camera Incident Forensics (4-Quadrant Synchronized Playback)
              </span>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Cross-junction synchronized video timeline for suspect vehicle cross-referencing and trajectory verification
            </div>
          </div>

          {/* Synchronized Master Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.75rem',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-md)',
              fontSize: '0.78rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700
            }}>
              <Clock size={14} style={{ color: 'var(--primary)' }} />
              <span>{simTime.toLocaleTimeString('en-IN')} IST</span>
            </div>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="gov-btn gov-btn-primary gov-btn-sm"
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              <span>{isPlaying ? 'Pause Synchronized' : 'Resume Playback'}</span>
            </button>

            <button
              onClick={() => setFrameOffset(1000)}
              className="gov-btn gov-btn-outline gov-btn-sm"
              title="Reset timeline"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        {/* Master Timeline Scrubber */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            FRAME #{frameOffset}
          </span>
          <input
            type="range"
            min={1000}
            max={3000}
            value={frameOffset}
            onChange={e => setFrameOffset(parseInt(e.target.value))}
            style={{ flex: 1, cursor: 'pointer' }}
          />
          <span style={{ fontSize: '0.72rem', color: 'var(--success)', fontWeight: 700 }}>
            ● ALL 4 CHANNELS SYNCED
          </span>
        </div>
      </div>

      {/* 4-Quadrant CCTV Viewport Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        {[0, 1, 2, 3].map(quadIdx => {
          const camId = selectedCamIds[quadIdx];
          const cam = cameras.find(c => c.id === camId) || cameras[quadIdx % (cameras.length || 1)];

          return (
            <div key={quadIdx} className="gov-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {/* Channel Header Bar */}
              <div style={{
                padding: '0.65rem 0.85rem',
                borderBottom: '1px solid var(--border)',
                background: 'var(--bg-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    padding: '1px 5px',
                    borderRadius: '4px',
                    background: 'var(--primary)',
                    color: '#FFFFFF'
                  }}>
                    CH {quadIdx + 1}
                  </span>
                  <span style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--text-heading)' }}>
                    {cam?.name || `Camera Node #${quadIdx + 1}`}
                  </span>
                </div>

                {/* Camera Selector Dropdown */}
                <select
                  value={cam?.id || ''}
                  onChange={e => handleSelectCam(quadIdx, parseInt(e.target.value))}
                  className="gov-select"
                  style={{ width: 'auto', padding: '0.2rem 0.5rem', fontSize: '0.75rem', height: '28px' }}
                >
                  {cameras.map(c => (
                    <option key={c.id} value={c.id}>
                      #{c.id} {c.name} ({c.location_name})
                    </option>
                  ))}
                </select>
              </div>

              {/* Viewport Box */}
              <div style={{
                height: '240px',
                background: '#070C16',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                {/* Scanline CRT simulation */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.2) 2px, rgba(0,0,0,0.2) 4px)',
                  pointerEvents: 'none',
                  zIndex: 2
                }} />

                {/* Camera Top HUD */}
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  left: '10px',
                  right: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  zIndex: 5
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: 'rgba(0,0,0,0.7)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '0.65rem',
                    color: '#FFFFFF',
                    fontWeight: 700
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#EF4444', animation: 'beaconPulse 1.2s infinite' }} />
                    <span>REC LIVE</span>
                  </div>

                  <span style={{
                    background: 'rgba(0,0,0,0.7)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '0.65rem',
                    color: '#94A3B8',
                    fontFamily: 'monospace'
                  }}>
                    {cam?.protocol || 'RTSP'} · 1080p
                  </span>
                </div>

                {/* Simulated Vehicle ANPR Box */}
                <div style={{
                  width: '150px',
                  height: '75px',
                  border: '1.5px dashed rgba(34, 197, 94, 0.8)',
                  borderRadius: '3px',
                  background: 'rgba(34, 197, 94, 0.06)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '2px 4px',
                  zIndex: 4
                }}>
                  <span style={{
                    fontSize: '0.55rem',
                    fontFamily: 'monospace',
                    color: '#22C55E',
                    fontWeight: 800
                  }}>
                    YOLOv8 DETECT (CAR)
                  </span>
                  <div style={{
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                    fontWeight: 900,
                    color: '#FFFFFF',
                    textAlign: 'center'
                  }}>
                    GJ01AB1234
                  </div>
                  <span style={{
                    fontSize: '0.55rem',
                    fontFamily: 'monospace',
                    color: '#38BDF8',
                    textAlign: 'right'
                  }}>
                    TRK#{100 + quadIdx * 12}
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
                  alignItems: 'center',
                  zIndex: 5,
                  fontSize: '0.65rem',
                  fontFamily: 'monospace'
                }}>
                  <span style={{ color: '#94A3B8' }}>📍 {cam?.location_name || 'Gujarat CCTV Node'}</span>
                  <span style={{ color: '#38BDF8', fontWeight: 700 }}>
                    {simTime.toLocaleTimeString('en-IN')} IST
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
