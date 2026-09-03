'use client';

import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Bell,
  Sliders,
  Radio,
  Eye,
  Volume2,
  CheckCircle2,
  RotateCcw,
  Save
} from 'lucide-react';

interface SettingsViewProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onSaveToast?: () => void;
}

export default function SettingsView({ theme, onToggleTheme, onSaveToast }: SettingsViewProps) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [desktopNotif, setDesktopNotif] = useState(true);
  const [pollingInterval, setPollingInterval] = useState('30');
  const [confidenceThreshold, setConfidenceThreshold] = useState('85');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('Ahmedabad City Crime Branch');
  const [highContrast, setHighContrast] = useState(false);

  const handleSave = () => {
    if (onSaveToast) onSaveToast();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '840px' }}>
      {/* Header */}
      <div className="gov-card" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Settings size={22} style={{ color: 'var(--primary)' }} />
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-heading)' }}>
              ICCC Platform & Command System Preferences
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Configure live ingestion parameters, emergency audio dispatch, and officer jurisdictional routing
            </p>
          </div>
        </div>
      </div>

      {/* General & Theme Preferences */}
      <div className="gov-card">
        <div className="gov-card-header">
          <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-heading)' }}>
            1. Display & Jurisdiction Configuration
          </span>
        </div>
        <div className="gov-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.86rem', color: 'var(--text-heading)' }}>
                Command Center Theme
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Default is Government Light Theme (`#F4F7FA`), with dark mode toggle
              </div>
            </div>
            <button onClick={onToggleTheme} className="gov-btn gov-btn-outline gov-btn-sm">
              Current: <strong>{theme.toUpperCase()} MODE</strong> (Click to Toggle)
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '0.85rem' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.86rem', color: 'var(--text-heading)' }}>
                Assigned Operational Jurisdiction
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Routes real-time ANPR alarms to corresponding police station desk
              </div>
            </div>
            <select
              value={selectedJurisdiction}
              onChange={e => setSelectedJurisdiction(e.target.value)}
              className="gov-select"
              style={{ width: 'auto', minWidth: '240px' }}
            >
              <option value="Ahmedabad City Crime Branch">Ahmedabad City Crime Branch</option>
              <option value="Gandhinagar Police HQ">Gandhinagar Police HQ</option>
              <option value="Surat City Police Control Room">Surat City Police Control Room</option>
              <option value="Vadodara Central Police Station">Vadodara Central Police Station</option>
              <option value="Rajkot Range Control Room">Rajkot Range Control Room</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alert Dispatch & Audio Preferences */}
      <div className="gov-card">
        <div className="gov-card-header">
          <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-heading)' }}>
            2. Intercept Alarms & Audio Dispatch
          </span>
        </div>
        <div className="gov-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.86rem', color: 'var(--text-heading)' }}>
                Audible Alert Tone on Critical Watchlist Hit
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Emits acoustic siren ping in the control room upon suspect vehicle detection
              </div>
            </div>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={e => setSoundEnabled(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '0.85rem' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.86rem', color: 'var(--text-heading)' }}>
                OS Desktop Notifications
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Trigger native Windows / browser popups when SentinelGrid is running in background
              </div>
            </div>
            <input
              type="checkbox"
              checked={desktopNotif}
              onChange={e => setDesktopNotif(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </div>
        </div>
      </div>

      {/* AI Inference & Refresh Rates */}
      <div className="gov-card">
        <div className="gov-card-header">
          <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-heading)' }}>
            3. AI ANPR Pipeline & Ingestion Tuning
          </span>
        </div>
        <div className="gov-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.86rem', color: 'var(--text-heading)' }}>
                Auto-Refresh Polling Interval
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Frequency for synchronizing camera health and detection audit tables
              </div>
            </div>
            <select
              value={pollingInterval}
              onChange={e => setPollingInterval(e.target.value)}
              className="gov-select"
              style={{ width: 'auto' }}
            >
              <option value="15">Every 15 seconds (High Frequency)</option>
              <option value="30">Every 30 seconds (Recommended)</option>
              <option value="60">Every 60 seconds (Conserve Bandwidth)</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '0.85rem' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.86rem', color: 'var(--text-heading)' }}>
                OCR Confidence Threshold
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Minimum neural confidence required before raising automatic watchlist alert
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="range"
                min={70}
                max={99}
                value={confidenceThreshold}
                onChange={e => setConfidenceThreshold(e.target.value)}
                style={{ cursor: 'pointer' }}
              />
              <span style={{ fontWeight: 700, fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>
                {confidenceThreshold}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
        <button onClick={handleSave} className="gov-btn gov-btn-primary">
          <Save size={15} />
          <span>Save Preferences</span>
        </button>
      </div>
    </div>
  );
}
