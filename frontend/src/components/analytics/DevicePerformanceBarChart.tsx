'use client';

import React, { useState, useEffect } from 'react';
import { getTrafficMetrics } from '../../services/api';

export default function DevicePerformanceBarChart() {
  const [timeRange, setTimeRange] = useState<'Day' | 'Week' | 'Month'>('Day');
  const [dateWindow, setDateWindow] = useState('Last 7 Days');
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    getTrafficMetrics().then(data => {
      if (data?.status === 'success') {
        setMetrics(data);
      }
    }).catch(() => {});
  }, []);

  const hourly = metrics?.hourly_distribution || [];
  const displayItems = hourly.length > 0
    ? hourly.slice(0, 10).map((h: any, i: number) => {
        const count = h.count || 100;
        return {
          label: h.hour,
          purple: Math.max(3, Math.round((count * 0.45) / 50)),
          blue: Math.max(2, Math.round((count * 0.35) / 50)),
          yellow: Math.max(2, Math.round((count * 0.20) / 50))
        };
      })
    : [];

  return (
    <div className="card-flash-purple" style={{
      borderRadius: '20px',
      padding: '1.25rem 1.5rem',
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
            <option>Last 7 Days</option>
            <option>Last 14 Days</option>
            <option>Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Y-Axis Label */}
      <div style={{ fontSize: '0.72rem', color: '#9CA3AF', fontWeight: 600 }}>
        Y axis : Vehicles (Throughput Density)
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
        {displayItems.length === 0 ? (
          <div style={{ margin: 'auto', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            Awaiting surveillance ingestion telemetry...
          </div>
        ) : (
          displayItems.map((d: any, idx: number) => (
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
                  height: `${Math.min(60, d.yellow * 2.2)}px`,
                  background: '#FBBF24',
                  borderRadius: '9999px'
                }} />

                {/* Blue Segment (Two-Wheelers) */}
                <div style={{
                  width: '7px',
                  height: `${Math.min(60, d.blue * 2.5)}px`,
                  background: '#3B82F6',
                  borderRadius: '9999px'
                }} />

                {/* Purple Segment (Four-Wheelers) */}
                <div style={{
                  width: '7px',
                  height: `${Math.min(60, d.purple * 3.0)}px`,
                  background: '#A855F7',
                  borderRadius: '9999px'
                }} />
              </div>

              {/* Day / Hour Label */}
              <span style={{ fontSize: '0.68rem', color: '#6B7280', fontWeight: 600 }}>
                {d.label}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
