type AlertCallback = (data: any) => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private url: string;
  private listeners: AlertCallback[] = [];

  constructor() {
    this.url = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';
  }

  connect() {
    if (typeof window === 'undefined') return;
    this.socket = new WebSocket(this.url);

    this.socket.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        this.listeners.forEach((listener) => listener(parsed));
      } catch (err) {
        console.error('Error parsing WebSocket frame:', err);
      }
    };

    this.socket.onclose = () => {
      setTimeout(() => this.connect(), 3000);
    };
  }

  subscribe(callback: AlertCallback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }
}

export const wsService = new WebSocketService();
