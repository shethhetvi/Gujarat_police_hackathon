'use client';
import React, { useEffect, useState, useRef } from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  color?: string;
  icon?: string;
  trend?: number; // positive = up, negative = down
  alert?: boolean;
}

function useCountUp(target: number, duration = 800) {
  const [count, setCount] = useState(0);
  const prev = useRef(0);

  useEffect(() => {
    const n = typeof target === 'number' ? target : parseInt(String(target), 10) || 0;
    if (isNaN(n)) return;
    const start = prev.current;
    const diff = n - start;
    if (diff === 0) return;
    const steps = 30;
    const stepTime = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(start + diff * ease));
      if (step >= steps) {
        clearInterval(timer);
        setCount(n);
        prev.current = n;
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [target, duration]);

  return count;
}

export const StatCard: React.FC<StatCardProps> = ({
  title, value, subtitle, color = '#1d4ed8', icon, trend, alert
}) => {
  const numVal = typeof value === 'number' ? value : NaN;
  const animated = useCountUp(isNaN(numVal) ? 0 : numVal);
  const displayVal = isNaN(numVal) ? value : animated;

  return (
    <div
      className="stat-card"
      style={{ '--card-accent': color } as React.CSSProperties}
    >
      {/* Top accent bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
        background: color, borderRadius: '14px 14px 0 0',
        opacity: alert ? 1 : 0.7
      }} />

      {alert && (
        <div style={{
          position: 'absolute', top: '0.75rem', right: '0.75rem',
          width: '8px', height: '8px', borderRadius: '50%',
          background: '#dc2626', animation: 'pulse-dot 1.5s ease-in-out infinite'
        }} />
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
        {icon && (
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px',
            background: color + '18',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.4rem', flexShrink: 0
          }}>
            {icon}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)',
            textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.35rem'
          }}>
            {title}
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{
              fontSize: '2rem', fontWeight: 800, color: color,
              lineHeight: 1, fontFamily: 'var(--font-mono)'
            }}>
              {displayVal}
            </span>
            {trend !== undefined && (
              <span style={{
                fontSize: '0.75rem', fontWeight: 600,
                color: trend >= 0 ? 'var(--status-green)' : 'var(--alert-red)'
              }}>
                {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
              </span>
            )}
          </div>
          {subtitle && (
            <p style={{
              fontSize: '0.78rem', color: 'var(--text-muted)',
              marginTop: '0.35rem', lineHeight: 1.4
            }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
