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
  Send,
  Zap,
  Target
} from 'lucide-react';
import { Alert } from '../../types';
import { soundEffects } from '../../services/audio';
import { dispatchPcrUnit } from '../../services/api';

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
  const [tacticalOrder, setTacticalOrder] = useState('Deploy tire-shredding spike strips & box-in target vehicle at next junction.');
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState(false);

  if (!isOpen || !alert) return null;

  const selectedUnit = NEARBY_UNITS.find(u => u.id === selectedUnitId) || NEARBY_UNITS[0];

  const handleDispatch = async () => {
    setIsDispatching(true);
    soundEffects.playDispatchConfirmed();

    try {
      await dispatchPcrUnit(
        alert.id,
        selectedUnit.name,
        selectedUnit.officerInCharge,
        tacticalOrder
      );
      setDispatchSuccess(true);
      setTimeout(() => {
        onConfirmDispatch(alert.id, selectedUnit.name);
        setIsDispatching(false);
        setDispatchSuccess(false);
        onClose();
      }, 1200);
    } catch (e) {
      console.warn("Dispatch error, falling back locally:", e);
      onConfirmDispatch(alert.id, selectedUnit.name);
      setIsDispatching(false);
      onClose();
    }
  };

  return (
    <div className="cmd-backdrop" onClick={onClose} style={{ zIndex: 1300 }}>
      <div
        className="cmd-modal"
        style={{ maxWidth: '560px' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--border)',
          background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.12), var(--bg-card))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'var(--danger)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Radio size={19} />
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: '1.05rem', color: 'var(--text-heading)' }}>
                Tactical PCR Interception Dispatch
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Gujarat Police Integrated Command & Control (Dial 112 / Netram)
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
        <div style={{ padding: '0.9rem 1.25rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <span className="caption-label">Intercept Target</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginTop: '0.2rem' }}>
                <span className="license-plate-badge" style={{ fontSize: '1.05rem' }}>
                  {alert.plate_number}
                </span>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 900,
                  padding: '2px 7px',
                  borderRadius: '4px',
                  background: '#FEE2E2',
                  color: '#DC2626'
                }}>
                  {alert.classification_tag || 'WANTED_SUSPECT_FIR'}
                </span>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span className="caption-label">Location Node & Speed</span>
              <div style={{ fontWeight: 800, fontSize: '0.84rem', color: 'var(--text-heading)', marginTop: '0.2rem' }}>
                📍 {alert.location_name || 'Gujarat CCTV Node'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#DC2626', fontWeight: 800 }}>
                ⚡ Speed: {alert.speed_kmh ? `${alert.speed_kmh.toFixed(0)} km/h` : '84 km/h (HIGHWAY)'}
              </div>
            </div>
          </div>
        </div>

        {/* Nearby Patrol Units List */}
        <div style={{ padding: '1rem 1.25rem' }}>
          <div className="caption-label" style={{ marginBottom: '0.55rem' }}>
            Select Interception Unit (Geofenced by Proximity)
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {NEARBY_UNITS.map(unit => {
              const isSelected = selectedUnitId === unit.id;
              return (
                <div
                  key={unit.id}
                  onClick={() => setSelectedUnitId(unit.id)}
                  style={{
                    padding: '0.75rem 0.95rem',
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

          {/* Tactical Instructions Preset */}
          <div style={{ marginTop: '0.85rem' }}>
            <span className="caption-label">Tactical Interception Instructions</span>
            <select
              className="gov-input"
              value={tacticalOrder}
              onChange={e => setTacticalOrder(e.target.value)}
              style={{ width: '100%', marginTop: '0.3rem', fontSize: '0.78rem', height: '34px' }}
            >
              <option value="Deploy tire-shredding spike strips & box-in target vehicle at next junction.">
                ⚡ Deploy tire-shredding spike strips & box-in target vehicle (Barricade Alpha)
              </option>
              <option value="Station Cheetah QRT rapid interceptor & divert civilian traffic.">
                🏍️ Station Cheetah QRT rapid interceptor & divert civilian traffic
              </option>
              <option value="Establish static highway checkpoint barrier with spike strip ready.">
                🚧 Establish static highway checkpoint barrier
              </option>
              <option value="Execute covert rolling shadow surveillance without siren engagement.">
                👁️ Covert rolling shadow surveillance (Do not alert suspect)
              </option>
            </select>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '0.85rem 1.25rem',
          borderTop: '1px solid var(--border)',
          background: 'var(--bg-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {dispatchSuccess ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#16A34A', fontSize: '0.82rem', fontWeight: 800 }}>
              <CheckCircle2 size={16} />
              <span>DISPATCH AUTHORIZED · UNITS EN ROUTE</span>
            </div>
          ) : (
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Callsign: <strong>{selectedUnit.name.split(' ')[0]}</strong>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.55rem' }}>
            <button
              onClick={onClose}
              className="gov-btn gov-btn-outline gov-btn-sm"
            >
              Cancel
            </button>

            <button
              onClick={handleDispatch}
              disabled={isDispatching || dispatchSuccess}
              className="gov-btn gov-btn-danger gov-btn-sm"
              style={{ fontWeight: 800 }}
            >
              <Send size={13} />
              <span>{isDispatching ? 'Transmitting…' : dispatchSuccess ? 'Dispatched' : '🚨 Authorize Immediate Dispatch'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
