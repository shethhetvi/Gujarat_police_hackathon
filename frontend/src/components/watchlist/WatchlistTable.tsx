import React from 'react';
import { WatchlistEntry } from '../../types';

interface WatchlistTableProps {
  entries: WatchlistEntry[];
  onAddClick: () => void;
}

export const WatchlistTable: React.FC<WatchlistTableProps> = ({ entries, onAddClick }) => {
  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: '10px',
      padding: '1.25rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>📋 Suspect & Stolen Vehicle Watchlist</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Active targets matched in real-time by AI ANPR engine across all Gujarat feeds.
          </p>
        </div>
        <button
          onClick={onAddClick}
          style={{
            backgroundColor: '#0284c7',
            color: '#fff',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          + Add Target Plate
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '0.75rem' }}>Plate Number</th>
              <th style={{ padding: '0.75rem' }}>Category</th>
              <th style={{ padding: '0.75rem' }}>Make / Model</th>
              <th style={{ padding: '0.75rem' }}>Priority</th>
              <th style={{ padding: '0.75rem' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid rgba(36, 52, 77, 0.5)' }}>
                <td style={{ padding: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#38bdf8' }}>
                  {item.plate_number}
                </td>
                <td style={{ padding: '0.75rem', textTransform: 'capitalize' }}>{item.category}</td>
                <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{item.vehicle_make_model || 'N/A'}</td>
                <td style={{ padding: '0.75rem' }}>
                  <span style={{
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: item.priority === 'CRITICAL' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                    color: item.priority === 'CRITICAL' ? '#f87171' : '#fbbf24'
                  }}>
                    {item.priority}
                  </span>
                </td>
                <td style={{ padding: '0.75rem' }}>
                  <span style={{ color: item.is_active ? 'var(--status-green)' : 'var(--text-muted)' }}>
                    {item.is_active ? '● Active' : '○ Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
