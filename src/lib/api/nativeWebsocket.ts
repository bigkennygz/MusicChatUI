import { authStore } from '@features/auth/stores/authStore';

interface WebSocketMessage {
  type: 'progress' | 'job_complete' | 'error';
  data?: {
    percentage?: number;
    current_activity?: string;
    current_stage?: string;
    processing_rate?: string;
    estimated_time_remaining?: number;
    track_id?: string;
    error?: string;
  };
}

export class NativeWebSocketManager {
  private connections: Map<string, WebSocket> = new Map();
  private reconnectDelays: Map<string, number> = new Map();
  private handlers: Map<string, (message: WebSocketMessage) => void> = new Map();
  private shouldReconnect: Map<string, boolean> = new Map();

  subscribe(jobId: string, onMessage: (message: WebSocketMessage) => void): void {
    // Store the handler
    this.handlers.set(jobId, onMessage);
    this.shouldReconnect.set(jobId, true);
    
    // Create connection
    this.connect(jobId);
  }

  unsubscribe(jobId: string): void {
    this.shouldReconnect.set(jobId, false);
    const ws = this.connections.get(jobId);
    if (ws) {
      ws.close();
      this.connections.delete(jobId);
    }
    this.handlers.delete(jobId);
    this.reconnectDelays.delete(jobId);
  }

  private connect(jobId: string): void {
    const baseUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';
    const token = authStore.getState().accessToken;
    
    if (!token) {
      console.error(`Cannot connect WebSocket for job ${jobId}: No auth token available`);
      return;
    }
    
    // Construct WebSocket URL with auth token in query params (as per API docs)
    const wsUrl = `${baseUrl}/ws/analyze/${jobId}?token=${token}`;
    
    console.log(`Connecting to WebSocket: ${baseUrl}/ws/analyze/${jobId}?token=***`);
    
    const ws = new WebSocket(wsUrl);
    this.connections.set(jobId, ws);

    ws.onopen = () => {
      console.log(`WebSocket connected for job ${jobId}`);
      // Reset reconnect delay on successful connection
      this.reconnectDelays.set(jobId, 1000);
      // No need to send auth message - token is in query params
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage;
        const handler = this.handlers.get(jobId);
        if (handler) {
          handler(message);
        }

        // Close connection if job is complete or errored
        if (message.type === 'job_complete' || message.type === 'error') {
          this.shouldReconnect.set(jobId, false);
          this.unsubscribe(jobId);
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error(`WebSocket error for job ${jobId}:`, error);
    };

    ws.onclose = () => {
      console.log(`WebSocket closed for job ${jobId}`);
      this.connections.delete(jobId);
      
      // Reconnect if needed
      if (this.shouldReconnect.get(jobId)) {
        const delay = this.reconnectDelays.get(jobId) || 1000;
        console.log(`Reconnecting WebSocket for job ${jobId} in ${delay}ms`);
        
        setTimeout(() => {
          if (this.shouldReconnect.get(jobId)) {
            this.connect(jobId);
          }
        }, delay);
        
        // Exponential backoff, max 30 seconds
        this.reconnectDelays.set(jobId, Math.min(delay * 2, 30000));
      }
    };
  }

  isConnected(jobId: string): boolean {
    const ws = this.connections.get(jobId);
    return ws?.readyState === WebSocket.OPEN;
  }
}

// Export singleton instance
export const nativeWsManager = new NativeWebSocketManager();