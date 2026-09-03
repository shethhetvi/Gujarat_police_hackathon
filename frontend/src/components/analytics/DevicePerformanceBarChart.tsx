'use client';

import React, { useState } from 'react';

export default function DevicePerformanceBarChart() {
  const [timeRange, setTimeRange] = useState<'Day' | 'Week' | 'Month'>('Day');
  const [dateWindow, setDateWindow] = useState('Last 14 Days');

  // Multi-segment data for Days 1 to 14
  const daysData = [
    { day: 'Day 1', yellow: 18, blue: 13, purple: 6 },
    { day: 'Day 2', yellow: 16, blue: 11, purple: 5 },
    { day: 'Day 3', yellow: 15, blue: 9, purple: 4 },
    { day: 'Day 4', yellow: 18, blue: 14, purple: 7 },
    { day: 'Day 5', yellow: 16, blue: 12, purple: 6 },
    { day: 'Day 6', yellow: 17, blue: 13, purple: 5 },
    { day: 'Day 7', yellow: 19, blue: 15, purple: 8 },
    { day: 'Day 8', yellow: 17, blue: 13, purple: 6 },
    { day: 'Day 9', yellow: 18, blue: 14, purple: 7 },
    { day: 'Day 10', yellow: 16, blue: 11, purple: 5 },
    { day: 'Day 11', yellow: 15, blue: 10, purple: 4 },
    { day: 'Day 12', yellow: 17, blue: 13, purple: 6 },
    { day: 'Day 13', yellow: 18, blue: 14, purple: 7 },
    { day: 'Day 14', yellow: 16, blue: 12, purple: 5 },
  ];

  return (
    <div style={{
      background: 'var(--bg-card)',
      borderRadius: '20px',
      padding: '1.25rem 1.5rem',
      border: '1px solid var(--border)',
      boxShadow: 'var(--shadow-card)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-heading)' }}>
            Surveillance Device Performance
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Multi-node optical camera ingestion telemetry
          </div>
        </div>

        {/* Legend Pills & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Toggles */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.76rem', color: '#4B5563', fontWeight: 600 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#A855F7' }} />
              Four-Wheelers
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FBBF24' }} />
              Commercial Trucks
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#3B82F6' }} />
              Two-Wheelers
            </span>
          </div>

          {/* Day / Week / Month Pill Selector */}
          <div style={{
            display: 'flex',
            background: '#F3F4F6',
            borderRadius: '9999px',
            padding: '3px'
          }}>
            {(['Day', 'Week', 'Month'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setTimeRange(tab)}
                style={{
                  border: 'none',
                  background: timeRange === tab ? '#10B981' : 'transparent',
                  color: timeRange === tab ? '#FFFFFF' : '#4B5563',
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Dropdown Window Selector */}
          <select
            value={dateWindow}
            onChange={e => setDateWindow(e.target.value)}
            style={{
              padding: '4px 10px',
              borderRadius: '8px',
              border: '1px solid #D1D5DB',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#374151',
              background: '#FFFFFF',
              cursor: 'pointer'
            }}
          >
            <option>Last 14 Days</option>
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Y-Axis Label */}
      <div style={{ fontSize: '0.72rem', color: '#9CA3AF', fontWeight: 600 }}>
        Y axis : Vehicles (k)
      </div>

      {/* Segmented Pill Bar Chart */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: '210px',
        padding: '0 0.5rem 0.5rem',
        borderBottom: '1px solid #F3F4F6'
      }}>
        {daysData.map((d, idx) => (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
            {/* Multi-segment vertical pill bar */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              height: '170px',
              justifyContent: 'flex-end'
            }}>
              {/* Yellow Segment (Commercial) */}
              <div style={{
                width: '7px',
                height: `${d.yellow * 2.2}px`,
                background: '#FBBF24',
                borderRadius: '9999px'
              }} />

              {/* Blue Segment (Two-Wheelers) */}
              <div style={{
                width: '7px',
                height: `${d.blue * 3.5}px`,
                background: '#3B82F6',
                borderRadius: '9999px'
              }} />

              {/* Purple Segment (Four-Wheelers) */}
              <div style={{
                width: '7px',
                height: `${d.purple * 4.5}px`,
                background: '#A855F7',
                borderRadius: '9999px'
              }} />
            </div>

            {/* Day Label */}
            <span style={{ fontSize: '0.68rem', color: '#6B7280', fontWeight: 600 }}>
              {d.day}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
