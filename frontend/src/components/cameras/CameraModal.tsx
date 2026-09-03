'use client';
import React, { useState } from 'react';
import { CameraCreate } from '../../types';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (camera: CameraCreate) => Promise<void>;
}

const GUJARAT_LOCATIONS = [
  { label: 'Ahmedabad - SG Highway Junction', lat: 23.0338, lon: 72.5850, loc: 'SG Highway, Ahmedabad' },
  { label: 'Ahmedabad - Vastrapur Lake Circle', lat: 23.0350, lon: 72.5293, loc: 'Vastrapur Lake Junction, Ahmedabad' },
  { label: 'Ahmedabad - BRTS Satellite Road', lat: 23.0203, lon: 72.5506, loc: 'Satellite Road BRTS, Ahmedabad' },
  { label: 'Gandhinagar - Sector 9 Circle', lat: 23.2222, lon: 72.6497, loc: 'Sector 9, Gandhinagar' },
  { label: 'Gandhinagar - Chiloda Circle', lat: 23.2385, lon: 72.6841, loc: 'Chiloda Circle, Gandhinagar' },
  { label: 'Surat - Dumas Road Junction', lat: 21.1702, lon: 72.8311, loc: 'Dumas Road, Surat' },
  { label: 'Surat - Athwa Gate', lat: 21.2034, lon: 72.8315, loc: 'Athwa Gate, Surat' },
  { label: 'Vadodara - Vadsar Circle', lat: 22.2950, lon: 73.1740, loc: 'Vadsar Circle, Vadodara' },
  { label: 'Rajkot - Kalawad Road', lat: 22.3028, lon: 70.8022, loc: 'Kalawad Road, Rajkot' },
  { label: 'Custom Location', lat: 23.0225, lon: 72.5714, loc: '' },
];

export const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<CameraCreate>({
    name: '', vendor: 'Hikvision', protocol: 'RTSP',
    stream_url: '', location_name: '', latitude: 23.0225, longitude: 72.5714, is_active: true
  });
  const [selectedPreset, setSelectedPreset] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const applyPreset = (label: string) => {
    const preset = GUJARAT_LOCATIONS.find(l => l.label === label);
    if (!preset) return;
    setSelectedPreset(label);
    if (preset.loc) {
      setFormData(prev => ({
        ...prev,
        location_name: preset.loc,
        latitude: preset.lat,
        longitude: preset.lon
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.location_name.trim()) {
      setError('Camera name and location are required.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      await onSubmit({
        ...formData,
        stream_url: formData.stream_url || `rtsp://cctv.gujaratpolice.gov.in/${formData.name.toLowerCase().replace(/\s+/g, '_')}`
      });
      onClose();
      setFormData({ name: '', vendor: 'Hikvision', protocol: 'RTSP', stream_url: '', location_name: '', latitude: 23.0225, longitude: 72.5714, is_active: true });
      setSelectedPreset('');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to register camera. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.6rem 0.875rem',
    background: 'var(--bg-primary)', border: '1.5px solid var(--border-color)',
    borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.875rem',
    outline: 'none', transition: 'border-color 0.15s ease'
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.78rem', fontWeight: 600,
    color: 'var(--text-secondary)', marginBottom: '0.35rem',
    textTransform: 'uppercase', letterSpacing: '0.04em'
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: '540px', padding: '1.75rem' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: 'var(--accent-blue-bg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem'
            }}>
              📹
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Register CCTV Feed</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Vendor-neutral RTSP/ONVIF node registration</p>
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
          {/* Gujarat Location Presets */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Quick Location Preset</label>
            <select
              value={selectedPreset}
              onChange={e => applyPreset(e.target.value)}
              style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
            >
              <option value="">— Select a Gujarat junction preset —</option>
              {GUJARAT_LOCATIONS.map(l => (
                <option key={l.label} value={l.label}>{l.label}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Camera / Junction Name *</label>
            <input
              type="text" required placeholder="e.g. SG Highway Iscon Junction CCTV"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Hardware Vendor</label>
              <select
                value={formData.vendor}
                onChange={e => setFormData({ ...formData, vendor: e.target.value })}
                style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
              >
                {['Hikvision', 'CP Plus', 'Dahua', 'Axis Communications', 'Honeywell', 'Bosch', 'Generic ONVIF'].map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Stream Protocol</label>
              <select
                value={formData.protocol}
                onChange={e => setFormData({ ...formData, protocol: e.target.value })}
                style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
              >
                <option value="RTSP">RTSP (Live)</option>
                <option value="ONVIF">ONVIF Profile S</option>
                <option value="HTTP/HLS">HTTP / HLS</option>
                <option value="FILE">Video File</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Stream URI (optional, auto-generated)</label>
            <input
              type="text"
              placeholder="rtsp://192.168.1.100:554/ch0"
              value={formData.stream_url}
              onChange={e => setFormData({ ...formData, stream_url: e.target.value })}
              style={{ ...inputStyle, fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Gujarat District / Location *</label>
            <input
              type="text" required
              placeholder="e.g. SG Highway Junction, Ahmedabad"
              value={formData.location_name}
              onChange={e => setFormData({ ...formData, location_name: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={labelStyle}>Latitude (°N)</label>
              <input
                type="number" step="0.0001"
                value={formData.latitude}
                onChange={e => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }}
              />
            </div>
            <div>
              <label style={labelStyle}>Longitude (°E)</label>
              <input
                type="number" step="0.0001"
                value={formData.longitude}
                onChange={e => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting ? '⏳ Registering…' : '📹 Register Camera'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
