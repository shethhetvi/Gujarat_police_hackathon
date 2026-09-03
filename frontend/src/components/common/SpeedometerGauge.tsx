'use client';

import React from 'react';

interface SpeedometerGaugeProps {
  value: number; // 0 to 100
  size?: number;
  color?: string;
  label?: string;
}

export default function SpeedometerGauge({
  value = 75,
  size = 110,
  color = '#10B981',
  label
}: SpeedometerGaugeProps) {
  // Semi-circle angle calculation (-90 deg to +90 deg, total 180 deg)
  const clamped = Math.min(100, Math.max(0, value));
  const angle = -90 + (clamped / 100) * 180;

  const cx = 60;
  const cy = 60;
  const r = 44;

  return (
    <div style={{ width: size, height: size * 0.65, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg viewBox="0 0 120 75" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
        {/* Background Track Arc (Grey) */}
        <path
          d="M 16 60 A 44 44 0 0 1 104 60"
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="8"
          strokeLinecap="round"
        />

        {/* Colored Progress Arc (Green / Amber / Blue) */}
        <path
          d="M 16 60 A 44 44 0 0 1 104 60"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray="138"
          strokeDashoffset={138 - (138 * clamped) / 100}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />

        {/* Scale Ticks */}
        {[0, 25, 50, 75, 100].map(pct => {
          const tickAngle = -90 + (pct / 100) * 180;
          const rad = (tickAngle * Math.PI) / 180;
          const x1 = cx + (r - 7) * Math.sin(rad);
          const y1 = cy - (r - 7) * Math.cos(rad);
          const x2 = cx + (r + 7) * Math.sin(rad);
          const y2 = cy - (r + 7) * Math.cos(rad);
          return (
            <line
              key={pct}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#9CA3AF"
              strokeWidth="1.5"
            />
          );
        })}

        {/* Central Pivot Dot */}
        <circle cx={cx} cy={cy} r="5" fill="#374151" />

        {/* Indicator Needle */}
        <g transform={`rotate(${angle} ${cx} ${cy})`} style={{ transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
          <line
            x1={cx}
            y1={cy}
            x2={cx}
            y2={cy - (r - 6)}
            stroke="#EF4444"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx={cx} cy={cy - (r - 6)} r="2" fill="#EF4444" />
        </g>
      </svg>
    </div>
  );
}
