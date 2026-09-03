'use client';

import React, { useState } from 'react';
import { Video, X, MapPin, Radio, Globe, Shield, Check, AlertCircle } from 'lucide-react';
import { CameraCreate } from '../../types';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (camera: CameraCreate) => Promise<void>;
}

const GUJARAT_PRESETS = [
  { label: 'Ahmedabad - S.G. Highway Iscon Crossroad', lat: 23.0338, lon: 72.5085, loc: 'SG Highway Iscon Crossroad, Ahmedabad' },
  { label: 'Ahmedabad - Vastrapur Lake Circle', lat: 23.0350, lon: 72.5293, loc: 'Vastrapur Lake Junction, Ahmedabad' },
  { label: 'Ahmedabad - BRTS Satellite Road', lat: 23.0203, lon: 72.5506, loc: 'Satellite Road BRTS Corridor, Ahmedabad' },
  { label: 'Gandhinagar - Sector 9 Circle', lat: 23.2222, lon: 72.6497, loc: 'Sector 9 Circle, Gandhinagar' },
  { label: 'Gandhinagar - Chiloda National Highway', lat: 23.2385, lon: 72.6841, loc: 'Chiloda Highway Junction, Gandhinagar' },
  { label: 'Surat - Dumas Road Intercept', lat: 21.1702, lon: 72.8311, loc: 'Dumas Road Junction, Surat' },
  { label: 'Surat - Athwa Gate Terminal', lat: 21.2034, lon: 72.8315, loc: 'Athwa Gate Traffic Node, Surat' },
  { label: 'Vadodara - Vadsar Circle Node', lat: 22.2950, lon: 73.1740, loc: 'Vadsar Circle, Vadodara' },
  { label: 'Rajkot - Kalawad Road Checkpost', lat: 22.3028, lon: 70.8022, loc: 'Kalawad Road Checkpost, Rajkot' }
];

export const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<CameraCreate>({
    name: '',
    vendor: 'Hikvision',
    protocol: 'RTSP',
    stream_url: '',
    location_name: '',
    latitude: 23.0338,
    longitude: 72.5085,
    is_active: true
  });
  const [selectedPreset, setSelectedPreset] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const applyPreset = (label: string) => {
    const preset = GUJARAT_PRESETS.find(p => p.label === label);
    if (!preset) return;
    setSelectedPreset(label);
    setFormData(prev => ({
      ...prev,
      name: prev.name || label.split(' - ')[1] + ' CCTV',
      location_name: preset.loc,
      latitude: preset.lat,
      longitude: preset.lon
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.location_name.trim()) {
      setError('Camera name and Gujarat district location are required.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      await onSubmit({
        ...formData,
        stream_url: formData.stream_url || `rtsp://netram.gujaratpolice.gov.in/live/${formData.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
      });
      onClose();
      setFormData({
        name: '',
        vendor: 'Hikvision',
        protocol: 'RTSP',
        stream_url: '',
        location_name: '',
        latitude: 23.0338,
        longitude: 72.5085,
        is_active: true
      });
      setSelectedPreset('');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to register CCTV node. Please check backend.');
    } finally {
      setIsSubmitting(false);
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
          maxWidth: '560px',
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
        {/* Modal Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(37, 99, 235, 0.04))',
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
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}>
              <Video size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-heading, #111827)' }}>
                Register CCTV Feed
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted, #6B7280)' }}>
                Vendor-neutral RTSP / ONVIF highway optical node registration
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
              cursor: 'pointer',
              transition: 'all 0.15s ease'
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

          {/* Quick Location Preset Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-muted, #4B5563)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Quick Gujarat Junction Preset
            </label>
            <select
              value={selectedPreset}
              onChange={e => applyPreset(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '12px',
                border: '1.5px solid var(--border, #D1D5DB)',
                background: 'var(--bg-subtle, #F9FAFB)',
                color: 'var(--text-heading, #111827)',
                fontSize: '0.85rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="">— Select a Gujarat strategic checkpoint preset —</option>
              {GUJARAT_PRESETS.map((p, idx) => (
                <option key={idx} value={p.label}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Camera Name */}
          <div>
            <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-muted, #4B5563)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Camera / Junction Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. S.G. Highway Iscon Crossroad CCTV-01"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
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

          {/* Hardware Vendor & Protocol Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-muted, #4B5563)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Hardware Vendor
              </label>
              <select
                value={formData.vendor}
                onChange={e => setFormData({ ...formData, vendor: e.target.value })}
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
                <option value="Hikvision">Hikvision Industrial</option>
                <option value="CP Plus">CP Plus Red Bullet</option>
                <option value="Dahua">Dahua AI Series</option>
                <option value="Honeywell">Honeywell Enterprise</option>
                <option value="Bosch">Bosch Security</option>
                <option value="Axis">Axis Communications</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-muted, #4B5563)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Stream Protocol
              </label>
              <select
                value={formData.protocol}
                onChange={e => setFormData({ ...formData, protocol: e.target.value })}
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
                <option value="RTSP">RTSP (Live 30 FPS)</option>
                <option value="ONVIF">ONVIF Profile S</option>
                <option value="HLS">HLS Web Stream</option>
                <option value="FILE">Local Traffic Loop (MP4)</option>
              </select>
            </div>
          </div>

          {/* Location Name */}
          <div>
            <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-muted, #4B5563)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Gujarat District / Location *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. S.G. Highway, Ahmedabad"
              value={formData.location_name}
              onChange={e => setFormData({ ...formData, location_name: e.target.value })}
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

          {/* Latitude / Longitude */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-muted, #4B5563)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Latitude (°N)
              </label>
              <input
                type="number"
                step="0.0001"
                value={formData.latitude}
                onChange={e => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 23.0 })}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '12px',
                  border: '1.5px solid var(--border, #D1D5DB)',
                  background: 'var(--bg-card, #FFFFFF)',
                  color: 'var(--text-heading, #111827)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-muted, #4B5563)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Longitude (°E)
              </label>
              <input
                type="number"
                step="0.0001"
                value={formData.longitude}
                onChange={e => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 72.0 })}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '12px',
                  border: '1.5px solid var(--border, #D1D5DB)',
                  background: 'var(--bg-card, #FFFFFF)',
                  color: 'var(--text-heading, #111827)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Modal Footer Actions */}
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
              disabled={isSubmitting}
              style={{
                padding: '0.65rem 1.4rem',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: '#FFFFFF',
                fontSize: '0.85rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
              }}
            >
              <Video size={16} />
              <span>{isSubmitting ? 'Registering Node…' : 'Register Camera Node'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
