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
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plateNumber.trim()) return;
    setLoading(true);
    try {
      await onSubmit({
        plate_number: plateNumber.trim().toUpperCase(),
        category,
        priority,
        vehicle_make_model: makeModel,
        description,
        is_active: true
      });
      onClose();
    } catch (err) {
      alert("Failed to add target plate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    }}>
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '480px',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            🎯 Add Suspect Target Plate
          </h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
              License Plate Number (e.g. GJ01AB1234) *
            </label>
            <input
              type="text"
              required
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value)}
              placeholder="GJ-01-AB-1234"
              style={{
                width: '100%',
                padding: '0.6rem 0.8rem',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                color: '#fff',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                Category
              </label>
              <select
                value={category}
                onChange={(e: any) => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  color: '#fff'
                }}
              >
                <option value="stolen">Stolen</option>
                <option value="wanted">Wanted</option>
                <option value="missing">Missing</option>
                <option value="blacklisted">Blacklisted</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e: any) => setPriority(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  color: '#fff'
                }}
              >
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
              Vehicle Make / Model (Optional)
            </label>
            <input
              type="text"
              value={makeModel}
              onChange={(e) => setMakeModel(e.target.value)}
              placeholder="White Hyundai Creta"
              style={{
                width: '100%',
                padding: '0.6rem 0.8rem',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                color: '#fff'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
              Police Case / FIR Notes
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Reported from Navrangpura PS..."
              style={{
                width: '100%',
                padding: '0.6rem 0.8rem',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                color: '#fff',
                resize: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.6rem 1.2rem',
                backgroundColor: 'transparent',
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.6rem 1.2rem',
                backgroundColor: '#0284c7',
                border: 'none',
                color: '#fff',
                fontWeight: 600,
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              {loading ? 'Adding...' : 'Add to Watchlist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
