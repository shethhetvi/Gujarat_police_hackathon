'use client';

import React from 'react';
import { Zap, Shield, Radio } from 'lucide-react';

interface PatrolBatteryWidgetProps {
  onQuickDispatch?: () => void;
}

export default function PatrolBatteryWidget({ onQuickDispatch }: PatrolBatteryWidgetProps) {
  const batteryPct = 72;

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
      gap: '0.85rem'
    }}>
      {/* Title */}
      <div>
        <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#111827' }}>
          Patrol Fleet Readiness
        </div>
        <div style={{ fontSize: '0.74rem', color: '#6B7280', marginTop: '4px', fontWeight: 600 }}>
          State of Health : <span style={{ color: '#111827', fontWeight: 700 }}>90%</span>
        </div>
        <div style={{ fontSize: '0.72rem', color: '#EF4444', fontWeight: 700, marginTop: '2px' }}>
          Warning Level : &lt; 30%
        </div>
      </div>

      {/* Battery Graphic + Percentage Display */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', padding: '0.5rem 0' }}>
        {/* Battery Container */}
        <div style={{
          width: '54px',
          height: '110px',
          borderRadius: '10px',
          border: '3px solid #111827',
          padding: '3px',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          background: '#F9FAFB'
        }}>
          {/* Top Battery Terminal Nipple */}
          <div style={{
            position: 'absolute',
            top: '-9px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '18px',
            height: '6px',
            borderRadius: '3px 3px 0 0',
            background: '#111827'
          }} />

          {/* Green Battery Fluid Level */}
          <div style={{
            width: '100%',
            height: `${batteryPct}%`,
            background: 'linear-gradient(180deg, #34D399 0%, #10B981 100%)',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            boxShadow: '0 0 10px rgba(16, 185, 129, 0.4)'
          }}>
            {/* White Lightning Bolt */}
            <Zap size={20} color="#FFFFFF" fill="#FFFFFF" />
          </div>
        </div>

        {/* Large Percentage */}
        <div style={{
          fontSize: '2.5rem',
          fontWeight: 900,
          color: '#111827',
          letterSpacing: '-0.03em',
          lineHeight: 1
        }}>
          {batteryPct}%
        </div>
      </div>

      {/* Quick Dispatch CTA Button */}
      <button
        onClick={onQuickDispatch}
        style={{
          width: '100%',
          padding: '0.65rem 1rem',
          borderRadius: '12px',
          border: 'none',
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          color: '#FFFFFF',
          fontWeight: 800,
          fontSize: '0.82rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
          transition: 'all 0.15s ease'
        }}
      >
        <Radio size={14} />
        <span>🚨 Deploy Rapid Patrol Unit</span>
      </button>
    </div>
  );
}
