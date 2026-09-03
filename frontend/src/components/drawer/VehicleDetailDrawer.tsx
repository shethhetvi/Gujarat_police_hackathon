'use client';

import React from 'react';
import {
  X,
  Shield,
  Navigation,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Camera as CameraIcon,
  Clock,
  MapPin,
  ExternalLink,
  ZoomIn,
  Activity
} from 'lucide-react';
import { Alert, DetectionEvent, Camera, WatchlistEntry } from '../../types';

interface VehicleDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alert?: Alert | null;
  detection?: DetectionEvent | null;
  camera?: Camera | null;
  watchlistEntry?: WatchlistEntry | null;
  onTraceRoute: (plate: string) => void;
  onGenerateDossier: (plate: string) => void;
  onAcknowledgeAlert?: (alertId: number) => void;
}

export default function VehicleDetailDrawer({
  isOpen,
  onClose,
  alert,
  detection,
  camera,
  watchlistEntry,
  onTraceRoute,
  onGenerateDossier,
  onAcknowledgeAlert
}: VehicleDetailDrawerProps) {
  if (!isOpen) return null;

  const plateNumber = alert?.plate_number || detection?.plate_number || watchlistEntry?.plate_number || 'UNKNOWN';
  const severity = alert?.severity || watchlistEntry?.priority || (detection?.matched ? 'HIGH' : 'LOW');
  const category = alert?.category || watchlistEntry?.category || (detection?.matched ? 'suspect' : 'normal');
  const locationName = alert?.location_name || camera?.location_name || 'Gujarat CCTV Node';
  const timestamp = alert?.timestamp || detection?.timestamp || new Date().toISOString();
  const confidence = detection?.confidence ? (detection.confidence * 100).toFixed(1) : '97.8';
  const snapshotUrl = alert?.snapshot_url || detection?.snapshot_url;

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div className="drawer-panel" onClick={e => e.stopPropagation()}>
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
              background: alert ? 'var(--danger-light)' : 'var(--primary-light)',
              color: alert ? 'var(--danger)' : 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {alert ? <AlertTriangle size={20} /> : <Shield size={20} />}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-heading)' }}>
                Vehicle Evidence File
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Case Artifact #{alert?.id ? `ALT-${alert.id}` : detection?.id ? `DET-${detection.id}` : 'REF-4821'}
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

        {/* Content Body */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Plate & Severity Banner */}
          <div style={{
            padding: '1rem 1.25rem',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div className="caption-label" style={{ marginBottom: '0.25rem' }}>License Plate Number</div>
              <span className="license-plate-badge" style={{ fontSize: '1.15rem' }}>
                {plateNumber}
              </span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="caption-label" style={{ marginBottom: '0.25rem' }}>Status / Priority</div>
              <span className={`police-chip police-chip-${severity.toLowerCase()}`}>
                {severity} · {category.toUpperCase()}
              </span>
            </div>
          </div>

          {/* AI Snapshot Evidence Frame */}
          <div>
            <div className="caption-label" style={{ marginBottom: '0.4rem' }}>
              ANPR Photographic Crop (CCTV Capture)
            </div>
            <div style={{
              height: '220px',
              background: '#0B1120',
              borderRadius: 'var(--r-lg)',
              border: '1px solid var(--border)',
              overflow: 'hidden',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {snapshotUrl ? (
                <img
                  src={snapshotUrl.startsWith('http') ? snapshotUrl : `http://localhost:8000${snapshotUrl}`}
                  alt={`Plate crop ${plateNumber}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    // Fallback to stylized forensic graphic
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : null}

              {/* Forensic HUD Overlay */}
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '0.75rem',
                pointerEvents: 'none',
                background: 'radial-gradient(ellipse at center, rgba(15,76,129,0.1) 0%, rgba(0,0,0,0.6) 100%)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '0.65rem',
                    fontFamily: 'var(--font-mono)',
                    color: '#38BDF8',
                    background: 'rgba(11, 17, 32, 0.75)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    border: '1px solid rgba(56, 189, 248, 0.3)'
                  }}>
                    YOLOv8 + ByteTrack v2
                  </span>
                  <span style={{
                    fontSize: '0.65rem',
                    fontFamily: 'var(--font-mono)',
                    color: '#22C55E',
                    background: 'rgba(11, 17, 32, 0.75)',
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}>
                    OCR: {confidence}%
                  </span>
                </div>

                {/* Center target brackets */}
                <div style={{
                  alignSelf: 'center',
                  width: '180px',
                  height: '70px',
                  border: '1.5px dashed rgba(34, 197, 94, 0.8)',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(34, 197, 94, 0.05)'
                }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 800,
                    fontSize: '1rem',
                    color: '#F8FAFC',
                    textShadow: '0 2px 4px rgba(0,0,0,0.8)'
                  }}>
                    {plateNumber}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: '#94A3B8' }}>
                    {camera?.name || 'Ahmedabad S.G. Highway'}
                  </span>
                  <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: '#F87171' }} suppressHydrationWarning>
                    {new Date(timestamp).toLocaleTimeString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Metadata Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div style={{
              padding: '0.75rem 1rem',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-md)'
            }}>
              <div className="caption-label">Location Node</div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-heading)', marginTop: '2px' }}>
                {locationName}
              </div>
            </div>

            <div style={{
              padding: '0.75rem 1rem',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-md)'
            }}>
              <div className="caption-label">Capture Timestamp</div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-heading)', marginTop: '2px' }}>
                {new Date(timestamp).toLocaleString('en-IN')}
              </div>
            </div>

            <div style={{
              padding: '0.75rem 1rem',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-md)'
            }}>
              <div className="caption-label">Vehicle Classification</div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-heading)', marginTop: '2px' }}>
                {watchlistEntry?.vehicle_make_model || 'White SUV / Sedan'}
              </div>
            </div>

            <div style={{
              padding: '0.75rem 1rem',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-md)'
            }}>
              <div className="caption-label">ANPR Confidence</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '2px' }}>
                <div style={{ flex: 1, height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${confidence}%`,
                    height: '100%',
                    background: parseFloat(confidence) > 90 ? 'var(--success)' : 'var(--warning)',
                    borderRadius: '3px'
                  }} />
                </div>
                <span style={{ fontWeight: 700, fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}>
                  {confidence}%
                </span>
              </div>
            </div>
          </div>

          {/* FIR & Case Notes (if available) */}
          {watchlistEntry?.description && (
            <div style={{
              padding: '0.85rem 1rem',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-md)'
            }}>
              <div className="caption-label" style={{ marginBottom: '0.25rem' }}>FIR Reference & Investigation Notes</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
                {watchlistEntry.description}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.5rem' }}>
            <button
              onClick={() => {
                onTraceRoute(plateNumber);
                onClose();
              }}
              className="gov-btn gov-btn-primary"
              style={{ width: '100%' }}
            >
              <Navigation size={16} />
              <span>Trace Trajectory on GIS Map</span>
            </button>

            <button
              onClick={() => {
                onGenerateDossier(plateNumber);
                onClose();
              }}
              className="gov-btn gov-btn-outline"
              style={{ width: '100%' }}
            >
              <FileText size={16} />
              <span>Generate Official Evidence Dossier (PDF)</span>
            </button>

            {alert && !alert.acknowledged && onAcknowledgeAlert && (
              <button
                onClick={() => {
                  onAcknowledgeAlert(alert.id);
                  onClose();
                }}
                className="gov-btn gov-btn-danger"
                style={{ width: '100%' }}
              >
                <CheckCircle2 size={16} />
                <span>Acknowledge & Dispatch Control Unit</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
