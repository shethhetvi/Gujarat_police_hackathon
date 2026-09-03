'use client';

import React, { useState } from 'react';
import { Crosshair, X, Shield, AlertTriangle, Check, AlertCircle } from 'lucide-react';
import { WatchlistCreate } from '../../types';

interface WatchlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (entry: WatchlistCreate) => Promise<void>;
}

export const WatchlistModal: React.FC<WatchlistModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [plateNumber, setPlateNumber] = useState('');
  const [category, setCategory] = useState<'stolen' | 'wanted' | 'missing' | 'blacklisted'>('stolen');
  const [priority, setPriority] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');
  const [makeModel, setMakeModel] = useState('');
  const [color, setColor] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plateNumber.trim()) {
      setError('Target license plate number is required.');
      return;
    }
    const cleaned = plateNumber.trim().toUpperCase().replace(/[-\s]/g, '');
    setLoading(true);
    setError('');
    try {
      await onSubmit({
        plate_number: cleaned,
        category,
        priority,
        vehicle_make_model: makeModel,
        color,
        description,
        is_active: true
      });
      onClose();
      setPlateNumber('');
      setCategory('stolen');
      setPriority('HIGH');
      setMakeModel('');
      setColor('');
      setDescription('');
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Failed to add target to watchlist.';
      setError(msg.includes('already exists') ? `Plate ${cleaned} is already registered in active watchlist.` : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(10, 15, 29, 0.75)',
      backdropFilter: 'blur(10px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      animation: 'fadeIn 0.18s ease-out'
    }} onClick={onClose}>
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          background: 'var(--bg-card, #FFFFFF)',
          borderRadius: '24px',
          border: '1.5px solid var(--border, #E5E7EB)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(245, 158, 11, 0.05))',
          borderBottom: '1px solid var(--border, #E5E7EB)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
            }}>
              <Crosshair size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-heading, #111827)' }}>
                Add Suspect Watchlist Target
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted, #6B7280)' }}>
                Register vehicle plate for statewide real-time ANPR intercept
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: '1px solid var(--border, #E5E7EB)',
              background: 'var(--bg-subtle, #F9FAFB)',
              color: 'var(--text-dim, #6B7280)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {error && (
            <div style={{
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#DC2626',
              fontSize: '0.8rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* License Plate Input */}
          <div>
            <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-muted, #4B5563)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Target License Plate Number *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. GJ01AB1234"
              value={plateNumber}
              onChange={e => setPlateNumber(e.target.value.toUpperCase())}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                border: '2px solid var(--border, #D1D5DB)',
                background: 'var(--bg-card, #FFFFFF)',
                color: 'var(--text-heading, #111827)',
                fontFamily: 'monospace',
                fontSize: '1.1rem',
                fontWeight: 900,
                letterSpacing: '0.08em',
                outline: 'none'
              }}
            />
          </div>

          {/* Category & Priority Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-muted, #4B5563)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Case Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '12px',
                  border: '1.5px solid var(--border, #D1D5DB)',
                  background: 'var(--bg-subtle, #F9FAFB)',
                  color: 'var(--text-heading, #111827)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  outline: 'none'
                }}
              >
                <option value="stolen">🚨 Stolen Vehicle</option>
                <option value="wanted">⚠️ Wanted / Fugitive</option>
                <option value="blacklisted">🚫 Blacklisted Intercept</option>
                <option value="missing">🔍 Missing Person</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-muted, #4B5563)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Intercept Priority
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '12px',
                  border: '1.5px solid var(--border, #D1D5DB)',
                  background: 'var(--bg-subtle, #F9FAFB)',
                  color: 'var(--text-heading, #111827)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  outline: 'none'
                }}
              >
                <option value="CRITICAL">🔴 CRITICAL PRIORITY</option>
                <option value="HIGH">🟠 HIGH PRIORITY</option>
                <option value="MEDIUM">🟡 MEDIUM PRIORITY</option>
                <option value="LOW">🟢 LOW PRIORITY</option>
              </select>
            </div>
          </div>

          {/* Vehicle Make/Model & Color */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-muted, #4B5563)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Vehicle Make / Model
              </label>
              <input
                type="text"
                placeholder="e.g. Toyota Fortuner"
                value={makeModel}
                onChange={e => setMakeModel(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '12px',
                  border: '1.5px solid var(--border, #D1D5DB)',
                  background: 'var(--bg-card, #FFFFFF)',
                  color: 'var(--text-heading, #111827)',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-muted, #4B5563)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Color
              </label>
              <input
                type="text"
                placeholder="e.g. Pearl White"
                value={color}
                onChange={e => setColor(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '12px',
                  border: '1.5px solid var(--border, #D1D5DB)',
                  background: 'var(--bg-card, #FFFFFF)',
                  color: 'var(--text-heading, #111827)',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Description / FIR Note */}
          <div>
            <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-muted, #4B5563)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Police Case / FIR Notes
            </label>
            <input
              type="text"
              placeholder="e.g. FIR #4092/2026 Navrangpura PS - Suspect armed"
              value={description}
              onChange={e => setDescription(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '12px',
                border: '1.5px solid var(--border, #D1D5DB)',
                background: 'var(--bg-card, #FFFFFF)',
                color: 'var(--text-heading, #111827)',
                fontSize: '0.86rem',
                fontWeight: 600,
                outline: 'none'
              }}
            />
          </div>

          {/* Footer Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border, #E5E7EB)'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.65rem 1.25rem',
                borderRadius: '12px',
                border: '1.5px solid var(--border, #D1D5DB)',
                background: 'var(--bg-subtle, #F9FAFB)',
                color: 'var(--text-heading, #374151)',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.65rem 1.4rem',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                color: '#FFFFFF',
                fontSize: '0.85rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)'
              }}
            >
              <Crosshair size={16} />
              <span>{loading ? 'Adding Target…' : 'Register Target to Watchlist'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
