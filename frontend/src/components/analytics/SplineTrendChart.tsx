'use client';

import React, { useState, useEffect } from 'react';
import { getTrafficMetrics } from '../../services/api';

interface SplineTrendChartProps {
  title: string;
  yAxisLabel: string;
  colorType?: 'blue' | 'red';
  showThreshold?: boolean;
}

export default function SplineTrendChart({
  title,
  yAxisLabel,
  colorType = 'blue',
  showThreshold = false
}: SplineTrendChartProps) {
  const [timeRange, setTimeRange] = useState<'Day' | 'Week' | 'Month'>('Day');
  const [windowRange, setWindowRange] = useState('Last 7 Days');
  const [trendValues, setTrendValues] = useState<number[]>([]);

  useEffect(() => {
    getTrafficMetrics().then(data => {
      if (data?.hourly_distribution?.length) {
        const counts = data.hourly_distribution.slice(0, 7).map((h: any) => h.count);
        setTrendValues(counts);
      }
    }).catch(() => {});
  }, []);

  const strokeColor = colorType === 'blue' ? '#2563EB' : '#EF4444';
  const fillColor = colorType === 'blue' ? 'url(#blueGrad)' : 'url(#redGrad)';

  const rawPoints = trendValues.length >= 4 ? trendValues : (colorType === 'blue' ? [45, 62, 58, 74, 80, 88, 95] : [12, 18, 14, 25, 19, 28, 22]);
  const minVal = Math.min(...rawPoints, 0);
  const maxVal = Math.max(...rawPoints, 100);

  // Map 7 points across width 20..320 and height 120..30
  const points = rawPoints.slice(0, 7).map((val, idx) => {
    const x = 20 + idx * 50;
    const norm = (val - minVal) / Math.max(1, maxVal - minVal);
    const y = Math.round(120 - norm * 85);
    return { day: `T-${7 - idx}`, x, y, val };
  });

  // Generate smooth SVG path
  let pathD = '';
  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cx1 = p0.x + (p1.x - p0.x) / 2;
      const cy1 = p0.y;
      const cx2 = cx1;
      const cy2 = p1.y;
      pathD += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p1.x} ${p1.y}`;
    }
  }

  const lastX = points.length ? points[points.length - 1].x : 320;
  const firstX = points.length ? points[0].x : 20;
  const areaD = pathD ? `${pathD} L ${lastX} 135 L ${firstX} 135 Z` : '';

  return (
    <div
      className={colorType === 'red' ? 'card-flash-crimson' : 'card-flash-blue'}
      style={{
        borderRadius: '20px',
        padding: '1.25rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-heading)' }}>
          {title}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {/* Day / Week / Month Pill Selector */}
          <div style={{
            display: 'flex',
            background: '#F3F4F6',
            borderRadius: '9999px',
            padding: '2px'
          }}>
            {(['Day', 'Week', 'Month'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setTimeRange(tab)}
                style={{
                  border: 'none',
                  background: timeRange === tab ? '#10B981' : 'transparent',
                  color: timeRange === tab ? '#FFFFFF' : '#4B5563',
                  padding: '3px 9px',
                  borderRadius: '9999px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Window Dropdown */}
          <select
            value={windowRange}
            onChange={e => setWindowRange(e.target.value)}
            style={{
              padding: '3px 8px',
              borderRadius: '6px',
              border: '1px solid #D1D5DB',
              fontSize: '0.74rem',
              fontWeight: 600,
              background: '#FFFFFF',
              color: '#374151'
            }}
          >
            <option>Last 7 Days</option>
            <option>Last 14 Days</option>
            <option>Last 30 Days</option>
          </select>
        </div>
      </div>

      <div style={{ fontSize: '0.7rem', color: '#9CA3AF', fontWeight: 600 }}>
        {yAxisLabel}
      </div>

      {/* SVG Curved Spline Chart */}
      <div style={{ width: '100%', height: '145px', position: 'relative' }}>
        <svg viewBox="0 0 340 145" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <defs>
            {/* Blue Gradient */}
            <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
            </linearGradient>

            {/* Red Gradient */}
            <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EF4444" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#EF4444" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines */}
          {[30, 55, 80, 105, 130].map(y => (
            <line
              key={y}
              x1="15"
              y1={y}
              x2="330"
              y2={y}
              stroke="#F3F4F6"
              strokeDasharray="4 4"
              strokeWidth="1"
            />
          ))}

          {/* Red Warning Dashed Threshold Line */}
          {showThreshold && (
            <line
              x1="15"
              y1="68"
              x2="330"
              y2="68"
              stroke="#EF4444"
              strokeDasharray="4 4"
              strokeWidth="1.5"
              opacity="0.8"
            />
          )}

          {/* Area Fill */}
          {areaD && <path d={areaD} fill={fillColor} />}

          {/* Spline Stroke Line */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke={strokeColor}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          )}

          {/* Dots on points */}
          {points.map((pt, idx) => (
            <circle
              key={idx}
              cx={pt.x}
              cy={pt.y}
              r="3.5"
              fill="#FFFFFF"
              stroke={strokeColor}
              strokeWidth="2"
            />
          ))}
        </svg>
      </div>

      {/* Days Labels Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 0.5rem', fontSize: '0.68rem', color: '#6B7280', fontWeight: 600 }}>
        {points.map((pt, idx) => (
          <span key={idx}>{pt.day}</span>
        ))}
      </div>
    </div>
  );
}
