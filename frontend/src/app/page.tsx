'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { StatCard } from '../components/common/StatCard';
import { AlertFeed } from '../components/alerts/AlertFeed';
import { AlertModal } from '../components/alerts/AlertModal';
import { CameraGrid } from '../components/cameras/CameraGrid';
import { GisMap } from '../components/map/GisMap';
import { WatchlistTable } from '../components/watchlist/WatchlistTable';
import { WatchlistModal } from '../components/watchlist/WatchlistModal';
import {
  getCameras,
  getWatchlist,
  addWatchlistEntry,
  getAlerts,
  acknowledgeAlert,
  getDetections,
  getAnalyticsSummary,
  triggerSimulatedSighting,
  triggerSimulatedRoute
} from '../services/api';
import { wsService } from '../services/websocket';
import { Camera, WatchlistEntry, Alert, DetectionEvent, AnalyticsSummary, WatchlistCreate } from '../types';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistEntry[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [detections, setDetections] = useState<DetectionEvent[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary>({
    total_cameras: 0,
    active_cameras: 0,
    watchlist_count: 0,
    total_detections: 0,
    unacknowledged_alerts: 0
  });

  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [isWatchlistModalOpen, setIsWatchlistModalOpen] = useState(false);
  const [selectedTrackingPlate, setSelectedTrackingPlate] = useState<string>('GJ01AB1234');
  const [isSimulating, setIsSimulating] = useState(false);

  // Search filter states
  const [searchPlate, setSearchPlate] = useState('');

  // Initial Data Load
  const loadData = async () => {
    try {
      const [camsData, wlData, alertsData, detsData, sumData] = await Promise.all([
        getCameras().catch(() => []),
        getWatchlist().catch(() => []),
        getAlerts().catch(() => []),
        getDetections().catch(() => []),
        getAnalyticsSummary().catch(() => ({
          total_cameras: 5,
          active_cameras: 5,
          watchlist_count: 4,
          total_detections: 12,
          unacknowledged_alerts: 2
        }))
      ]);

      setCameras(camsData);
      setWatchlist(wlData);
      setAlerts(alertsData);
      setDetections(detsData);
      setSummary(sumData);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
  };

  useEffect(() => {
    loadData();

    // WebSocket real-time subscription
    wsService.connect();
    const unsubscribe = wsService.subscribe((data) => {
      if (data.type === 'NEW_ALERT' && data.alert) {
        setAlerts((prev) => [data.alert, ...prev]);
        setSummary((prev) => ({
          ...prev,
          unacknowledged_alerts: prev.unacknowledged_alerts + 1,
          total_detections: prev.total_detections + 1
        }));
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSimulateSighting = async () => {
    setIsSimulating(true);
    try {
      await triggerSimulatedSighting(selectedTrackingPlate || 'GJ01AB1234');
      await loadData();
    } catch (err) {
      console.error('Error simulating sighting:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleSimulateRoute = async () => {
    setIsSimulating(true);
    try {
      await triggerSimulatedRoute(selectedTrackingPlate || 'GJ01AB1234');
      await loadData();
      setActiveTab('map');
    } catch (err) {
      console.error('Error simulating route:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleExportDossier = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      report: "Gujarat Police SentinelGrid ANPR Audit & Incident Dossier",
      generated_at: new Date().toISOString(),
      summary,
      active_alerts: alerts,
      recent_detections: detections,
      watchlist_targets: watchlist
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `SentinelGrid_Incident_Dossier_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleAcknowledge = async (alertId: number) => {
    try {
      await acknowledgeAlert(alertId, 'Control Room Officer');
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
      setSummary((prev) => ({
        ...prev,
        unacknowledged_alerts: Math.max(0, prev.unacknowledged_alerts - 1)
      }));
    } catch (err) {
      console.error('Error acknowledging alert:', err);
    }
  };

  const handleAddWatchlist = async (entry: WatchlistCreate) => {
    await addWatchlistEntry(entry);
    const updated = await getWatchlist();
    setWatchlist(updated);
    setSummary((prev) => ({ ...prev, watchlist_count: updated.length }));
  };

  const filteredDetections = detections.filter((d) =>
    searchPlate ? d.plate_number?.toLowerCase().includes(searchPlate.toLowerCase()) : true
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSimulateSighting={handleSimulateSighting}
        onSimulateRoute={handleSimulateRoute}
        isSimulating={isSimulating}
      />

      <main style={{ flex: 1, padding: '1.5rem 2rem', maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
        {/* KPI Metrics Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '1.75rem'
        }}>
          <StatCard
            title="Active CCTV Feeds"
            value={`${summary.active_cameras} / ${summary.total_cameras}`}
            subtitle="Gujarat State Network"
            color="#3b82f6"
          />
          <StatCard
            title="Targets in Watchlist"
            value={summary.watchlist_count}
            subtitle="Stolen & Suspect Vehicles"
            color="#06b6d4"
          />
          <StatCard
            title="Total Detections Logged"
            value={summary.total_detections}
            subtitle="AI ANPR Inference Engine"
            color="#10b981"
          />
          <StatCard
            title="Pending Intercept Alerts"
            value={summary.unacknowledged_alerts}
            subtitle="Immediate Action Required"
            color="var(--alert-red)"
          />
        </div>

        {/* Tab 1: Command Center */}
        {activeTab === 'dashboard' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem', alignItems: 'start' }}>
            <GisMap
              cameras={cameras}
              alerts={alerts}
              selectedPlate={selectedTrackingPlate}
              onSelectPlate={setSelectedTrackingPlate}
            />
            <AlertFeed
              alerts={alerts}
              onAcknowledge={handleAcknowledge}
            />
          </div>
        )}

        {/* Tab 2: Live Feeds */}
        {activeTab === 'cameras' && (
          <div>
            <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>📹 Gujarat Live CCTV Surveillance Feeds</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Vendor-neutral RTSP & ONVIF camera streams normalized for continuous ANPR screening.
                </p>
              </div>
            </div>
            <CameraGrid cameras={cameras} />
          </div>
        )}

        {/* Tab 3: GIS Map & Tracking */}
        {activeTab === 'map' && (
          <GisMap
            cameras={cameras}
            alerts={alerts}
            selectedPlate={selectedTrackingPlate}
            onSelectPlate={setSelectedTrackingPlate}
          />
        )}

        {/* Tab 4: Watchlist DB */}
        {activeTab === 'watchlist' && (
          <WatchlistTable
            entries={watchlist}
            onAddClick={() => setIsWatchlistModalOpen(true)}
          />
        )}

        {/* Tab 5: Search & History */}
        {activeTab === 'detections' && (
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '1.5rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>🔍 ANPR Detection Audit History</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Query and verify every vehicle sighting across Gujarat CCTV junctions.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Filter by Plate Number..."
                  value={searchPlate}
                  onChange={(e) => setSearchPlate(e.target.value)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontFamily: 'var(--font-mono)'
                  }}
                />
                <button
                  onClick={handleExportDossier}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    border: '1px solid rgba(16, 185, 129, 0.5)',
                    color: '#10b981',
                    borderRadius: '6px',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  📄 Export Dossier (JSON)
                </button>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '0.75rem' }}>Detection ID</th>
                    <th style={{ padding: '0.75rem' }}>Plate Number</th>
                    <th style={{ padding: '0.75rem' }}>Camera ID</th>
                    <th style={{ padding: '0.75rem' }}>Confidence</th>
                    <th style={{ padding: '0.75rem' }}>Match Status</th>
                    <th style={{ padding: '0.75rem' }}>Source Mode</th>
                    <th style={{ padding: '0.75rem' }}>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDetections.map((det) => (
                    <tr key={det.id} style={{ borderBottom: '1px solid rgba(36, 52, 77, 0.4)' }}>
                      <td style={{ padding: '0.75rem', fontFamily: 'var(--font-mono)' }}>#{det.id}</td>
                      <td style={{ padding: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#38bdf8' }}>
                        {det.plate_number || 'UNKNOWN'}
                      </td>
                      <td style={{ padding: '0.75rem' }}>Camera #{det.camera_id}</td>
                      <td style={{ padding: '0.75rem' }}>{(det.confidence * 100).toFixed(1)}%</td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: det.matched ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.1)',
                          color: det.matched ? 'var(--alert-red)' : 'var(--status-green)'
                        }}>
                          {det.matched ? '🚨 WATCHLIST MATCH' : 'PASSED'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{
                          fontSize: '0.7rem',
                          color: det.is_simulated ? '#f59e0b' : '#38bdf8'
                        }}>
                          {det.is_simulated ? 'SIMULATED' : 'LIVE AI'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(det.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <WatchlistModal
        isOpen={isWatchlistModalOpen}
        onClose={() => setIsWatchlistModalOpen(false)}
        onSubmit={handleAddWatchlist}
      />

      <AlertModal
        alert={selectedAlert}
        onClose={() => setSelectedAlert(null)}
        onAcknowledge={handleAcknowledge}
        onTrackRoute={(plate) => {
          setSelectedTrackingPlate(plate);
          setActiveTab('map');
        }}
      />
    </div>
  );
}
