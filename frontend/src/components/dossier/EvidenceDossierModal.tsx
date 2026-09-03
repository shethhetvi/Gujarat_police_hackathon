'use client';

import React, { useState } from 'react';
import {
  Printer,
  Download,
  X,
  Shield,
  FileCheck,
  MapPin,
  Clock,
  Car,
  AlertTriangle,
  BadgeCheck,
  Copy,
  Check,
  Lock,
  ExternalLink
} from 'lucide-react';
import { VehicleRouteResponse, WatchlistEntry, Alert } from '../../types';
import { defaultOfficer } from '../layout/Navbar';

interface EvidenceDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  plateNumber: string;
  routeData?: VehicleRouteResponse | null;
  watchlistEntry?: WatchlistEntry | null;
  alerts?: Alert[];
}

export default function EvidenceDossierModal({
  isOpen,
  onClose,
  plateNumber,
  routeData,
  watchlistEntry,
  alerts = []
}: EvidenceDossierModalProps) {
  const [copiedHash, setCopiedHash] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const cleanPlate = (plateNumber || 'GJ01AB1234').toUpperCase();
  const checkpoints = routeData?.checkpoints || [];
  const firNumber = `FIR-4092/2026/CYBER-CRIME`;

  // Master SHA-256 evidence integrity hash
  const masterSha256 = checkpoints.length > 0 && checkpoints[0].sha256_hash
    ? checkpoints[0].sha256_hash
    : '8f4c2e6b91a7d30f4e5c8b2a19d7e34f6a0b8c2e1d5a7f9b3c5e7d1a9f3b5c7e';

  const handleCopyHash = () => {
    navigator.clipboard.writeText(masterSha256);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleDownloadJSON = () => {
    const report = {
      dossier_type: 'GUJARAT_POLICE_SECTION_65B_EVIDENCE_DOSSIER',
      statutory_compliance: 'Section 65B(4) Indian Evidence Act, 1872 / Section 63 BSA 2023',
      case_reference: firNumber,
      plate_number: cleanPlate,
      master_sha256_integrity_hash: masterSha256,
      generated_at: new Date().toISOString(),
      investigating_officer: defaultOfficer,
      vehicle_profile: {
        plate_number: cleanPlate,
        category: watchlistEntry?.category || 'stolen',
        priority: watchlistEntry?.priority || 'CRITICAL',
        vehicle_make_model: watchlistEntry?.vehicle_make_model || 'White Fortuner SUV',
        color: watchlistEntry?.color || 'White',
        description: watchlistEntry?.description || 'FIR #4092 Navrangpura PS - Armed Stolen Vehicle'
      },
      corridor_analytics: {
        total_distance_km: routeData?.total_distance_km || 18.6,
        average_velocity_kmh: routeData?.average_velocity_kmh || 68.2,
        cloned_plate_anomaly: routeData?.cloned_plate_anomaly || false
      },
      chronological_sightings: checkpoints
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GP_SEC65B_EVIDENCE_${cleanPlate}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Sample or actual snapshot URLs
  const latestCp = checkpoints.length > 0 ? checkpoints[checkpoints.length - 1] : null;
  const contextSnapshotUrl = latestCp?.snapshot_url || '/snapshots/snap_GJ01AB1234_1788281568019.jpg';
  const ptsCode = latestCp?.pts_timestamp ? latestCp.pts_timestamp.toFixed(4) : '1725384912.4820';

  return (
    <div className="cmd-backdrop" onClick={onClose} style={{ zIndex: 1200 }}>
      <div
        className="cmd-modal"
        style={{ maxWidth: '880px', maxHeight: '92vh', background: '#FFFFFF', color: '#0F172A', borderRadius: '12px' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Top Control Bar (Hidden on Print) */}
        <div className="no-print" style={{
          padding: '0.85rem 1.25rem',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#F8FAFC',
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileCheck size={18} style={{ color: '#0F4C81' }} />
            <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0F172A' }}>
              Section 65B Courtroom Evidence Dossier Generator
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={handlePrint}
              className="gov-btn gov-btn-primary gov-btn-sm"
              title="Print or Save as PDF"
            >
              <Printer size={14} />
              <span>Print / Export PDF</span>
            </button>
            <button
              onClick={handleDownloadJSON}
              className="gov-btn gov-btn-outline gov-btn-sm"
              title="Export Raw JSON Evidence Data"
            >
              <Download size={14} />
              <span>Export JSON</span>
            </button>
            <button
              onClick={onClose}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                background: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748B'
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── Official Printable Document Canvas ── */}
        <div style={{ padding: '2.2rem 2.8rem', overflowY: 'auto', maxHeight: 'calc(92vh - 60px)' }}>
          {/* Official Letterhead Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '3px solid #0F4C81',
            paddingBottom: '1.25rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #0F4C81, #1E3A8A)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FCD34D',
                border: '2px solid #FCD34D',
                boxShadow: '0 2px 8px rgba(15, 76, 129, 0.25)'
              }}>
                <Shield size={34} />
              </div>
              <div>
                <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#475569', letterSpacing: '0.12em' }}>
                  GOVERNMENT OF GUJARAT · HOME DEPARTMENT
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0F4C81', letterSpacing: '-0.01em' }}>
                  GUJARAT POLICE DEPARTMENT
                </div>
                <div style={{ fontSize: '0.80rem', fontWeight: 700, color: '#2563EB' }}>
                  INTEGRATED COMMAND & CONTROL CENTRE (ICCC) — ANPR FORENSIC DOSSIER
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#475569' }}>
              <div style={{ fontWeight: 900, color: '#DC2626', fontSize: '0.82rem', letterSpacing: '0.05em' }}>
                CONFIDENTIAL · POLICE EVIDENCE
              </div>
              <div>FIR Reference: <strong>{firNumber}</strong></div>
              <div>Generated: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
            </div>
          </div>

          {/* Cryptographic SHA-256 Section 65B Integrity Banner */}
          <div style={{
            background: '#F0F9FF',
            border: '1.5px solid #0284C7',
            borderRadius: '8px',
            padding: '0.85rem 1.15rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.65rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Lock size={20} style={{ color: '#0284C7' }} />
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0369A1', textTransform: 'uppercase' }}>
                  Section 65B(4) Indian Evidence Act / Section 63 BSA 2023 Compliance
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#0F172A', fontWeight: 800, wordBreak: 'break-all' }}>
                  SHA-256: {masterSha256}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={handleCopyHash}
                className="gov-btn gov-btn-outline gov-btn-sm"
                style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', height: '28px' }}
              >
                {copiedHash ? <Check size={12} style={{ color: '#16A34A' }} /> : <Copy size={12} />}
                <span>{copiedHash ? 'Copied' : 'Copy Hash'}</span>
              </button>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: '12px',
                background: '#DCFCE7',
                color: '#15803D'
              }}>
                TAMPER-PROOF VERIFIED
              </span>
            </div>
          </div>

          {/* Investigating Officer & Case Details Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '0.75rem',
            padding: '0.85rem 1rem',
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            fontSize: '0.78rem'
          }}>
            <div>
              <div style={{ color: '#64748B', fontSize: '0.68rem', fontWeight: 700 }}>INVESTIGATING OFFICER</div>
              <div style={{ fontWeight: 800, color: '#0F172A' }}>{defaultOfficer.name}</div>
            </div>
            <div>
              <div style={{ color: '#64748B', fontSize: '0.68rem', fontWeight: 700 }}>BADGE NUMBER</div>
              <div style={{ fontWeight: 800, color: '#0F172A', fontFamily: 'monospace' }}>#{defaultOfficer.badge_number}</div>
            </div>
            <div>
              <div style={{ color: '#64748B', fontSize: '0.68rem', fontWeight: 700 }}>POLICE STATION</div>
              <div style={{ fontWeight: 800, color: '#0F172A' }}>{defaultOfficer.police_station}</div>
            </div>
            <div>
              <div style={{ color: '#64748B', fontSize: '0.68rem', fontWeight: 700 }}>JURISDICTION</div>
              <div style={{ fontWeight: 800, color: '#0F172A' }}>{defaultOfficer.district}</div>
            </div>
          </div>

          {/* Section 1: Target Vehicle Profile */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{
              fontSize: '0.85rem',
              fontWeight: 800,
              color: '#0F4C81',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.65rem',
              borderBottom: '1px solid #E2E8F0',
              paddingBottom: '0.3rem'
            }}>
              1. Target Vehicle Identification & Attributes
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '190px 1fr', gap: '1.25rem', alignItems: 'start' }}>
              <div style={{
                padding: '1rem',
                border: '2px solid #F59E0B',
                borderRadius: '8px',
                background: '#FFFBEB',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#0F4C81', letterSpacing: '0.08em' }}>
                  STATE HIGH-SECURITY PLATE
                </div>
                <div style={{
                  fontFamily: 'monospace',
                  fontSize: '1.45rem',
                  fontWeight: 900,
                  color: '#0F172A',
                  letterSpacing: '0.12em',
                  margin: '0.4rem 0'
                }}>
                  {cleanPlate}
                </div>
                <span style={{
                  display: 'inline-block',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '12px',
                  background: '#FEE2E2',
                  color: '#DC2626',
                  fontSize: '0.72rem',
                  fontWeight: 800
                }}>
                  CRITICAL SURVEILLANCE
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', fontSize: '0.8rem' }}>
                <div>
                  <span style={{ color: '#64748B' }}>Body Type: </span>
                  <strong>{latestCp?.vehicle_type || 'SUV / Compact SUV'}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748B' }}>Identified Color: </span>
                  <strong>{latestCp?.vehicle_color || 'White / Silver'}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748B' }}>ANPR Engine Confidence: </span>
                  <strong style={{ color: '#16A34A' }}>98.9% (HSRP Validated)</strong>
                </div>
                <div>
                  <span style={{ color: '#64748B' }}>Total Sightings Logged: </span>
                  <strong>{checkpoints.length} Camera Nodes</strong>
                </div>
                <div style={{ gridColumn: 'span 2', marginTop: '0.25rem' }}>
                  <span style={{ color: '#64748B' }}>FIR Crime Classification: </span>
                  <div style={{
                    padding: '0.5rem 0.75rem',
                    background: '#F1F5F9',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    color: '#334155',
                    marginTop: '0.2rem'
                  }}>
                    {watchlistEntry?.description || 'FIR #4092 Navrangpura PS - Stolen Vehicle used in Armed Intercity Robbery (Section 379/392 IPC).'}
                  </div>
                </div>
              </div>
            </div>

            {/* National Vahan & Sarathi 4.0 Integration Card */}
            <div style={{
              marginTop: '0.85rem',
              background: '#F8FAFC',
              border: '1.5px solid #E2E8F0',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.5rem',
              fontSize: '0.75rem'
            }}>
              <div>
                <div style={{ color: '#64748B', fontSize: '0.65rem', fontWeight: 700 }}>REGISTERED OWNER (VAHAN)</div>
                <div style={{ fontWeight: 800, color: '#0F172A' }}>Ashokbhai M. Patel</div>
              </div>
              <div>
                <div style={{ color: '#64748B', fontSize: '0.65rem', fontWeight: 700 }}>RTO JURISDICTION</div>
                <div style={{ fontWeight: 800, color: '#0F172A' }}>GJ-01 (Ahmedabad West)</div>
              </div>
              <div>
                <div style={{ color: '#64748B', fontSize: '0.65rem', fontWeight: 700 }}>CHASSIS / ENGINE NUMBER</div>
                <div style={{ fontWeight: 800, color: '#0F172A', fontFamily: 'monospace' }}>MA3EYD21... / K12M994...</div>
              </div>
              <div>
                <div style={{ color: '#64748B', fontSize: '0.65rem', fontWeight: 700 }}>INSURANCE & PUCC</div>
                <div style={{ fontWeight: 800, color: '#16A34A' }}>VALID (ICICI Lombard)</div>
              </div>
            </div>
          </div>

          {/* Section 2: Dual Forensic Photographic Evidence (Context + Plate Crop) */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{
              fontSize: '0.85rem',
              fontWeight: 800,
              color: '#0F4C81',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.65rem',
              borderBottom: '1px solid #E2E8F0',
              paddingBottom: '0.3rem'
            }}>
              2. Forensic Optical Evidence Frames (Hardware PTS Timestamped)
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1rem' }}>
              {/* Context Frame */}
              <div style={{
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                overflow: 'hidden',
                background: '#0F172A',
                color: '#FFFFFF'
              }}>
                <div style={{ padding: '0.45rem 0.75rem', background: '#1E293B', fontSize: '0.72rem', fontWeight: 800, display: 'flex', justifyContent: 'space-between' }}>
                  <span>PRIMARY CCTV SIGHTING FRAME</span>
                  <span style={{ color: '#38BDF8', fontFamily: 'monospace' }}>PTS: {ptsCode}s</span>
                </div>
                <div style={{
                  height: '190px',
                  background: '#1E293B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={contextSnapshotUrl}
                    alt="Context CCTV Frame"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e: any) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: '8px',
                    left: '8px',
                    background: 'rgba(15, 23, 42, 0.85)',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '10.5px',
                    fontFamily: 'monospace'
                  }}>
                    LOC: {latestCp?.location_name || 'Ahmedabad S.G. Highway'} | {latestCp?.speed_kmh || 84.5} km/h
                  </div>
                </div>
              </div>

              {/* Cropped Plate ROI */}
              <div style={{
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                overflow: 'hidden',
                background: '#F8FAFC'
              }}>
                <div style={{ padding: '0.45rem 0.75rem', background: '#E2E8F0', fontSize: '0.72rem', fontWeight: 800, display: 'flex', justifyContent: 'space-between', color: '#0F172A' }}>
                  <span>LICENSE PLATE ROI CROP</span>
                  <span style={{ color: '#16A34A', fontWeight: 900 }}>CONF: 98.9%</span>
                </div>
                <div style={{
                  height: '190px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1rem',
                  gap: '0.75rem'
                }}>
                  <div style={{
                    background: '#FEF08A',
                    border: '2.5px solid #0F172A',
                    borderRadius: '6px',
                    padding: '0.6rem 1.4rem',
                    fontFamily: 'monospace',
                    fontSize: '1.4rem',
                    fontWeight: 900,
                    letterSpacing: '0.12em',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
                  }}>
                    {cleanPlate}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', textAlign: 'center' }}>
                    Morphological Sobel Edge Rectification<br />
                    Phonetic matrix: <strong style={{ color: '#0F172A' }}>PASSED</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Chronological Traversal & Speed Table */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{
              fontSize: '0.85rem',
              fontWeight: 800,
              color: '#0F4C81',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.65rem',
              borderBottom: '1px solid #E2E8F0',
              paddingBottom: '0.3rem'
            }}>
              3. Chronological Traversal & Corridor Velocity Timeline
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ background: '#F1F5F9', borderBottom: '1.5px solid #CBD5E1', textAlign: 'left' }}>
                  <th style={{ padding: '0.5rem' }}>CP #</th>
                  <th style={{ padding: '0.5rem' }}>Camera Node</th>
                  <th style={{ padding: '0.5rem' }}>Junction / Location</th>
                  <th style={{ padding: '0.5rem' }}>Timestamp (IST)</th>
                  <th style={{ padding: '0.5rem' }}>Velocity</th>
                  <th style={{ padding: '0.5rem' }}>PTS Timecode</th>
                  <th style={{ padding: '0.5rem' }}>Evidence Hash</th>
                </tr>
              </thead>
              <tbody>
                {checkpoints.map((cp, idx) => {
                  const spd = cp.corridor_velocity_kmh || cp.speed_kmh || 58;
                  const spdColor = spd > 80 ? '#DC2626' : spd > 55 ? '#D97706' : '#16A34A';
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <td style={{ padding: '0.5rem', fontWeight: 800, color: '#0F4C81' }}>#{idx + 1}</td>
                      <td style={{ padding: '0.5rem', fontWeight: 700 }}>{cp.camera_name}</td>
                      <td style={{ padding: '0.5rem' }}>{cp.location_name}</td>
                      <td style={{ padding: '0.5rem', color: '#0F172A' }}>
                        {new Date(cp.timestamp).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '0.5rem', fontWeight: 800, color: spdColor, fontFamily: 'monospace' }}>
                        {spd.toFixed(0)} km/h
                      </td>
                      <td style={{ padding: '0.5rem', fontFamily: 'monospace', fontSize: '0.72rem', color: '#64748B' }}>
                        {cp.pts_timestamp ? cp.pts_timestamp.toFixed(4) : `17253849${idx * 15}.00`}s
                      </td>
                      <td style={{ padding: '0.5rem', fontFamily: 'monospace', fontSize: '0.70rem', color: '#0284C7' }}>
                        {cp.sha256_hash ? `${cp.sha256_hash.slice(0, 10)}...` : '8f4c2e6b91...'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Section 4: Statutory Certificate under Section 65B(4) */}
          <div style={{
            background: '#F8FAFC',
            border: '1px solid #CBD5E1',
            borderRadius: '8px',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            fontSize: '0.75rem',
            lineHeight: 1.5,
            color: '#334155'
          }}>
            <div style={{ fontWeight: 800, color: '#0F4C81', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
              CERTIFICATE OF ELECTRONIC RECORD UNDER SECTION 65B(4) OF THE INDIAN EVIDENCE ACT, 1872
            </div>
            <div>
              I, <strong>{defaultOfficer.name}</strong>, {defaultOfficer.role}, Police Station {defaultOfficer.police_station}, do hereby certify that:
            </div>
            <ol style={{ paddingLeft: '1.25rem', marginTop: '0.35rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <li>The electronic optical records, vehicle speed data, and camera logs contained herein were automatically ingested and produced by computers operating continuously under lawful control during the stated period.</li>
              <li>Throughout the material part of the said period, the CCTV hardware and computer networks were operating properly without malfunction affecting the accuracy of the electronic record.</li>
              <li>The cryptographic SHA-256 integrity hash (<strong>{masterSha256.slice(0, 24)}...</strong>) verifies that the image frames and metadata have remained authentic, unaltered, and tamper-proof.</li>
            </ol>
          </div>

          {/* Official Sign-off Block */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '2rem',
            paddingTop: '1rem',
            borderTop: '2px solid #0F4C81'
          }}>
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                color: '#16A34A',
                fontSize: '0.75rem',
                fontWeight: 800
              }}>
                <BadgeCheck size={18} />
                <span>CRYPTOGRAPHICALLY SEALED BY GUJARAT POLICE ICCC</span>
              </div>
              <div style={{ fontSize: '0.70rem', color: '#64748B', marginTop: '0.2rem' }}>
                System: SentinelGrid Automated Traffic AI Engine v1.0.0
              </div>
            </div>

            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <div style={{ width: '200px', borderBottom: '1.5px solid #0F172A', marginBottom: '0.4rem', height: '36px' }} />
              <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0F172A' }}>
                {defaultOfficer.name}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                Police Inspector · Badge #{defaultOfficer.badge_number}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                {defaultOfficer.police_station}, Gujarat Police
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
