import { io, Socket } from 'socket.io-client';
import { authStore } from '@features/auth/stores/authStore';

interface WebSocketConfig {
  url?: string;
  reconnectAttempts?: number;
  reconnectDelay?: number;
}

type EventHandler = (...args: unknown[]) => void;

export class WebSocketManager {
  private static instance: WebSocketManager | null = null;
  private socket: Socket | null = null;
  private config: Required<WebSocketConfig>;
  private eventHandlers: Map<string, Set<EventHandler>> = new Map();

  private constructor(config: WebSocketConfig = {}) {
    this.config = {
      url: config.url || import.meta.env.VITE_WS_URL || 'http://localhost:8000',
      reconnectAttempts: config.reconnectAttempts || 5,
      reconnectDelay: config.reconnectDelay || 1000,
    };
  }

  static getInstance(config?: WebSocketConfig): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager(config);
    }
    return WebSocketManager.instance;
  }

  connect(): void {
    if (this.socket?.connected) {
      return;
    }

    const token = authStore.getState().accessToken;
    if (!token) {
      console.error('Cannot connect WebSocket: No auth token available');
      return;
    }

    this.socket = io(this.config.url, {
      auth: {
        token,
      },
      reconnection: true,
      reconnectionAttempts: this.config.reconnectAttempts,
      reconnectionDelay: this.config.reconnectDelay,
      transports: ['websocket'],
    });

    this.setupDefaultHandlers();
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, handler: EventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);

    if (this.socket) {
      this.socket.on(event, handler);
    }
  }

  off(event: string, handler: EventHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.eventHandlers.delete(event);
      }
    }

    if (this.socket) {
      this.socket.off(event, handler);
    }
  }

  emit(event: string, ...args: unknown[]): void {
    if (this.socket?.connected) {
      this.socket.emit(event, ...args);
    } else {
      console.warn(`Cannot emit event '${event}': WebSocket not connected`);
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  private setupDefaultHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      // Re-register all handlers
      this.eventHandlers.forEach((handlers, event) => {
        handlers.forEach(handler => {
          this.socket!.on(event, handler);
        });
      });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  }
}

// Export singleton instance getter
export const getWebSocketManager = (config?: WebSocketConfig): WebSocketManager => {
  return WebSocketManager.getInstance(config);
};

// Export a default instance for backward compatibility
export const wsManager = WebSocketManager.getInstance();