'use client';

import React, { useState } from 'react';

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

  const strokeColor = colorType === 'blue' ? '#2563EB' : '#EF4444';
  const fillColor = colorType === 'blue' ? 'url(#blueGrad)' : 'url(#redGrad)';

  // 7 data points
  const points = colorType === 'blue'
    ? [
        { day: 'Day 1', x: 20, y: 110 },
        { day: 'Day 2', x: 70, y: 80 },
        { day: 'Day 3', x: 120, y: 95 },
        { day: 'Day 4', x: 170, y: 65 },
        { day: 'Day 5', x: 220, y: 72 },
        { day: 'Day 6', x: 270, y: 50 },
        { day: 'Day 7', x: 320, y: 30 }
      ]
    : [
        { day: 'Day 1', x: 20, y: 115 },
        { day: 'Day 2', x: 70, y: 95 },
        { day: 'Day 3', x: 120, y: 105 },
        { day: 'Day 4', x: 170, y: 68 },
        { day: 'Day 5', x: 220, y: 100 },
        { day: 'Day 6', x: 270, y: 80 },
        { day: 'Day 7', x: 320, y: 115 }
      ];

  // SVG smooth cubic bezier path
  const pathD = colorType === 'blue'
    ? 'M 20 110 C 50 100, 50 80, 70 80 C 95 80, 100 95, 120 95 C 150 95, 150 65, 170 65 C 195 65, 200 72, 220 72 C 250 72, 250 50, 270 50 C 295 50, 300 30, 320 30'
    : 'M 20 115 C 50 110, 50 95, 70 95 C 95 95, 100 105, 120 105 C 145 105, 155 68, 170 68 C 190 68, 205 100, 220 100 C 245 100, 255 80, 270 80 C 295 80, 305 115, 320 115';

  const areaD = `${pathD} L 320 135 L 20 135 Z`;

  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: '20px',
      padding: '1.25rem 1.5rem',
      border: '1px solid #E5E7EB',
      boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.03)',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.85rem'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#111827' }}>
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
          <path d={areaD} fill={fillColor} />

          {/* Spline Stroke Line */}
          <path
            d={pathD}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinecap="round"
          />

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
