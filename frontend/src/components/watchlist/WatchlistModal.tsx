'use client';
import React, { useState } from 'react';
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
    if (!plateNumber.trim()) { setError('Plate number is required.'); return; }
    const plateRegex = /^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/;
    const cleaned = plateNumber.trim().toUpperCase().replace(/[-\s]/g, '');
    setLoading(true);
    setError('');
    try {
      await onSubmit({
        plate_number: cleaned,
        category, priority,
        vehicle_make_model: makeModel,
        color,
        description,
        is_active: true
      });
      onClose();
      // Reset
      setPlateNumber(''); setCategory('stolen'); setPriority('HIGH');
      setMakeModel(''); setColor(''); setDescription('');
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Failed to add entry.';
      setError(msg.includes('already exists') ? `Plate ${cleaned} is already in the watchlist.` : msg);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.6rem 0.875rem',
    background: 'var(--bg-primary)', border: '1.5px solid var(--border-color)',
    borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.875rem',
    outline: 'none', transition: 'border-color 0.15s ease'
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.75rem', fontWeight: 600,
    color: 'var(--text-secondary)', marginBottom: '0.35rem',
    textTransform: 'uppercase', letterSpacing: '0.04em'
  };

  const PRIORITY_COLORS: Record<string, string> = {
    CRITICAL: '#dc2626', HIGH: '#d97706', MEDIUM: '#ca8a04', LOW: '#16a34a'
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: '500px', padding: '1.75rem' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: '#fef2f2',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem'
            }}>
              🎯
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Add Suspect Target</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Register plate for real-time ANPR screening</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
              borderRadius: '8px', width: '32px', height: '32px',
              cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1rem'
            }}
          >✕</button>
        </div>

        {error && <div className="error-banner" style={{ marginBottom: '1rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Plate */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>License Plate Number *</label>
            <input
              type="text" required
              value={plateNumber}
              onChange={e => setPlateNumber(e.target.value.toUpperCase())}
              placeholder="GJ01AB1234"
              style={{ ...inputStyle, fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1rem', letterSpacing: '0.08em' }}
            />
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Standard Indian format: GJ01AB1234
            </p>
          </div>

          {/* Category & Priority */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
              >
                <option value="stolen">🚗 Stolen Vehicle</option>
                <option value="wanted">⚠️ Wanted Suspect</option>
                <option value="missing">🔍 Missing Person</option>
                <option value="blacklisted">🚫 Blacklisted</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Priority Level</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as any)}
                style={{
                  ...inputStyle, appearance: 'none', cursor: 'pointer',
                  color: PRIORITY_COLORS[priority] || 'var(--text-primary)',
                  fontWeight: 700
                }}
              >
                <option value="CRITICAL">🔴 Critical</option>
                <option value="HIGH">🟠 High</option>
                <option value="MEDIUM">🟡 Medium</option>
                <option value="LOW">🟢 Low</option>
              </select>
            </div>
          </div>

          {/* Make/Model & Color */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Vehicle Make / Model</label>
              <input
                type="text"
                value={makeModel}
                onChange={e => setMakeModel(e.target.value)}
                placeholder="White Hyundai Creta"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Color</label>
              <input
                type="text"
                value={color}
                onChange={e => setColor(e.target.value)}
                placeholder="White"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>Police Case / FIR Notes</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Reported stolen from Navrangpura PS, Ahmedabad. FIR #4092 dated 02-Sep-2026…"
              style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.5' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
            <button
              type="submit" disabled={loading}
              style={{
                padding: '0.6rem 1.25rem',
                background: PRIORITY_COLORS[priority],
                color: '#fff', border: 'none',
                borderRadius: '8px', fontWeight: 700,
                fontSize: '0.875rem', cursor: loading ? 'wait' : 'pointer'
              }}
            >
              {loading ? '⏳ Adding…' : '🎯 Add to Watchlist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
