import React from 'react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'dashboard', label: 'Command Center' },
    { id: 'cameras', label: 'Live Feeds' },
    { id: 'map', label: 'GIS Map & Tracking' },
    { id: 'watchlist', label: 'Watchlist DB' },
    { id: 'detections', label: 'Search & History' },
  ];

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.875rem 2rem',
      background: 'rgba(17, 24, 39, 0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: '#3b82f6',
          boxShadow: '0 0 10px #3b82f6'
        }} />
        <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.025em' }}>
          SENTINEL<span style={{ color: '#06b6d4' }}>GRID</span>
        </h1>
        <span style={{
          fontSize: '0.75rem',
          padding: '0.2rem 0.5rem',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          color: '#3b82f6',
          borderRadius: '4px',
          border: '1px solid rgba(59, 130, 246, 0.2)'
        }}>
          GUJARAT POLICE VMS
        </span>
      </div>

      <nav style={{ display: 'flex', gap: '0.5rem' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === tab.id ? 'var(--bg-card-hover)' : 'transparent',
              color: activeTab === tab.id ? '#38bdf8' : 'var(--text-secondary)',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              borderBottom: activeTab === tab.id ? '2px solid #38bdf8' : '2px solid transparent'
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </header>
  );
};
