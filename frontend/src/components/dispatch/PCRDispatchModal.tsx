'use client';

import React, { useState } from 'react';
import {
  Shield,
  X,
  Radio,
  Car,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  Send
} from 'lucide-react';
import { Alert } from '../../types';
import { soundEffects } from '../../services/audio';

interface PCRDispatchModalProps {
  alert: Alert | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDispatch: (alertId: number, unitName: string) => void;
}

interface PatrolUnit {
  id: string;
  name: string;
  type: 'VAN' | 'BIKE' | 'CHECKPOST';
  officerInCharge: string;
  distanceKm: number;
  etaMins: number;
  status: 'AVAILABLE' | 'PATROLLING' | 'STANDBY';
}

const NEARBY_UNITS: PatrolUnit[] = [
  {
    id: 'unit-1',
    name: 'PCR Van #14 (Ahmedabad Crime Branch)',
    type: 'VAN',
    officerInCharge: 'PSI R. Dave (Callsign: Falcon-14)',
    distanceKm: 1.4,
    etaMins: 2,
    status: 'AVAILABLE'
  },
  {
    id: 'unit-2',
    name: 'Cheetah Mobile QRT #08 (S.G. Highway Rapid)',
    type: 'BIKE',
    officerInCharge: 'HC M. Solanki (Callsign: Cheetah-8)',
    distanceKm: 2.1,
    etaMins: 3,
    status: 'PATROLLING'
  },
  {
    id: 'unit-3',
    name: 'Sector Roadblock Barrier #03 (Iskcon Crossroad)',
    type: 'CHECKPOST',
    officerInCharge: 'ASI B. Vaghela (Checkpost Commander)',
    distanceKm: 2.8,
    etaMins: 4,
    status: 'STANDBY'
  }
];

export default function PCRDispatchModal({
  alert,
  isOpen,
  onClose,
  onConfirmDispatch
}: PCRDispatchModalProps) {
  const [selectedUnitId, setSelectedUnitId] = useState('unit-1');
  const [isDispatching, setIsDispatching] = useState(false);

  if (!isOpen || !alert) return null;

  const handleDispatch = () => {
    const unit = NEARBY_UNITS.find(u => u.id === selectedUnitId) || NEARBY_UNITS[0];
    setIsDispatching(true);
    soundEffects.playDispatchConfirmed();

    setTimeout(() => {
      onConfirmDispatch(alert.id, unit.name);
      setIsDispatching(false);
      onClose();
    }, 600);
  };

  return (
    <div className="cmd-backdrop" onClick={onClose}>
      <div
        className="cmd-modal"
        style={{ maxWidth: '540px' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--border)',
          background: 'linear-gradient(135deg, var(--danger-light), var(--bg-card))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: 'var(--danger)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Radio size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: '1.05rem', color: 'var(--text-heading)' }}>
                Field Unit PCR Dispatch Console
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Gujarat Police Emergency Response System (Dial 112 / Netram)
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-dim)',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Suspect Target Details */}
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span className="caption-label">Intercept Target</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginTop: '0.25rem' }}>
                <span className="license-plate-badge" style={{ fontSize: '1rem' }}>
                  {alert.plate_number}
                </span>
                <span className={`police-chip police-chip-${alert.severity.toLowerCase()}`}>
                  {alert.severity} PRIORITY
                </span>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span className="caption-label">Location Node</span>
              <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-heading)', marginTop: '0.25rem' }}>
                📍 {alert.location_name || 'Gujarat CCTV Node'}
              </div>
            </div>
          </div>
        </div>

        {/* Nearby Patrol Units List */}
        <div style={{ padding: '1.15rem 1.25rem' }}>
          <div className="caption-label" style={{ marginBottom: '0.65rem' }}>
            Available Units in Patrol Radius (Ranked by ETA)
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {NEARBY_UNITS.map(unit => {
              const isSelected = selectedUnitId === unit.id;
              return (
                <div
                  key={unit.id}
                  onClick={() => setSelectedUnitId(unit.id)}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--r-md)',
                    border: '1.5px solid',
                    borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                    background: isSelected ? 'var(--primary-light)' : 'var(--bg-card)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: isSelected ? 'var(--primary)' : 'var(--bg-subtle)',
                      color: isSelected ? '#FFFFFF' : 'var(--text-main)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px'
                    }}>
                      {unit.type === 'VAN' ? '🚔' : unit.type === 'BIKE' ? '🏍️' : '🚧'}
                    </div>

                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.86rem', color: 'var(--text-heading)' }}>
                        {unit.name}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        {unit.officerInCharge}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 900,
                      fontSize: '0.88rem',
                      color: 'var(--primary)'
                    }}>
                      ETA {unit.etaMins} MINS
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                      {unit.distanceKm} km away
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '1rem 1.25rem',
          borderTop: '1px solid var(--border)',
          background: 'var(--bg-subtle)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '0.65rem'
        }}>
          <button
            onClick={onClose}
            className="gov-btn gov-btn-outline"
          >
            Cancel
          </button>

          <button
            onClick={handleDispatch}
            disabled={isDispatching}
            className="gov-btn gov-btn-danger"
            style={{ fontWeight: 800 }}
          >
            <Send size={14} />
            <span>{isDispatching ? 'Transmitting Dispatch…' : '🚨 Authorize Immediate Dispatch'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
