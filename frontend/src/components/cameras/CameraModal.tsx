import React, { useState } from 'react';
import { CameraCreate } from '../../types';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (camera: CameraCreate) => Promise<void>;
}

export const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<CameraCreate>({
    name: '',
    vendor: 'Hikvision',
    protocol: 'RTSP',
    stream_url: '',
    location_name: '',
    latitude: 23.0225,
    longitude: 72.5714,
    is_active: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.location_name.trim()) {
      setError('Please provide camera name and junction location.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      await onSubmit({
        ...formData,
        stream_url: formData.stream_url || `rtsp://stream.gujaratpolice.gov.in/live/${formData.name.toLowerCase().replace(/\s+/g, '_')}`
      });
      onClose();
      // Reset
      setFormData({
        name: '',
        vendor: 'Hikvision',
        protocol: 'RTSP',
        stream_url: '',
        location_name: '',
        latitude: 23.0225,
        longitude: 72.5714,
        is_active: true
      });
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to onboard camera.');
    } finally {
      setIsSubmitting(false);
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
        maxWidth: '520px',
        padding: '1.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              📹 Onboard New CCTV Feed
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Vendor-neutral RTSP/ONVIF ingestion node registration (FR-14).
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#f87171',
            padding: '0.6rem 0.8rem',
            borderRadius: '6px',
            fontSize: '0.85rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
              Camera Junction Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Rajkot Kalawad Road Junction"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{
                width: '100%',
                padding: '0.6rem',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '0.9rem'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                Hardware Vendor
              </label>
              <select
                value={formData.vendor}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.6rem',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '0.9rem'
                }}
              >
                <option value="Hikvision">Hikvision</option>
                <option value="CP Plus">CP Plus</option>
                <option value="Dahua">Dahua</option>
                <option value="Axis Communications">Axis Communications</option>
                <option value="Honeywell">Honeywell</option>
                <option value="Bosch">Bosch</option>
                <option value="Generic ONVIF">Generic ONVIF</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                Stream Protocol
              </label>
              <select
                value={formData.protocol}
                onChange={(e) => setFormData({ ...formData, protocol: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.6rem',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '0.9rem'
                }}
              >
                <option value="RTSP">RTSP (Live Streaming)</option>
                <option value="ONVIF">ONVIF Profile S</option>
                <option value="HTTP/HLS">HTTP / HLS</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
              Stream URI / Address
            </label>
            <input
              type="text"
              placeholder="rtsp://192.168.1.100:554/ch0 (optional, auto-generated if blank)"
              value={formData.stream_url}
              onChange={(e) => setFormData({ ...formData, stream_url: e.target.value })}
              style={{
                width: '100%',
                padding: '0.6rem',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                color: '#fff',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
              Gujarat District / Location *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Rajkot, Kalawad Road"
              value={formData.location_name}
              onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
              style={{
                width: '100%',
                padding: '0.6rem',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '0.9rem'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                Latitude (°N)
              </label>
              <input
                type="number"
                step="0.0001"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                style={{
                  width: '100%',
                  padding: '0.6rem',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  color: '#fff',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                Longitude (°E)
              </label>
              <input
                type="number"
                step="0.0001"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                style={{
                  width: '100%',
                  padding: '0.6rem',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  color: '#fff',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem'
                }}
              />
            </div>
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
              disabled={isSubmitting}
              style={{
                padding: '0.6rem 1.2rem',
                backgroundColor: '#0284c7',
                border: 'none',
                color: '#fff',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {isSubmitting ? 'Registering...' : 'Register Camera Feed'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
