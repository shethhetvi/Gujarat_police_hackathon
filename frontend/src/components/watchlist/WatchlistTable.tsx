import React from 'react';
import { WatchlistEntry } from '../../types';

interface WatchlistTableProps {
  entries: WatchlistEntry[];
  onAddClick: () => void;
  onDelete?: (id: number) => void;
}

export const WatchlistTable: React.FC<WatchlistTableProps> = ({ entries, onAddClick, onDelete }) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filtered = entries.filter((e) =>
    searchTerm
      ? e.plate_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.vehicle_make_model && e.vehicle_make_model.toLowerCase().includes(searchTerm.toLowerCase()))
      : true
  );

  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: '10px',
      padding: '1.25rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>📋 Suspect & Stolen Vehicle Watchlist</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Active targets matched in real-time by AI ANPR engine across all Gujarat feeds.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search targets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '0.45rem 0.85rem',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '0.85rem'
            }}
          />
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
              {onDelete && <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No matching watchlist targets found.
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
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
                  {onDelete && (
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      <button
                        onClick={() => {
                          if (confirm(`Remove plate ${item.plate_number} from active watchlist?`)) {
                            onDelete(item.id);
                          }
                        }}
                        title="Remove target plate"
                        style={{
                          backgroundColor: 'rgba(239, 68, 68, 0.12)',
                          color: '#f87171',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          padding: '0.3rem 0.6rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Remove
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
