'use client';

import React, { useState, useEffect } from 'react';
import { getAnalyticsSummary } from '../../services/api';

interface ThreatDonutChartProps {
  totalDetections?: number;
  alertsCount?: number;
}

export default function ThreatDonutChart({
  totalDetections,
  alertsCount
}: ThreatDonutChartProps) {
  const [month, setMonth] = useState('All');
  const [year, setYear] = useState('2026');
  const [stats, setStats] = useState({
    total: totalDetections || 0,
    hits: alertsCount || 0
  });

  useEffect(() => {
    if (totalDetections !== undefined && alertsCount !== undefined) {
      setStats({ total: totalDetections, hits: alertsCount });
    } else {
      getAnalyticsSummary()
        .then(s => {
          if (s) {
            setStats({
              total: s.total_detections || 0,
              hits: s.unacknowledged_alerts || 0
            });
          }
        })
        .catch(() => {});
    }
  }, [totalDetections, alertsCount]);

  const total = Math.max(1, stats.total);
  const matchCount = stats.hits;
  const matchPct = stats.total > 0 ? Math.min(100, Math.max(1, Math.round((matchCount / total) * 100))) : 0;
  const clearedPct = stats.total > 0 ? 100 - matchPct : 100;

  // Circumference for r=52 is 2 * PI * 52 = 326.726
  const c = 326.726;

  return (
    <div className="card-flash-emerald" style={{
      borderRadius: '20px',
      padding: '1.25rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: '0.75rem'
    }}>
      {/* Header with Month/Year selectors */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-heading)' }}>
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
            <option>All</option>
            <option>Current</option>
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
          </select>
        </div>
      </div>

      {/* SVG Donut */}
      <div style={{ position: 'relative', width: '190px', height: '190px', margin: '0.5rem auto' }}>
        <svg viewBox="0 0 140 140" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
          {/* Base / Cleared Arc (Green) */}
          <circle
            cx="70"
            cy="70"
            r="52"
            fill="none"
            stroke="#10B981"
            strokeWidth="28"
            strokeDasharray={c}
            strokeDashoffset="0"
          />

          {/* Matches Arc (Blue/Red) */}
          {matchPct > 0 && (
            <circle
              cx="70"
              cy="70"
              r="52"
              fill="none"
              stroke="#3B82F6"
              strokeWidth="28"
              strokeDasharray={c}
              strokeDashoffset={c * (clearedPct / 100)}
            />
          )}
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
          {clearedPct}%
        </div>
        {matchPct > 0 && (
          <div style={{
            position: 'absolute',
            bottom: '22%',
            right: '25%',
            transform: 'translate(-50%, -50%)',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: '0.85rem'
          }}>
            {matchPct}%
          </div>
        )}
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
          <span>Cleared Traffic ({clearedPct}%)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#3B82F6' }} />
          <span>Watchlist Hits ({matchCount})</span>
        </div>
      </div>
    </div>
  );
}
