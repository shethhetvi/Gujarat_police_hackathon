'use client';
import React, { useState } from 'react';
import { WatchlistEntry } from '../../types';

interface WatchlistTableProps {
  entries: WatchlistEntry[];
  onAddClick: () => void;
  onDelete?: (id: number) => void;
}

const PRIORITY_CONFIG: Record<string, { bg: string; text: string; border: string }> = {
  CRITICAL: { bg: '#fef2f2', text: '#dc2626', border: 'rgba(220,38,38,0.2)' },
  HIGH: { bg: '#fff7ed', text: '#d97706', border: 'rgba(217,119,6,0.2)' },
  MEDIUM: { bg: '#fefce8', text: '#ca8a04', border: 'rgba(202,138,4,0.2)' },
  LOW: { bg: '#f0fdf4', text: '#16a34a', border: 'rgba(22,163,74,0.2)' },
};
const CATEGORY_ICONS: Record<string, string> = {
  stolen: '🚗', wanted: '⚠️', missing: '🔍', blacklisted: '🚫'
};

export const WatchlistTable: React.FC<WatchlistTableProps> = ({ entries, onAddClick, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState<'priority' | 'plate' | 'category'>('priority');

  const PRIORITY_ORDER: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

  const filtered = entries
    .filter(e => {
      const matchSearch = !searchTerm ||
        e.plate_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.vehicle_make_model && e.vehicle_make_model.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchPriority = filterPriority === 'ALL' || e.priority === filterPriority;
      const matchCat = filterCategory === 'ALL' || e.category === filterCategory;
      return matchSearch && matchPriority && matchCat;
    })
    .sort((a, b) => {
      if (sortBy === 'priority') return (PRIORITY_ORDER[a.priority] ?? 4) - (PRIORITY_ORDER[b.priority] ?? 4);
      if (sortBy === 'plate') return a.plate_number.localeCompare(b.plate_number);
      return a.category.localeCompare(b.category);
    });

  const criticalCount = entries.filter(e => e.priority === 'CRITICAL' && e.is_active).length;

  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)'
    }}>
      {/* Header */}
      <div style={{
        padding: '1.25rem 1.5rem',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        flexWrap: 'wrap', gap: '0.75rem',
        background: criticalCount > 0 ? 'linear-gradient(to right, #fff5f5, #fff)' : 'var(--bg-card)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>🎯 Suspect & Stolen Vehicle Watchlist</h3>
            {criticalCount > 0 && (
              <span style={{
                padding: '0.2rem 0.55rem', borderRadius: '20px',
                fontSize: '0.7rem', fontWeight: 800,
                background: '#fee2e2', color: '#dc2626',
                border: '1px solid rgba(220,38,38,0.25)',
                animation: 'pulse-badge 2s ease-in-out infinite'
              }}>
                {criticalCount} CRITICAL
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {entries.filter(e => e.is_active).length} active targets matched in real-time by AI ANPR engine across {entries.length} total entries
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search plate, category, make…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              padding: '0.45rem 0.8rem',
              background: 'var(--bg-primary)', border: '1.5px solid var(--border-color)',
              borderRadius: '8px', color: 'var(--text-primary)',
              fontSize: '0.85rem', width: '210px', outline: 'none'
            }}
          />
          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
            className="form-select"
            style={{ width: 'auto', padding: '0.45rem 1.8rem 0.45rem 0.7rem', fontSize: '0.82rem' }}
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="form-select"
            style={{ width: 'auto', padding: '0.45rem 1.8rem 0.45rem 0.7rem', fontSize: '0.82rem' }}
          >
            <option value="ALL">All Categories</option>
            <option value="stolen">Stolen</option>
            <option value="wanted">Wanted</option>
            <option value="missing">Missing</option>
            <option value="blacklisted">Blacklisted</option>
          </select>
          <button
            onClick={onAddClick}
            style={{
              padding: '0.45rem 0.9rem',
              background: 'var(--accent-blue)', color: '#fff',
              border: 'none', borderRadius: '8px',
              fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.35rem'
            }}
          >
            + Add Target
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>
                <button
                  onClick={() => setSortBy('plate')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                >
                  Plate Number {sortBy === 'plate' && '↑'}
                </button>
              </th>
              <th>
                <button
                  onClick={() => setSortBy('category')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                >
                  Category {sortBy === 'category' && '↑'}
                </button>
              </th>
              <th>Make / Model</th>
              <th>
                <button
                  onClick={() => setSortBy('priority')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                >
                  Priority {sortBy === 'priority' && '↑'}
                </button>
              </th>
              <th>Status</th>
              <th>Case Notes</th>
              {onDelete && <th style={{ textAlign: 'right' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '3rem', textAlign: 'center' }}>
                  <div className="empty-state">
                    <div className="empty-state-icon">🎯</div>
                    <p style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      No matching entries
                    </p>
                    <p>Adjust your filters or add a new watchlist target.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map(item => {
                const pc = PRIORITY_CONFIG[item.priority] || PRIORITY_CONFIG.HIGH;
                return (
                  <tr key={item.id}>
                    <td>
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontWeight: 800,
                        fontSize: '0.95rem', color: 'var(--accent-blue)',
                        letterSpacing: '0.05em'
                      }}>
                        {item.plate_number}
                      </span>
                    </td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span>{CATEGORY_ICONS[item.category] || '🚗'}</span>
                        <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{item.category}</span>
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {item.vehicle_make_model || <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </td>
                    <td>
                      <span style={{
                        padding: '0.25rem 0.65rem', borderRadius: '20px',
                        fontSize: '0.72rem', fontWeight: 800,
                        background: pc.bg, color: pc.text,
                        border: `1px solid ${pc.border}`,
                        textTransform: 'uppercase'
                      }}>
                        {item.priority}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        fontSize: '0.78rem', fontWeight: 700,
                        color: item.is_active ? 'var(--status-green)' : 'var(--text-muted)'
                      }}>
                        <span style={{
                          width: '6px', height: '6px', borderRadius: '50%',
                          background: item.is_active ? 'var(--status-green)' : 'var(--text-muted)',
                          display: 'inline-block'
                        }} />
                        {item.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '200px' }}>
                      <span title={item.description || ''} style={{
                        display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                      }}>
                        {item.description || <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </span>
                    </td>
                    {onDelete && (
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => {
                            if (confirm(`Remove plate ${item.plate_number} from watchlist?`)) {
                              onDelete(item.id);
                            }
                          }}
                          style={{
                            padding: '0.3rem 0.7rem',
                            background: '#fef2f2', color: '#dc2626',
                            border: '1px solid rgba(220,38,38,0.25)',
                            borderRadius: '6px', fontSize: '0.75rem',
                            fontWeight: 700, cursor: 'pointer'
                          }}
                        >
                          Remove
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer count */}
      {filtered.length > 0 && (
        <div style={{
          padding: '0.75rem 1.5rem',
          borderTop: '1px solid var(--border-color)',
          fontSize: '0.78rem', color: 'var(--text-muted)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <span>Showing {filtered.length} of {entries.length} entries</span>
          <span>{entries.filter(e => e.is_active).length} active · {entries.filter(e => !e.is_active).length} inactive</span>
        </div>
      )}
    </div>
  );
};
