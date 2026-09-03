'use client';

import React, { useState } from 'react';

export default function ThreatDonutChart() {
  const [month, setMonth] = useState('Jan');
  const [year, setYear] = useState('2026');

  // 70% Cleared (Green #10B981), 30% Watchlist Matches (Blue #3B82F6)
  const clearedPct = 70;
  const matchPct = 30;

  // Circumference for r=54 is 2 * PI * 54 = 339.292
  const c = 339.292;
  const clearedOffset = c * (1 - clearedPct / 100);
  const matchOffset = c * (1 - matchPct / 100);

  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: '20px',
      padding: '1.25rem 1.5rem',
      border: '1px solid #E5E7EB',
      boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.03)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: '0.75rem'
    }}>
      {/* Header with Month/Year selectors */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#111827' }}>
          Threat Contribution
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <select
            value={month}
            onChange={e => setMonth(e.target.value)}
            style={{
              padding: '3px 8px',
              borderRadius: '6px',
              border: '1px solid #D1D5DB',
              fontSize: '0.74rem',
              fontWeight: 600,
              background: '#FFFFFF'
            }}
          >
            <option>Jan</option>
            <option>Feb</option>
            <option>Mar</option>
          </select>
          <select
            value={year}
            onChange={e => setYear(e.target.value)}
            style={{
              padding: '3px 8px',
              borderRadius: '6px',
              border: '1px solid #D1D5DB',
              fontSize: '0.74rem',
              fontWeight: 600,
              background: '#FFFFFF'
            }}
          >
            <option>2026</option>
            <option>2025</option>
          </select>
        </div>
      </div>

      {/* SVG Donut */}
      <div style={{ position: 'relative', width: '190px', height: '190px', margin: '0.5rem auto' }}>
        <svg viewBox="0 0 140 140" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
          {/* Blue Arc (30% Watchlist Matches) */}
          <circle
            cx="70"
            cy="70"
            r="52"
            fill="none"
            stroke="#3B82F6"
            strokeWidth="28"
            strokeDasharray={c}
            strokeDashoffset="0"
          />

          {/* Green Arc (70% Cleared) */}
          <circle
            cx="70"
            cy="70"
            r="52"
            fill="none"
            stroke="#10B981"
            strokeWidth="28"
            strokeDasharray={c}
            strokeDashoffset={c * 0.3}
          />
        </svg>

        {/* Overlay Labels */}
        <div style={{
          position: 'absolute',
          top: '28%',
          left: '30%',
          transform: 'translate(-50%, -50%)',
          color: '#FFFFFF',
          fontWeight: 800,
          fontSize: '0.85rem'
        }}>
          70%
        </div>
        <div style={{
          position: 'absolute',
          bottom: '22%',
          right: '25%',
          transform: 'translate(-50%, -50%)',
          color: '#FFFFFF',
          fontWeight: 800,
          fontSize: '0.85rem'
        }}>
          30%
        </div>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
        fontSize: '0.78rem',
        fontWeight: 700,
        color: '#374151'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#10B981' }} />
          <span>Cleared Traffic</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#3B82F6' }} />
          <span>Watchlist Hits</span>
        </div>
      </div>
    </div>
  );
}
