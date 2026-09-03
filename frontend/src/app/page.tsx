'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

import {
  getCameras, createCamera, getWatchlist, addWatchlistEntry, deleteWatchlistEntry,
  getAlerts, acknowledgeAlert, getDetections, getAnalyticsSummary,
  triggerSimulatedSighting, triggerSimulatedRoute, checkHealth, getVehicleRoute
} from '../services/api';
import { wsService, WsStatus } from '../services/websocket';
import { Camera, WatchlistEntry, Alert, DetectionEvent, AnalyticsSummary, WatchlistCreate, CameraCreate } from '../types';

// ─── Toast System ─────────────────────────────────────────────────────────────
interface Toast { id: number; type: 'alert'|'success'|'info'|'warning'; title: string; msg?: string; }
let toastId = 0;
function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const add = useCallback((t: Omit<Toast,'id'>) => {
    const id = ++toastId;
    setToasts(p => [{ ...t, id }, ...p].slice(0, 5));
    setTimeout(() => setToasts(p => p.filter(x => x.id !== id)), 5500);
  }, []);
  const remove = useCallback((id: number) => setToasts(p => p.filter(x => x.id !== id)), []);
  return { toasts, add, remove };
}

// ─── Count-up hook ─────────────────────────────────────────────────────────────
function useCountUp(target: number) {
  const [val, setVal] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const n = isNaN(target) ? 0 : target;
    const diff = n - prev.current;
    if (!diff) return;
    let step = 0;
    const steps = 25;
    const t = setInterval(() => {
      step++;
      setVal(Math.round(prev.current + diff * (step / steps)));
      if (step >= steps) { clearInterval(t); prev.current = n; }
    }, 30);
    return () => clearInterval(t);
  }, [target]);
  return val;
}

// ─── Severity helpers ──────────────────────────────────────────────────────────
const SEV_BORDER: Record<string,string> = { CRITICAL:'var(--red)', HIGH:'var(--amber)', MEDIUM:'#fbbf24', LOW:'var(--green)' };
const SEV_TEXT:   Record<string,string> = { CRITICAL:'text-red', HIGH:'text-amber', MEDIUM:'text-amber', LOW:'text-green' };
const PRIORITY_ORDER: Record<string,number> = { CRITICAL:0, HIGH:1, MEDIUM:2, LOW:3 };

// ─── NAV TABS ──────────────────────────────────────────────────────────────────
const NAV = [
  { id:'dashboard', icon:'🏛️', label:'CMD' },
  { id:'cameras',   icon:'📹', label:'CCTV' },
  { id:'map',       icon:'🗺️', label:'GIS' },
  { id:'watchlist', icon:'🎯', label:'TARGET' },
  { id:'detections',icon:'🔬', label:'AUDIT' },
];

// ─── Gujarat camera presets ────────────────────────────────────────────────────
const GJ_PRESETS = [
  { label:'SG Highway, Ahmedabad', lat:23.0338, lon:72.5850 },
  { label:'Vastrapur Lake, Ahmedabad', lat:23.0350, lon:72.5293 },
  { label:'Sector 9, Gandhinagar', lat:23.2222, lon:72.6497 },
  { label:'Chiloda Circle, Gandhinagar', lat:23.2385, lon:72.6841 },
  { label:'Dumas Road, Surat', lat:21.1702, lon:72.8311 },
  { label:'Athwa Gate, Surat', lat:21.2034, lon:72.8315 },
  { label:'Vadsar Circle, Vadodara', lat:22.2950, lon:73.1740 },
  { label:'Kalawad Road, Rajkot', lat:22.3028, lon:70.8022 },
  { label:'Custom / Manual', lat:23.0225, lon:72.5714 },
];

// ─── Leaflet Map Component ─────────────────────────────────────────────────────
let L: any = null;
function GisMapPanel({ cameras, alerts, plate, onPlateChange }: {
  cameras: Camera[]; alerts: Alert[]; plate: string; onPlateChange: (p:string)=>void;
}) {
  const mapDiv = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const routeRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [routeData, setRouteData] = useState<any>(null);
  const [localPlate, setLocalPlate] = useState(plate);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined' || mapRef.current) return;
    import('leaflet' as any).then(leaflet => {
      L = leaflet;
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
      if (!mapDiv.current) return;
      const map = L.map(mapDiv.current, { center:[22.5,72.0], zoom:7 });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
        attribution:'© OpenStreetMap', maxZoom:19
      }).addTo(map);
      mapRef.current = map;
      setReady(true);
    });
    return () => { if(mapRef.current){ mapRef.current.remove(); mapRef.current=null; }};
  }, []);

  // Camera markers
  useEffect(() => {
    if (!mapRef.current || !ready || !L) return;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    cameras.forEach(cam => {
      if (!cam.latitude || !cam.longitude) return;
      const hasAlert = alerts.some(a => a.camera_id === cam.id);
      const isCP = routeData?.checkpoints?.some((cp:any) => cp.camera_id === cam.id);
      const color = isCP ? '#0891b2' : hasAlert ? '#ef4444' : cam.is_active ? '#38bdf8' : '#475569';
      const html = `<div style="width:26px;height:26px;border-radius:50%;background:${color};border:2px solid rgba(255,255,255,0.85);box-shadow:0 0 10px ${color}80;display:flex;align-items:center;justify-content:center;font-size:11px;">📹</div>`;
      const icon = L.divIcon({ html, className:'', iconSize:[26,26], iconAnchor:[13,13], popupAnchor:[0,-15] });
      const popup = `<div style="font-family:Inter,sans-serif;min-width:190px;background:#162235;padding:10px;border-radius:8px">
        <div style="font-size:10px;color:#38bdf8;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:5px">${isCP?'🎯 Route CP':hasAlert?'🚨 Alert':'📹 Camera'}</div>
        <div style="font-weight:800;font-size:13px;color:#f0f9ff;margin-bottom:4px">${cam.name}</div>
        <div style="font-size:11px;color:#64748b">📍 ${cam.location_name}</div>
        <div style="font-size:10px;color:#334155;font-family:monospace;margin-top:3px">${cam.latitude?.toFixed(4)}°N · ${cam.longitude?.toFixed(4)}°E</div>
        <span style="display:inline-block;margin-top:6px;padding:2px 7px;border-radius:12px;font-size:9px;font-weight:800;background:${cam.is_active?'rgba(34,197,94,0.15)':'rgba(100,116,139,0.15)'};color:${cam.is_active?'#22c55e':'#475569'}">${cam.is_active?'● ONLINE':'○ OFFLINE'}</span>
      </div>`;
      const m = L.marker([cam.latitude, cam.longitude], {icon}).bindPopup(popup, {className:'dark-popup'});
      m.addTo(mapRef.current);
      markersRef.current.push(m);
    });
  }, [cameras, alerts, ready, routeData]);

  // Route polyline
  useEffect(() => {
    if (!mapRef.current || !ready || !L) return;
    if (routeRef.current) { routeRef.current.remove(); routeRef.current = null; }
    if (!routeData?.checkpoints?.length || routeData.checkpoints_count < 2) return;
    const pts = routeData.checkpoints.filter((cp:any) => cp.latitude && cp.longitude);
    if (pts.length < 2) return;
    const coords = pts.map((cp:any) => [cp.latitude, cp.longitude]);
    const poly = L.polyline(coords, { color:'#38bdf8', weight:3.5, opacity:0.9, dashArray:'8 5' }).addTo(mapRef.current);
    pts.forEach((cp:any, i:number) => {
      const ih = `<div style="width:24px;height:24px;border-radius:50%;background:#0891b2;border:2px solid #fff;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:#fff;font-family:monospace">${i+1}</div>`;
      const ic = L.divIcon({html:ih,className:'',iconSize:[24,24],iconAnchor:[12,12],popupAnchor:[0,-14]});
      const pop = `<div style="font-family:Inter,sans-serif;min-width:175px;background:#162235;padding:10px;border-radius:8px">
        <div style="font-size:10px;color:#0891b2;font-weight:800;margin-bottom:4px">Checkpoint ${i+1}/${pts.length}</div>
        <div style="font-weight:700;font-size:12px;color:#f0f9ff;margin-bottom:3px">${cp.location_name||cp.camera_name}</div>
        <div style="font-size:10px;color:#64748b">🕒 ${new Date(cp.timestamp).toLocaleString('en-IN')}</div>
        ${cp.confidence?`<div style="font-size:10px;color:#22c55e;font-weight:700;margin-top:3px">ANPR: ${(cp.confidence*100).toFixed(1)}%</div>`:''}
      </div>`;
      L.marker([cp.latitude,cp.longitude],{icon:ic}).bindPopup(pop,{className:'dark-popup'}).addTo(mapRef.current);
    });
    routeRef.current = poly;
    try { mapRef.current.fitBounds(poly.getBounds(), { padding:[50,50] }); } catch {}
  }, [routeData, ready]);

  useEffect(() => { setLocalPlate(plate); }, [plate]);

  const trace = async (p: string) => {
    if (!p.trim()) return;
    setLoading(true); setErr('');
    try {
      const data = await getVehicleRoute(p.trim());
      setRouteData(data);
      onPlateChange(p.trim());
      if (!data?.checkpoints_count) setErr(`No sightings for "${p}". Simulate a route first.`);
    } catch { setErr('Failed to fetch route — check backend connection.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
      {/* Controls */}
      <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', flexWrap:'wrap' }}>
        <input
          type="text" value={localPlate}
          onChange={e => setLocalPlate(e.target.value.toUpperCase())}
          onKeyDown={e => e.key==='Enter' && trace(localPlate)}
          placeholder="Plate number…"
          style={{
            padding:'0.55rem 0.875rem', background:'var(--bg-panel)', border:'1px solid var(--border-bright)',
            borderRadius:'var(--r-md)', color:'var(--text-bright)', fontFamily:'var(--font-mono)',
            fontWeight:700, fontSize:'0.875rem', width:'190px', outline:'none'
          }}
        />
        <button onClick={() => trace(localPlate)} disabled={loading} className="btn btn-cyan">
          {loading ? <span className="spin">⏳</span> : '🔍'} {loading ? 'Tracing…' : 'Trace Route'}
        </button>
        {routeData && (
          <button onClick={() => { setRouteData(null); setErr(''); }} className="btn btn-ghost btn-sm">✕ Clear</button>
        )}
        <div style={{ marginLeft:'auto', display:'flex', gap:'1rem', fontSize:'0.72rem', fontWeight:600, flexWrap:'wrap' }}>
          <span style={{ color:'var(--cyan)' }}>● Cameras ({cameras.length})</span>
          <span style={{ color:'var(--red)' }}>● Alerts ({alerts.length})</span>
          {routeData && <span style={{ color:'#0891b2' }}>● Route ({routeData.checkpoints_count} pts)</span>}
        </div>
      </div>

      {err && <div className="banner banner-warning">⚠️ {err}</div>}

      {/* Map */}
      <div className="map-wrap" style={{ position:'relative' }}>
        <div ref={mapDiv} style={{ height:'480px', width:'100%', background:'#0a0f1a' }} />
        {!ready && (
          <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'#0a0f1a', flexDirection:'column', gap:'0.5rem' }}>
            <span className="spin" style={{ fontSize:'1.5rem' }}>🌐</span>
            <p style={{ color:'var(--text-dim)', fontSize:'0.85rem' }}>Initialising tactical GIS map…</p>
          </div>
        )}
      </div>

      {/* Timeline */}
      {routeData?.checkpoints_count > 0 && (
        <div className="card">
          <div className="card-header">
            <span className="section-title">🚗 Trajectory — <span className="plate">{routeData.plate_number}</span></span>
            <span className="badge badge-live">{routeData.checkpoints_count} checkpoints</span>
          </div>
          <div className="card-body">
            <div className="timeline">
              {routeData.checkpoints.map((cp:any, i:number) => (
                <div key={i} className="timeline-node">
                  <div className="timeline-num">CP {i+1}/{routeData.checkpoints_count}</div>
                  <div className="timeline-name">{cp.location_name||cp.camera_name}</div>
                  <div className="timeline-time">🕒 {new Date(cp.timestamp).toLocaleString('en-IN')}</div>
                  {cp.confidence && <div className="timeline-conf">ANPR {(cp.confidence*100).toFixed(1)}%</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Camera viewport component ─────────────────────────────────────────────────
function CamViewport({ camera }: { camera: Camera }) {
  const [frames, setFrames] = useState(0);
  const [conf, setConf] = useState(94.2);
  const [ts, setTs] = useState('');

  useEffect(() => {
    const t = setInterval(() => {
      setFrames(f => f + Math.floor(Math.random()*3+1));
      setConf(c => Math.min(99.9, Math.max(88, c + (Math.random()-0.5)*0.8)));
      setTs(new Date().toLocaleTimeString('en-IN'));
    }, 700);
    return () => clearInterval(t);
  }, []);

  return (
    <div className={`cam-viewport${!camera.is_active?' cam-offline':''}`}>
      {camera.is_active && <div className="cam-scan-beam" />}
      <div className="cam-corner tl"/><div className="cam-corner tr"/>
      <div className="cam-corner bl"/><div className="cam-corner br"/>

      <div className="cam-hud-top">
        <div className="cam-rec">
          <div className="cam-rec-dot"/>
          {camera.is_active ? 'REC LIVE' : 'OFFLINE'}
        </div>
        <div className="cam-protocol">{camera.protocol}·1080p</div>
      </div>

      {camera.is_active && (
        <div style={{
          position:'absolute', top:'50%', left:'50%',
          transform:'translate(-50%,-55%)',
          width:'140px', height:'72px',
          border:'1.5px dashed rgba(16,185,129,0.75)',
          borderRadius:'3px', background:'rgba(16,185,129,0.05)',
          zIndex:4
        }}>
          <div style={{ position:'absolute', top:'-16px', left:0, right:0, textAlign:'center', fontSize:'0.58rem', color:'#10b981', fontWeight:800, fontFamily:'monospace' }}>
            ANPR · {conf.toFixed(1)}%
          </div>
          <div style={{ position:'absolute', bottom:0, left:0, right:0, textAlign:'center', fontSize:'0.52rem', color:'#67e8f9', fontFamily:'monospace', padding:'2px' }}>
            TRK#{100+camera.id*7} · F{frames}
          </div>
        </div>
      )}

      <div className="cam-hud-bottom">
        <span className="cam-id">CAM-{String(camera.id).padStart(3,'0')}</span>
        <span className="cam-timestamp">{ts || '--:--:--'}</span>
      </div>

      {!camera.is_active && (
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'0.3rem', zIndex:5 }}>
          <span style={{ fontSize:'1.5rem', opacity:0.4 }}>🚫</span>
          <span style={{ fontSize:'0.65rem', color:'#475569', fontWeight:700, letterSpacing:'0.08em' }}>FEED INACTIVE</span>
        </div>
      )}
    </div>
  );
}

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const [tab, setTab] = useState('dashboard');
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistEntry[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [detections, setDetections] = useState<DetectionEvent[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary>({ total_cameras:0, active_cameras:0, watchlist_count:0, total_detections:0, unacknowledged_alerts:0 });

  // UI state
  const [selectedAlert, setSelectedAlert] = useState<Alert|null>(null);
  const [showWLModal, setShowWLModal] = useState(false);
  const [showCamModal, setShowCamModal] = useState(false);
  const [trackPlate, setTrackPlate] = useState('GJ01AB1234');
  const [isSimulating, setIsSimulating] = useState(false);
  const [isRefreshingCams, setIsRefreshingCams] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Detection filters
  const [dPlate, setDPlate] = useState('');
  const [dCam, setDCam] = useState('ALL');
  const [dMatch, setDMatch] = useState('ALL');

  // Watchlist filters
  const [wlSearch, setWlSearch] = useState('');
  const [wlPriority, setWlPriority] = useState('ALL');
  const [wlCat, setWlCat] = useState('ALL');

  // Camera filters
  const [camStatus, setCamStatus] = useState('ALL');
  const [camVendor, setCamVendor] = useState('ALL');

  // Form states
  const [camForm, setCamForm] = useState<CameraCreate>({ name:'', vendor:'Hikvision', protocol:'RTSP', stream_url:'', location_name:'', latitude:23.0338, longitude:72.5850, is_active:true });
  const [wlForm, setWlForm] = useState<WatchlistCreate>({ plate_number:'', category:'stolen', priority:'HIGH', vehicle_make_model:'', color:'', description:'', is_active:true });
  const [formErr, setFormErr] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Status
  const [wsStatus, setWsStatus] = useState<WsStatus>('disconnected');
  const [backendOnline, setBackendOnline] = useState(false);
  const [clock, setClock] = useState('');

  const { toasts, add: addToast, remove: removeToast } = useToasts();

  // Animated KPI values
  const kpiCams = useCountUp(summary.active_cameras);
  const kpiTargets = useCountUp(summary.watchlist_count);
  const kpiDetects = useCountUp(summary.total_detections);
  const kpiAlerts = useCountUp(summary.unacknowledged_alerts);

  // Clock
  useEffect(() => {
    const t = setInterval(() => setClock(new Date().toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', second:'2-digit' }) + ' IST'), 1000);
    return () => clearInterval(t);
  }, []);

  // Load data
  const loadData = useCallback(async (showLoader=false) => {
    if (showLoader) setIsLoadingData(true);
    try {
      const [c,w,a,d,s] = await Promise.all([
        getCameras().catch(()=>[] as Camera[]),
        getWatchlist().catch(()=>[] as WatchlistEntry[]),
        getAlerts().catch(()=>[] as Alert[]),
        getDetections({limit:300}).catch(()=>[] as DetectionEvent[]),
        getAnalyticsSummary().catch(()=>({total_cameras:0,active_cameras:0,watchlist_count:0,total_detections:0,unacknowledged_alerts:0})),
      ]);
      setCameras(c); setWatchlist(w); setAlerts(a); setDetections(d); setSummary(s);
      setBackendOnline(true);
    } catch { setBackendOnline(false); }
    finally { setIsLoadingData(false); }
  }, []);

  useEffect(() => {
    loadData(true);
    const healthT = setInterval(async () => setBackendOnline(await checkHealth()), 15000);
    const refreshT = setInterval(() => loadData(), 30000);
    wsService.connect();
    const unsubStatus = wsService.onStatusChange(setWsStatus);
    const unsubAlerts = wsService.subscribe((data) => {
      if (data.type === 'NEW_ALERT' && data.alert) {
        const a: Alert = data.alert;
        setAlerts(p => [a, ...p]);
        setSummary(p => ({ ...p, unacknowledged_alerts: p.unacknowledged_alerts + 1 }));
        addToast({ type:'alert', title:`🚨 ${a.plate_number} — INTERCEPTED`, msg:`${a.severity} · ${a.location_name||'Gujarat CCTV'}` });
      }
    });
    return () => { clearInterval(healthT); clearInterval(refreshT); unsubStatus(); unsubAlerts(); };
  }, [loadData, addToast]);

  // Simulate
  const doSimAlert = async () => {
    setIsSimulating(true);
    addToast({ type:'info', title:'Triggering AI pipeline…' });
    try {
      const r = await triggerSimulatedSighting(trackPlate||'GJ01AB1234');
      await loadData();
      addToast({ type:'success', title:`Detection fired — ${trackPlate}`, msg:r?.camera?.name });
    } catch (e:any) {
      addToast({ type:'warning', title:'Simulation failed', msg:e?.response?.data?.detail||'Check backend' });
    }
    setIsSimulating(false);
  };
  const doSimRoute = async () => {
    setIsSimulating(true);
    addToast({ type:'info', title:'Simulating 5-CP route…' });
    try {
      const r = await triggerSimulatedRoute(trackPlate||'GJ01AB1234');
      await loadData();
      addToast({ type:'success', title:`Route plotted: ${trackPlate}`, msg:`${r?.checkpoints?.length||5} checkpoints` });
      setTab('map');
    } catch (e:any) {
      addToast({ type:'warning', title:'Route simulation failed', msg:e?.response?.data?.detail||'Check backend' });
    }
    setIsSimulating(false);
  };

  // Acknowledge
  const doAck = async (id: number) => {
    try {
      await acknowledgeAlert(id, 'Control Room');
      setAlerts(p => p.filter(a => a.id !== id));
      setSummary(p => ({ ...p, unacknowledged_alerts: Math.max(0, p.unacknowledged_alerts-1) }));
      addToast({ type:'success', title:`Alert #${id} acknowledged` });
      if (selectedAlert?.id === id) setSelectedAlert(null);
    } catch { addToast({ type:'warning', title:'Failed to acknowledge' }); }
  };

  // Watchlist
  const doAddWL = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wlForm.plate_number.trim()) { setFormErr('Plate number is required.'); return; }
    setFormLoading(true); setFormErr('');
    try {
      await addWatchlistEntry({ ...wlForm, plate_number: wlForm.plate_number.toUpperCase().replace(/\s/g,'') });
      const w = await getWatchlist();
      setWatchlist(w); setSummary(p => ({...p, watchlist_count: w.length}));
      addToast({ type:'success', title:`${wlForm.plate_number} added to watchlist` });
      setShowWLModal(false);
      setWlForm({ plate_number:'', category:'stolen', priority:'HIGH', vehicle_make_model:'', color:'', description:'', is_active:true });
    } catch (e:any) { setFormErr(e?.response?.data?.detail||'Failed to add entry.'); }
    setFormLoading(false);
  };
  const doDeleteWL = async (id: number, plate: string) => {
    if (!confirm(`Remove ${plate} from watchlist?`)) return;
    await deleteWatchlistEntry(id);
    const w = await getWatchlist(); setWatchlist(w);
    addToast({ type:'info', title:`${plate} removed` });
  };

  // Camera
  const doAddCam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!camForm.name.trim()) { setFormErr('Camera name required.'); return; }
    setFormLoading(true); setFormErr('');
    try {
      await createCamera({ ...camForm, stream_url: camForm.stream_url||`rtsp://cam/${camForm.name.replace(/\s+/g,'_').toLowerCase()}` });
      const c = await getCameras(); setCameras(c);
      setSummary(p => ({...p, total_cameras:c.length, active_cameras:c.filter(x=>x.is_active).length}));
      addToast({ type:'success', title:`Camera: ${camForm.name}`, msg:camForm.location_name });
      setShowCamModal(false);
      setCamForm({ name:'', vendor:'Hikvision', protocol:'RTSP', stream_url:'', location_name:'', latitude:23.0338, longitude:72.5850, is_active:true });
    } catch (e:any) { setFormErr(e?.response?.data?.detail||'Failed to register camera.'); }
    setFormLoading(false);
  };

  const doRefreshCams = async () => {
    setIsRefreshingCams(true);
    const c = await getCameras(); setCameras(c);
    addToast({ type:'info', title:`${c.length} cameras refreshed` });
    setIsRefreshingCams(false);
  };

  const doExport = () => {
    const blob = new Blob([JSON.stringify({ report:'SentinelGrid Incident Dossier', generated_at:new Date().toISOString(), summary, alerts, detections, watchlist }, null, 2)], {type:'application/json'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `SentinelGrid_${new Date().toISOString().slice(0,10)}.json`;
    a.click(); a.remove();
    addToast({ type:'success', title:'Dossier exported as JSON' });
  };

  // Filters
  const filteredCams = cameras.filter(c => {
    const sv = camStatus === 'ALL' || (camStatus==='ONLINE' ? c.is_active : !c.is_active);
    const vv = camVendor === 'ALL' || c.vendor === camVendor;
    return sv && vv;
  });
  const filteredWL = watchlist.filter(e => {
    const sm = !wlSearch || e.plate_number.toLowerCase().includes(wlSearch.toLowerCase()) || e.category.includes(wlSearch.toLowerCase());
    const pm = wlPriority==='ALL' || e.priority===wlPriority;
    const cm = wlCat==='ALL' || e.category===wlCat;
    return sm && pm && cm;
  }).sort((a,b) => (PRIORITY_ORDER[a.priority]??4)-(PRIORITY_ORDER[b.priority]??4));
  const filteredDets = detections.filter(d => {
    const pm = !dPlate || d.plate_number?.toLowerCase().includes(dPlate.toLowerCase());
    const cm = dCam==='ALL' || d.camera_id===parseInt(dCam);
    const mm = dMatch==='ALL' || (dMatch==='MATCHED'?d.matched:!d.matched);
    return pm && cm && mm;
  });
  const camVendors = Array.from(new Set(cameras.map(c=>c.vendor).filter(Boolean)));

  const wsColor = wsStatus==='connected' ? 'var(--green)' : wsStatus==='connecting' ? 'var(--amber)' : 'var(--red)';

  return (
    <div className="app-shell">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-logo" title="SentinelGrid">🛡️</div>
        {NAV.map(n => (
          <div key={n.id} className={`sidebar-nav-item${tab===n.id?' active':''}`} onClick={()=>setTab(n.id)} title={n.label}>
            <span className="nav-icon">{n.icon}</span>
            <span className="nav-label">{n.label}</span>
            {n.id==='dashboard' && summary.unacknowledged_alerts > 0 && (
              <span className="sidebar-badge">{summary.unacknowledged_alerts}</span>
            )}
          </div>
        ))}
        <div style={{ flex:1 }} />
        <div className="sidebar-divider" />
        <div className="sidebar-nav-item" onClick={doExport} title="Export Dossier">
          <span className="nav-icon">📄</span>
          <span className="nav-label">EXPORT</span>
        </div>
        <div className="sidebar-nav-item" onClick={()=>loadData()} title="Refresh All">
          <span className="nav-icon" style={{ animation: isLoadingData?'spin 1s linear infinite':'none' }}>🔄</span>
          <span className="nav-label">SYNC</span>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="main-content">
        {/* Top Bar */}
        <header className="topbar">
          <div className="topbar-brand">
            <span className="brand-name">SENTINEL<span style={{color:'var(--cyan)'}}>GRID</span></span>
            <span className="brand-sub">Gujarat Police · CCTV Command Center · AI ANPR V2</span>
          </div>

          {/* Backend status */}
          <div className="status-pill">
            <div className={`status-dot ${backendOnline?'online':'offline'}`} />
            <span>API {backendOnline?'Online':'Offline'}</span>
          </div>

          {/* WS status */}
          <div className="status-pill">
            <div className={`status-dot ${wsStatus==='connected'?'online':wsStatus==='connecting'?'connecting':'offline'}`} />
            <span>WS {wsStatus}</span>
          </div>

          {/* Alert count */}
          {summary.unacknowledged_alerts > 0 && (
            <div className="status-pill" style={{ borderColor:'rgba(239,68,68,0.4)', background:'var(--red-bg)', color:'#f87171' }}>
              <div className="status-dot live" />
              <span>{summary.unacknowledged_alerts} Active Alerts</span>
            </div>
          )}

          {/* Plate tracking */}
          <div className="track-input-wrap">
            <span className="track-input-label">TRACK</span>
            <input className="track-input" type="text" value={trackPlate}
              onChange={e=>setTrackPlate(e.target.value.toUpperCase())} placeholder="GJ01AB1234" />
          </div>

          {/* Sim buttons */}
          <button className="sim-btn sim-btn-alert" onClick={doSimAlert} disabled={isSimulating}>
            ⚡ {isSimulating?'Running…':'Simulate Alert'}
          </button>
          <button className="sim-btn sim-btn-route" onClick={doSimRoute} disabled={isSimulating}>
            🗺️ Simulate Route
          </button>

          {/* Clock */}
          <div className="hud-clock">{clock}</div>
        </header>

        {/* Page body */}
        <div className="page-body">
          {/* Offline banner */}
          {!backendOnline && !isLoadingData && (
            <div className="banner banner-warning">
              <span>⚠️</span>
              <span>Backend offline — <code>cd backend && uvicorn app.main:app --port 8000 --reload</code></span>
            </div>
          )}
          {isLoadingData && (
            <div className="banner banner-info">
              <span className="spin">⏳</span>
              <span>Loading data from SentinelGrid backend…</span>
            </div>
          )}

          {/* ── KPI Row ── */}
          <div className="kpi-grid">
            <div className="kpi-card accent-cyan">
              <span className="kpi-icon">📹</span>
              <div className="kpi-label">Active Camera Feeds</div>
              <div className="kpi-value text-cyan">{kpiCams}/{summary.total_cameras}</div>
              <div className="kpi-sub">Gujarat State CCTV Network</div>
            </div>
            <div className="kpi-card accent-amber">
              <span className="kpi-icon">🎯</span>
              <div className="kpi-label">Watchlist Targets</div>
              <div className="kpi-value" style={{color:'var(--amber)'}}>{kpiTargets}</div>
              <div className="kpi-sub">Stolen · Wanted · Blacklisted</div>
            </div>
            <div className="kpi-card accent-green">
              <span className="kpi-icon">🔬</span>
              <div className="kpi-label">ANPR Detections</div>
              <div className="kpi-value text-green">{kpiDetects}</div>
              <div className="kpi-sub">AI inference events logged</div>
            </div>
            <div className="kpi-card accent-red" style={{position:'relative'}}>
              {summary.unacknowledged_alerts > 0 && <div className="kpi-pulse"/>}
              <span className="kpi-icon">🚨</span>
              <div className="kpi-label">Pending Alerts</div>
              <div className="kpi-value" style={{color:'var(--red)'}}>{kpiAlerts}</div>
              <div className="kpi-sub">Immediate action required</div>
            </div>
            <div className="kpi-card accent-purple">
              <span className="kpi-icon">🛡️</span>
              <div className="kpi-label">System Status</div>
              <div className="kpi-value" style={{color:'var(--purple)',fontSize:'1.3rem',paddingTop:'0.3rem'}}>{backendOnline?'ONLINE':'OFFLINE'}</div>
              <div className="kpi-sub">AI Pipeline · {wsStatus.toUpperCase()}</div>
            </div>
          </div>

          {/* ─────────────────────── COMMAND CENTER TAB ───────────────────── */}
          {tab==='dashboard' && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:'1.25rem', alignItems:'start' }}>
              {/* Map */}
              <GisMapPanel cameras={cameras} alerts={alerts} plate={trackPlate} onPlateChange={setTrackPlate} />

              {/* Right panel */}
              <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                {/* Alert Feed */}
                <div className="card">
                  <div className="card-header">
                    <div>
                      <div className="section-title">
                        {alerts.length>0 && <div className="status-dot live" style={{width:'8px',height:'8px'}} />}
                        🚨 Intercept Alerts
                      </div>
                      <div className="section-count">{alerts.length} pending acknowledgement</div>
                    </div>
                    <span className="badge badge-live">{alerts.length}</span>
                  </div>
                  <div style={{padding:'0.75rem'}}>
                    <div className="alert-feed-list">
                      {alerts.length===0 ? (
                        <div className="empty-state" style={{padding:'2rem'}}>
                          <div className="empty-icon">✅</div>
                          <div className="empty-title">All Clear</div>
                          <div className="empty-msg">No active intercept alerts</div>
                        </div>
                      ) : alerts.map(a => (
                        <div key={a.id} className={`alert-item alert-item-${a.severity.toLowerCase()}`}
                          onClick={() => setSelectedAlert(a)}>
                          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'0.5rem'}}>
                            <div>
                              <div className="alert-plate">{a.plate_number}</div>
                              <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap',margin:'0.25rem 0'}}>
                                <span className={`badge badge-${a.severity.toLowerCase()}`}>{a.severity}</span>
                                {a.is_simulated && <span className="badge badge-sim">DEMO</span>}
                              </div>
                              <div className="alert-meta">📍 {a.location_name||'Gujarat CCTV'}</div>
                              <div className="alert-meta">🕒 {new Date(a.timestamp).toLocaleTimeString('en-IN')}</div>
                            </div>
                            <div style={{display:'flex',flexDirection:'column',gap:'0.35rem',alignItems:'flex-end',flexShrink:0}}>
                              <span style={{fontSize:'0.7rem',color:'var(--cyan)'}}>View →</span>
                              <button className="alert-ack-btn" onClick={e=>{e.stopPropagation();doAck(a.id);}}>✓ ACK</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="card">
                  <div className="card-header">
                    <span className="section-title">⚡ Quick Actions</span>
                  </div>
                  <div className="card-body" style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
                    <button className="quick-action-btn" onClick={()=>setTab('map')}>🗺️ Open GIS Tracker</button>
                    <button className="quick-action-btn" onClick={()=>{setShowWLModal(true);setFormErr('');}}>🎯 Add Watchlist Target</button>
                    <button className="quick-action-btn" onClick={()=>{setShowCamModal(true);setFormErr('');}}>📹 Register Camera Feed</button>
                    <button className="quick-action-btn" onClick={doExport}>📄 Export Incident Dossier</button>
                    <button className="quick-action-btn" onClick={()=>loadData()}>🔄 Refresh All Data</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────── CAMERAS TAB ──────────────────────────── */}
          {tab==='cameras' && (
            <div>
              <div className="card" style={{marginBottom:'1rem'}}>
                <div className="card-header">
                  <div>
                    <div className="section-title">📹 Live CCTV Surveillance Feeds</div>
                    <div className="section-count">{cameras.filter(c=>c.is_active).length}/{cameras.length} online · Vendor-neutral RTSP/ONVIF</div>
                  </div>
                  <div style={{display:'flex',gap:'0.6rem',flexWrap:'wrap',alignItems:'center'}}>
                    <select value={camStatus} onChange={e=>setCamStatus(e.target.value)} className="form-select" style={{width:'auto',padding:'0.4rem 1.8rem 0.4rem 0.7rem',fontSize:'0.78rem'}}>
                      <option value="ALL">All Status</option>
                      <option value="ONLINE">Online Only</option>
                      <option value="OFFLINE">Offline Only</option>
                    </select>
                    <select value={camVendor} onChange={e=>setCamVendor(e.target.value)} className="form-select" style={{width:'auto',padding:'0.4rem 1.8rem 0.4rem 0.7rem',fontSize:'0.78rem'}}>
                      <option value="ALL">All Vendors</option>
                      {camVendors.map(v=><option key={v} value={v}>{v}</option>)}
                    </select>
                    <button className="btn btn-ghost btn-sm" onClick={doRefreshCams} disabled={isRefreshingCams}>
                      <span style={{animation:isRefreshingCams?'spin 1s linear infinite':'none',display:'inline-block'}}>🔄</span>
                      {isRefreshingCams?'Refreshing…':'Refresh'}
                    </button>
                    <button className="btn btn-cyan btn-sm" onClick={()=>{setShowCamModal(true);setFormErr('');}}>📹 + Add Camera</button>
                  </div>
                </div>
              </div>

              {filteredCams.length===0 ? (
                <div className="card"><div className="empty-state">
                  <div className="empty-icon">📹</div>
                  <div className="empty-title">No cameras found</div>
                  <div className="empty-msg">Register a camera or change your filters.</div>
                </div></div>
              ) : (
                <div className="cam-grid">
                  {filteredCams.map(cam => (
                    <div key={cam.id} className={`cam-card${alerts.some(a=>a.camera_id===cam.id)?' cam-alert':''}`}>
                      <CamViewport camera={cam} />
                      <div className="cam-info">
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'0.25rem'}}>
                          <div className="cam-name">{cam.name}</div>
                          <span className={`badge ${cam.is_active?'badge-online':'badge-offline'}`}>
                            {cam.is_active?'● Online':'○ Offline'}
                          </span>
                        </div>
                        <div className="cam-location">📍 {cam.location_name}</div>
                        <div className="cam-meta">
                          <span>{cam.latitude?.toFixed(4)}°N</span>
                          <span style={{color:'var(--border-bright)'}}>·</span>
                          <span>{cam.longitude?.toFixed(4)}°E</span>
                          <span style={{color:'var(--border-bright)'}}>·</span>
                          <span style={{color:'var(--cyan)'}}>{cam.vendor}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ─────────────────────── MAP TAB ──────────────────────────────── */}
          {tab==='map' && (
            <GisMapPanel cameras={cameras} alerts={alerts} plate={trackPlate} onPlateChange={setTrackPlate} />
          )}

          {/* ─────────────────────── WATCHLIST TAB ───────────────────────── */}
          {tab==='watchlist' && (
            <div className="card">
              {/* Header */}
              <div className="card-header">
                <div>
                  <div className="section-title">🎯 Suspect & Stolen Vehicle Watchlist</div>
                  <div className="section-count">{watchlist.filter(e=>e.is_active).length} active targets · {watchlist.length} total</div>
                </div>
                <button className="btn btn-red btn-sm" onClick={()=>{setShowWLModal(true);setFormErr('');}}>+ Add Target</button>
              </div>

              {/* Filters */}
              <div className="filter-bar">
                <input type="text" placeholder="Search plate / category…" value={wlSearch} onChange={e=>setWlSearch(e.target.value)}
                  className="form-input" style={{width:'200px',padding:'0.4rem 0.7rem',fontSize:'0.8rem'}} />
                <select value={wlPriority} onChange={e=>setWlPriority(e.target.value)} className="form-select" style={{width:'auto',padding:'0.4rem 1.8rem 0.4rem 0.7rem',fontSize:'0.78rem'}}>
                  <option value="ALL">All Priorities</option>
                  <option value="CRITICAL">🔴 Critical</option>
                  <option value="HIGH">🟠 High</option>
                  <option value="MEDIUM">🟡 Medium</option>
                  <option value="LOW">🟢 Low</option>
                </select>
                <select value={wlCat} onChange={e=>setWlCat(e.target.value)} className="form-select" style={{width:'auto',padding:'0.4rem 1.8rem 0.4rem 0.7rem',fontSize:'0.78rem'}}>
                  <option value="ALL">All Categories</option>
                  <option value="stolen">🚗 Stolen</option>
                  <option value="wanted">⚠️ Wanted</option>
                  <option value="missing">🔍 Missing</option>
                  <option value="blacklisted">🚫 Blacklisted</option>
                </select>
                <span style={{marginLeft:'auto',fontSize:'0.72rem',color:'var(--text-dim)'}}>
                  {filteredWL.length}/{watchlist.length} shown
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Plate Number</th><th>Category</th><th>Make / Model</th>
                      <th>Priority</th><th>Status</th><th>FIR Notes</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWL.length===0 ? (
                      <tr><td colSpan={7}><div className="empty-state"><div className="empty-icon">🎯</div><div className="empty-title">No targets found</div></div></td></tr>
                    ) : filteredWL.map(e => (
                      <tr key={e.id}>
                        <td><span className="plate" style={{fontSize:'0.95rem'}}>{e.plate_number}</span></td>
                        <td><span style={{textTransform:'capitalize'}}>{e.category}</span></td>
                        <td style={{fontSize:'0.8rem',color:'var(--text-dim)'}}>{e.vehicle_make_model||'—'}</td>
                        <td><span className={`badge badge-${e.priority.toLowerCase()}`}>{e.priority}</span></td>
                        <td>
                          <span style={{display:'flex',alignItems:'center',gap:'4px',fontSize:'0.75rem',fontWeight:700,color:e.is_active?'var(--green)':'var(--text-dim)'}}>
                            <span style={{width:'5px',height:'5px',borderRadius:'50%',background:e.is_active?'var(--green)':'var(--text-dim)',display:'inline-block'}}/>
                            {e.is_active?'Active':'Inactive'}
                          </span>
                        </td>
                        <td style={{fontSize:'0.75rem',color:'var(--text-dim)',maxWidth:'160px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}} title={e.description||''}>
                          {e.description||'—'}
                        </td>
                        <td>
                          <button className="btn btn-red btn-xs" onClick={()=>doDeleteWL(e.id, e.plate_number)}>Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─────────────────────── DETECTIONS TAB ──────────────────────── */}
          {tab==='detections' && (
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="section-title">🔬 ANPR Detection Audit Log</div>
                  <div className="section-count">{filteredDets.length}/{detections.length} events · All Gujarat CCTV junctions</div>
                </div>
                <button className="btn btn-success btn-sm" onClick={doExport}>📄 Export</button>
              </div>

              <div className="filter-bar">
                <input type="text" placeholder="Filter plate…" value={dPlate} onChange={e=>setDPlate(e.target.value)}
                  className="form-input" style={{width:'160px',padding:'0.4rem 0.7rem',fontSize:'0.8rem'}} />
                <select value={dCam} onChange={e=>setDCam(e.target.value)} className="form-select" style={{width:'auto',padding:'0.4rem 1.8rem 0.4rem 0.7rem',fontSize:'0.78rem'}}>
                  <option value="ALL">All Cameras</option>
                  {cameras.map(c=><option key={c.id} value={c.id}>#{c.id} {c.location_name?.split(',')[0]}</option>)}
                </select>
                <select value={dMatch} onChange={e=>setDMatch(e.target.value)} className="form-select" style={{width:'auto',padding:'0.4rem 1.8rem 0.4rem 0.7rem',fontSize:'0.78rem'}}>
                  <option value="ALL">All Results</option>
                  <option value="MATCHED">🚨 Watchlist Hits</option>
                  <option value="PASSED">✅ Cleared Only</option>
                </select>
                <span style={{marginLeft:'auto',fontSize:'0.72rem',color:'var(--text-dim)'}}>
                  {filteredDets.filter(d=>d.matched).length} hits · {filteredDets.filter(d=>!d.matched).length} cleared
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr><th>#</th><th>Plate</th><th>Camera</th><th>Confidence</th><th>Match</th><th>Source</th><th>Timestamp</th></tr>
                  </thead>
                  <tbody>
                    {filteredDets.length===0 ? (
                      <tr><td colSpan={7}><div className="empty-state"><div className="empty-icon">🔬</div><div className="empty-title">No detections</div><div className="empty-msg">Simulate a sighting or adjust filters</div></div></td></tr>
                    ) : filteredDets.map(d => (
                      <tr key={d.id}>
                        <td><span className="font-mono text-dim" style={{fontSize:'0.75rem'}}>#{d.id}</span></td>
                        <td><span className="plate">{d.plate_number||'—'}</span></td>
                        <td style={{fontSize:'0.8rem',color:'var(--text-dim)'}}>{cameras.find(c=>c.id===d.camera_id)?.name||`Cam #${d.camera_id}`}</td>
                        <td>
                          <div className="conf-bar-wrap">
                            <div className="conf-bar">
                              <div className="conf-bar-fill" style={{width:`${d.confidence*100}%`,background:d.confidence>0.9?'var(--green)':d.confidence>0.7?'var(--amber)':'var(--red)'}}/>
                            </div>
                            <span className="font-mono" style={{fontSize:'0.75rem',fontWeight:700}}>{(d.confidence*100).toFixed(1)}%</span>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${d.matched?'badge-critical':'badge-online'}`}>
                            {d.matched?'🚨 HIT':'✅ PASS'}
                          </span>
                        </td>
                        <td><span className={`badge ${d.is_simulated?'badge-sim':'badge-online'}`}>{d.is_simulated?'DEMO':'LIVE AI'}</span></td>
                        <td style={{fontSize:'0.75rem',color:'var(--text-dim)'}}>{new Date(d.timestamp).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Status bar */}
        <footer className="statusbar">
          <span className="statusbar-item">🛡️ SentinelGrid v1.0</span>
          <span className="statusbar-item"><span style={{color:'var(--text-ghost)'}}>API:</span> {backendOnline?<span className="text-green">●ONLINE</span>:<span className="text-red">●OFFLINE</span>}</span>
          <span className="statusbar-item"><span style={{color:'var(--text-ghost)'}}>WS:</span> <span style={{color:wsColor}}>{wsStatus.toUpperCase()}</span></span>
          <span className="statusbar-item"><span style={{color:'var(--text-ghost)'}}>CAMS:</span> {summary.active_cameras}/{summary.total_cameras}</span>
          <span className="statusbar-item"><span style={{color:'var(--text-ghost)'}}>ALERTS:</span> <span style={{color:summary.unacknowledged_alerts>0?'var(--red)':'var(--green)'}}>{summary.unacknowledged_alerts}</span></span>
          <span className="statusbar-item" style={{marginLeft:'auto'}}>AUTO-REFRESH 30s · AI ANPR BYTETRACK V2</span>
        </footer>
      </div>

      {/* ── Toast Stack ── */}
      <div className="toast-stack">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span style={{fontSize:'1rem',flexShrink:0}}>{t.type==='alert'?'🚨':t.type==='success'?'✅':t.type==='info'?'ℹ️':'⚠️'}</span>
            <div style={{flex:1}}>
              <div className="toast-title">{t.title}</div>
              {t.msg && <div className="toast-msg">{t.msg}</div>}
            </div>
            <button className="toast-close" onClick={()=>removeToast(t.id)}>✕</button>
          </div>
        ))}
      </div>

      {/* ── Alert Detail Modal ── */}
      {selectedAlert && (
        <div className="modal-overlay" onClick={()=>setSelectedAlert(null)}>
          <div className="modal-box" style={{maxWidth:'520px'}} onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-title">🚨 Intercept Alert</div>
                <div style={{fontSize:'0.72rem',color:'var(--text-dim)',marginTop:'2px'}}>Watchlist match detected by AI ANPR</div>
              </div>
              <button className="modal-close" onClick={()=>setSelectedAlert(null)}>✕</button>
            </div>
            <div className="modal-body">
              {/* Plate banner */}
              <div style={{padding:'0.875rem 1rem',border:`1px solid ${SEV_BORDER[selectedAlert.severity]||'var(--amber)'}`,borderRadius:'var(--r-md)',background:`rgba(${selectedAlert.severity==='CRITICAL'?'239,68,68':selectedAlert.severity==='HIGH'?'245,158,11':'16,185,129'},0.1)`,marginBottom:'1rem',display:'flex',alignItems:'center',gap:'0.75rem'}}>
                <span className={`badge badge-${selectedAlert.severity.toLowerCase()}`}>{selectedAlert.severity}</span>
                <span className="plate" style={{fontSize:'1.2rem'}}>{selectedAlert.plate_number}</span>
                {selectedAlert.is_simulated && <span className="badge badge-sim">DEMO</span>}
              </div>

              {/* Snapshot area */}
              <div style={{height:'200px',background:'#030609',borderRadius:'var(--r-md)',border:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'1rem',position:'relative',overflow:'hidden'}}>
                <div style={{textAlign:'center',color:'var(--text-dim)'}}>
                  <div style={{fontSize:'2rem',marginBottom:'0.5rem'}}>📷</div>
                  <div style={{fontSize:'0.8rem',fontWeight:700}}>AI Plate Crop Snapshot</div>
                  <div style={{fontSize:'0.72rem',marginTop:'0.25rem'}}>Served from /snapshots/ on backend</div>
                </div>
                <div style={{position:'absolute',bottom:0,left:0,right:0,background:'linear-gradient(transparent,rgba(0,0,0,0.8))',padding:'0.4rem 0.75rem'}}>
                  <span style={{fontFamily:'var(--font-mono)',fontSize:'0.65rem',color:'#64748b'}}>CAM-{selectedAlert.camera_id||'???'} · {selectedAlert.location_name||'Gujarat CCTV'}</span>
                </div>
              </div>

              {/* Detail grid */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem',marginBottom:'1.25rem'}}>
                {[
                  {label:'Plate Number', val:selectedAlert.plate_number, mono:true, col:'var(--cyan)'},
                  {label:'Severity', val:selectedAlert.severity, col:SEV_BORDER[selectedAlert.severity]||'var(--amber)'},
                  {label:'Location', val:selectedAlert.location_name||'Gujarat CCTV Node'},
                  {label:'Time', val:new Date(selectedAlert.timestamp).toLocaleString('en-IN')},
                ].map(item => (
                  <div key={item.label} style={{padding:'0.65rem 0.875rem',background:'var(--bg-panel)',borderRadius:'var(--r-md)',border:'1px solid var(--border)'}}>
                    <div style={{fontSize:'0.65rem',fontWeight:700,color:'var(--text-dim)',textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:'0.25rem'}}>{item.label}</div>
                    <div style={{fontWeight:700,fontSize:'0.875rem',color:item.col||'var(--text-bright)',fontFamily:item.mono?'var(--font-mono)':'var(--font)'}}>{item.val}</div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div style={{display:'flex',gap:'0.75rem',justifyContent:'flex-end'}}>
                <button className="btn btn-cyan" onClick={()=>{setTrackPlate(selectedAlert.plate_number);setSelectedAlert(null);setTab('map');}}>🗺️ Track on Map</button>
                <button className="btn btn-success" onClick={()=>doAck(selectedAlert.id)}>✓ Acknowledge</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Watchlist Modal ── */}
      {showWLModal && (
        <div className="modal-overlay" onClick={()=>setShowWLModal(false)}>
          <div className="modal-box" style={{maxWidth:'480px'}} onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">🎯 Add Watchlist Target</div>
              <button className="modal-close" onClick={()=>setShowWLModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              {formErr && <div className="banner banner-error" style={{marginBottom:'1rem'}}>⚠️ {formErr}</div>}
              <form onSubmit={doAddWL}>
                <div className="form-group">
                  <label className="form-label">License Plate Number *</label>
                  <input className="form-input" type="text" placeholder="GJ01AB1234" required
                    value={wlForm.plate_number} onChange={e=>setWlForm({...wlForm, plate_number:e.target.value.toUpperCase()})}
                    style={{fontFamily:'var(--font-mono)',fontWeight:700,fontSize:'1rem',letterSpacing:'0.08em'}} />
                  <div className="form-hint">Standard Indian format: GJ01AB1234</div>
                </div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-select" value={wlForm.category} onChange={e=>setWlForm({...wlForm, category:e.target.value as any})}>
                      <option value="stolen">🚗 Stolen Vehicle</option>
                      <option value="wanted">⚠️ Wanted Suspect</option>
                      <option value="missing">🔍 Missing Person</option>
                      <option value="blacklisted">🚫 Blacklisted</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select className="form-select" value={wlForm.priority} onChange={e=>setWlForm({...wlForm, priority:e.target.value as any})}>
                      <option value="CRITICAL">🔴 Critical</option>
                      <option value="HIGH">🟠 High</option>
                      <option value="MEDIUM">🟡 Medium</option>
                      <option value="LOW">🟢 Low</option>
                    </select>
                  </div>
                </div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Vehicle Make / Model</label>
                    <input className="form-input" type="text" placeholder="White Hyundai Creta" value={wlForm.vehicle_make_model||''} onChange={e=>setWlForm({...wlForm, vehicle_make_model:e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Color</label>
                    <input className="form-input" type="text" placeholder="White" value={wlForm.color||''} onChange={e=>setWlForm({...wlForm, color:e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">FIR / Case Notes</label>
                  <textarea className="form-textarea" rows={3} placeholder="FIR #4092, Navrangpura PS, Ahmedabad…" value={wlForm.description||''} onChange={e=>setWlForm({...wlForm, description:e.target.value})} />
                </div>
                <div style={{display:'flex',justifyContent:'flex-end',gap:'0.75rem'}}>
                  <button type="button" className="btn btn-ghost" onClick={()=>setShowWLModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-red" disabled={formLoading}>{formLoading?'Adding…':'🎯 Add to Watchlist'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Camera Modal ── */}
      {showCamModal && (
        <div className="modal-overlay" onClick={()=>setShowCamModal(false)}>
          <div className="modal-box" style={{maxWidth:'520px'}} onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">📹 Register CCTV Feed</div>
              <button className="modal-close" onClick={()=>setShowCamModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              {formErr && <div className="banner banner-error" style={{marginBottom:'1rem'}}>⚠️ {formErr}</div>}
              <form onSubmit={doAddCam}>
                <div className="form-group">
                  <label className="form-label">Quick Location Preset</label>
                  <select className="form-select" onChange={e=>{const p=GJ_PRESETS.find(x=>x.label===e.target.value);if(p) setCamForm(prev=>({...prev,location_name:p.label!=='Custom / Manual'?p.label:'',latitude:p.lat,longitude:p.lon}));}}>
                    <option value="">— Select Gujarat junction preset —</option>
                    {GJ_PRESETS.map(p=><option key={p.label} value={p.label}>{p.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Camera Name *</label>
                  <input className="form-input" type="text" required placeholder="SG Highway Iscon Junction" value={camForm.name} onChange={e=>setCamForm({...camForm, name:e.target.value})} />
                </div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Vendor</label>
                    <select className="form-select" value={camForm.vendor||''} onChange={e=>setCamForm({...camForm, vendor:e.target.value})}>
                      {['Hikvision','CP Plus','Dahua','Axis','Honeywell','Bosch','Generic ONVIF'].map(v=><option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Protocol</label>
                    <select className="form-select" value={camForm.protocol} onChange={e=>setCamForm({...camForm, protocol:e.target.value})}>
                      <option value="RTSP">RTSP (Live)</option>
                      <option value="ONVIF">ONVIF Profile S</option>
                      <option value="HTTP/HLS">HTTP / HLS</option>
                      <option value="FILE">Video File</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Stream URI (optional)</label>
                  <input className="form-input" type="text" placeholder="rtsp://192.168.1.x:554/ch0" value={camForm.stream_url} onChange={e=>setCamForm({...camForm, stream_url:e.target.value})} style={{fontFamily:'var(--font-mono)',fontSize:'0.8rem'}} />
                </div>
                <div className="form-group">
                  <label className="form-label">District / Location *</label>
                  <input className="form-input" type="text" required placeholder="SG Highway Junction, Ahmedabad" value={camForm.location_name} onChange={e=>setCamForm({...camForm, location_name:e.target.value})} />
                </div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Latitude (°N)</label>
                    <input className="form-input" type="number" step="0.0001" value={camForm.latitude} onChange={e=>setCamForm({...camForm, latitude:parseFloat(e.target.value)||0})} style={{fontFamily:'var(--font-mono)'}} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Longitude (°E)</label>
                    <input className="form-input" type="number" step="0.0001" value={camForm.longitude} onChange={e=>setCamForm({...camForm, longitude:parseFloat(e.target.value)||0})} style={{fontFamily:'var(--font-mono)'}} />
                  </div>
                </div>
                <div style={{display:'flex',justifyContent:'flex-end',gap:'0.75rem',marginTop:'0.25rem'}}>
                  <button type="button" className="btn btn-ghost" onClick={()=>setShowCamModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-cyan" disabled={formLoading}>{formLoading?'Registering…':'📹 Register Camera'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
