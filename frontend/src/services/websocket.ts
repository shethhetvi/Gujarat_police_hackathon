type AlertCallback = (data: any) => void;

export type WsStatus = 'connecting' | 'connected' | 'disconnected';

class WebSocketService {
  private socket: WebSocket | null = null;
  private url: string;
  private listeners: AlertCallback[] = [];
  private statusListeners: ((status: WsStatus) => void)[] = [];
  private reconnectDelay = 2000;
  private maxReconnectDelay = 30000;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private intentionallyClosed = false;
  public status: WsStatus = 'disconnected';

  constructor() {
    this.url = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';
  }

  private setStatus(s: WsStatus) {
    this.status = s;
    this.statusListeners.forEach(cb => cb(s));
  }

  connect() {
    if (typeof window === 'undefined') return;
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) return;

    this.intentionallyClosed = false;
    this.setStatus('connecting');

    try {
      this.socket = new WebSocket(this.url);
    } catch (err) {
      this.setStatus('disconnected');
      this.scheduleReconnect();
      return;
    }

    this.socket.onopen = () => {
      this.setStatus('connected');
      this.reconnectDelay = 2000; // reset on success
    };

    this.socket.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        // Normalize event types: backend sends ALERT_TRIGGERED, frontend may expect NEW_ALERT
        if (parsed.event === 'ALERT_TRIGGERED' && parsed.alert) {
          this.listeners.forEach(cb => cb({ type: 'NEW_ALERT', alert: parsed.alert }));
        } else {
          this.listeners.forEach(cb => cb(parsed));
        }
      } catch (err) {
        console.error('[WebSocket] Parse error:', err);
      }
    };

    this.socket.onerror = () => {
      this.setStatus('disconnected');
    };

    this.socket.onclose = () => {
      this.setStatus('disconnected');
      if (!this.intentionallyClosed) {
        this.scheduleReconnect();
      }
    };
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectDelay = Math.min(this.reconnectDelay * 1.5, this.maxReconnectDelay);
      this.connect();
    }, this.reconnectDelay);
  }

  disconnect() {
    this.intentionallyClosed = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.socket?.close();
    this.setStatus('disconnected');
  }

  subscribe(callback: AlertCallback): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  onStatusChange(callback: (status: WsStatus) => void): () => void {
    this.statusListeners.push(callback);
    return () => {
      this.statusListeners = this.statusListeners.filter(cb => cb !== callback);
    };
  }
}

export const wsService = new WebSocketService();
