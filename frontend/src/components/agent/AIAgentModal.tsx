'use client';

import React, { useState } from 'react';
import {
  Bot,
  X,
  Zap,
  Shield,
  Send,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Car,
  Navigation,
  FileText,
  Activity,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Camera, WatchlistEntry, Alert, DetectionEvent } from '../../types';

interface AIAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  cameras: Camera[];
  watchlist: WatchlistEntry[];
  alerts: Alert[];
  detections: DetectionEvent[];
  onTracePlate: (plate: string) => void;
  onOpenDossier: (plate: string) => void;
  onSimulateAlert: () => void;
  onSimulateRoute: () => void;
}

interface AgentMessage {
  id: string;
  sender: 'agent' | 'user';
  text: string;
  timestamp: string;
  actionType?: 'alert' | 'route' | 'dossier' | 'scan' | 'pcr';
  targetPlate?: string;
  data?: any;
}

export default function AIAgentModal({
  isOpen,
  onClose,
  cameras,
  watchlist,
  alerts,
  detections,
  onTracePlate,
  onOpenDossier,
  onSimulateAlert,
  onSimulateRoute
}: AIAgentModalProps) {
  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      id: 'init-1',
      sender: 'agent',
      text: 'Namaste Officer. I am the Sentinel Autonomous Surveillance Agent. I am monitoring all 33 Gujarat Police CCTV nodes in real-time. How can I assist your tactical operations today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  if (!isOpen) return null;

  const handleSend = (textToSend?: string) => {
    const q = (textToSend || inputValue).trim();
    if (!q) return;

    const userMsg: AgentMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsThinking(true);

    setTimeout(() => {
      processAgentQuery(q);
      setIsThinking(false);
    }, 600);
  };

  const processAgentQuery = (query: string) => {
    const q = query.toLowerCase();
    let reply: AgentMessage;

    if (q.includes('scan') || q.includes('threat') || q.includes('status')) {
      const activeTargets = watchlist.filter(w => w.is_active);
      const matchedAlerts = alerts.filter(a => a.severity === 'CRITICAL' || a.severity === 'HIGH');
      reply = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: `Network Scan Complete: Screened 33 active camera nodes. Found ${matchedAlerts.length} active watchlist alerts and ${activeTargets.length} active suspect vehicles registered under state FIRs. Primary target GJ01TA8821 was spotted at SG Highway Junction.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionType: 'alert',
        targetPlate: 'GJ01TA8821'
      };
    } else if (q.includes('pcr') || q.includes('intercept') || q.includes('dispatch')) {
      reply = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: 'Tactical Intercept Recommended: Target GJ01TA8821 is heading North-East towards Gandhinagar at 84 km/h. Recommend dispatching PCR Cheetah-04 from Pakwan Crossroad for rolling barricade.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionType: 'pcr',
        targetPlate: 'GJ01TA8821'
      };
    } else if (q.includes('dossier') || q.includes('65b') || q.includes('evidence') || q.includes('court')) {
      reply = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: 'Cryptographic Audit: All detection snapshots are signed with Section 65B SHA-256 integrity hashes. Official courtroom forensic dossier is ready for export.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionType: 'dossier',
        targetPlate: 'GJ01TA8821'
      };
    } else if (q.includes('route') || q.includes('trace') || q.includes('map') || q.includes('track')) {
      reply = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: 'Corridor Trajectory Reconstructed: Vehicle GJ01TA8821 tracked across 5 checkpoints: Vastrapur Lake → Janpath Circle → Paldi → SG Highway → Gandhinagar. Speed range: 58-84 km/h.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionType: 'route',
        targetPlate: 'GJ01TA8821'
      };
    } else {
      reply = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: `Analysis completed for "${query}". I have cross-referenced the optical detections and watchlist database across all 33 Gujarat Police camera sectors. No conflicting records found.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionType: 'scan',
        targetPlate: 'GJ01TA8821'
      };
    }

    setMessages(prev => [...prev, reply]);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '680px',
          height: '620px',
          background: '#FFFFFF',
          borderRadius: '24px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1.5px solid #D1E7DD'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.1rem 1.4rem',
            background: 'linear-gradient(135deg, #065F46 0%, #047857 100%)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            >
              <Bot size={22} style={{ color: '#A7F3D0' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.01em' }}>
                  Sentinel Autonomous AI Agent
                </span>
                <span
                  style={{
                    background: '#10B981',
                    color: '#FFFFFF',
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    letterSpacing: '0.04em'
                  }}
                >
                  ONLINE · 33 NODES
                </span>
              </div>
              <div style={{ fontSize: '0.74rem', opacity: 0.85, marginTop: '2px' }}>
                Real-Time Surveillance Copilot & Tactical Dispatch Assistant
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              color: '#FFFFFF',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Tactical Prompt Chips */}
        <div
          style={{
            padding: '0.75rem 1.25rem',
            background: '#F0FDF4',
            borderBottom: '1px solid #DCFCE7',
            display: 'flex',
            gap: '0.5rem',
            overflowX: 'auto',
            whiteSpace: 'nowrap'
          }}
        >
          <button
            onClick={() => handleSend('Scan all 33 feeds for watchlist targets')}
            style={{
              padding: '5px 12px',
              borderRadius: '9999px',
              background: '#FFFFFF',
              border: '1px solid #10B981',
              color: '#065F46',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Activity size={12} style={{ color: '#10B981' }} />
            <span>🔍 Threat Scan</span>
          </button>

          <button
            onClick={() => handleSend('Suggest PCR patrol intercept plan')}
            style={{
              padding: '5px 12px',
              borderRadius: '9999px',
              background: '#FFFFFF',
              border: '1px solid #3B82F6',
              color: '#1E40AF',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Radio size={12} style={{ color: '#3B82F6' }} />
            <span>🚨 Intercept Plan</span>
          </button>

          <button
            onClick={() => handleSend('Trace cross-camera route for target')}
            style={{
              padding: '5px 12px',
              borderRadius: '9999px',
              background: '#FFFFFF',
              border: '1px solid #8B5CF6',
              color: '#5B21B6',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Navigation size={12} style={{ color: '#8B5CF6' }} />
            <span>🗺️ Corridor Route</span>
          </button>

          <button
            onClick={() => handleSend('Audit Section 65B forensic evidence')}
            style={{
              padding: '5px 12px',
              borderRadius: '9999px',
              background: '#FFFFFF',
              border: '1px solid #F59E0B',
              color: '#B45309',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Shield size={12} style={{ color: '#F59E0B' }} />
            <span>📄 Section 65B Dossier</span>
          </button>
        </div>

        {/* Message Log */}
        <div
          style={{
            flex: 1,
            padding: '1.25rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            background: '#FAFCFA'
          }}
        >
          {messages.map(m => (
            <div
              key={m.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start',
                gap: '4px'
              }}
            >
              <div
                style={{
                  maxWidth: '85%',
                  padding: '0.85rem 1.1rem',
                  borderRadius: m.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: m.sender === 'user' ? '#047857' : '#FFFFFF',
                  color: m.sender === 'user' ? '#FFFFFF' : '#1E293B',
                  boxShadow: m.sender === 'user' ? '0 4px 12px rgba(4, 120, 87, 0.25)' : '0 2px 8px rgba(0,0,0,0.06)',
                  border: m.sender === 'user' ? 'none' : '1px solid #E2E8F0',
                  fontSize: '0.84rem',
                  lineHeight: '1.45'
                }}
              >
                {m.text}

                {/* Rich Action Buttons attached to agent suggestions */}
                {m.sender === 'agent' && m.actionType && (
                  <div
                    style={{
                      marginTop: '0.75rem',
                      paddingTop: '0.65rem',
                      borderTop: '1px dashed #CBD5E1',
                      display: 'flex',
                      gap: '0.5rem',
                      flexWrap: 'wrap'
                    }}
                  >
                    {m.targetPlate && (
                      <button
                        onClick={() => {
                          onTracePlate(m.targetPlate!);
                          onClose();
                        }}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          background: '#EFF6FF',
                          border: '1px solid #BFDBFE',
                          color: '#1D4ED8',
                          fontSize: '0.73rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Navigation size={12} />
                        <span>Trace {m.targetPlate} on Map</span>
                      </button>
                    )}

                    {m.targetPlate && (
                      <button
                        onClick={() => {
                          onOpenDossier(m.targetPlate!);
                          onClose();
                        }}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          background: '#FEF3C7',
                          border: '1px solid #FDE68A',
                          color: '#92400E',
                          fontSize: '0.73rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <FileText size={12} />
                        <span>Export Legal Dossier</span>
                      </button>
                    )}

                    {m.actionType === 'pcr' && (
                      <button
                        onClick={() => {
                          onSimulateAlert();
                          onClose();
                        }}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          background: '#DCFCE7',
                          border: '1px solid #86EFAC',
                          color: '#166534',
                          fontSize: '0.73rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Zap size={12} />
                        <span>Dispatch PCR Cheetah-04</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
              <span style={{ fontSize: '0.65rem', color: '#94A3B8', padding: '0 4px' }}>
                {m.timestamp}
              </span>
            </div>
          ))}

          {isThinking && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', fontSize: '0.76rem', fontWeight: 600 }}>
              <Bot size={14} className="animate-spin" />
              <span>Analyzing CCTV feeds & running neural inference…</span>
            </div>
          )}
        </div>

        {/* Input Footer */}
        <div
          style={{
            padding: '0.85rem 1.25rem',
            background: '#FFFFFF',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem'
          }}
        >
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask agent: e.g. 'Show suspect route' or 'Audit Section 65B hash'..."
            style={{
              flex: 1,
              padding: '0.65rem 1rem',
              borderRadius: '9999px',
              border: '1.5px solid #CBD5E1',
              fontSize: '0.84rem',
              color: '#1E293B',
              outline: 'none',
              background: '#F8FAFC'
            }}
          />
          <button
            onClick={() => handleSend()}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: '#047857',
              border: 'none',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 3px 8px rgba(4, 120, 87, 0.3)'
            }}
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
