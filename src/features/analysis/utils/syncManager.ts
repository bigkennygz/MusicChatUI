type TimeUpdateCallback = (time: number) => void;

export class SyncManager {
  private static instance: SyncManager | null = null;
  private subscribers: Set<TimeUpdateCallback> = new Set();
  private currentTime: number = 0;
  private rafId: number | null = null;
  
  private constructor() {}
  
  static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }
  
  subscribe(callback: TimeUpdateCallback): () => void {
    this.subscribers.add(callback);
    // Immediately call with current time
    callback(this.currentTime);
    
    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }
  
  updateTime(time: number): void {
    this.currentTime = time;
    this.notifySubscribers();
  }
  
  private notifySubscribers(): void {
    // Cancel any pending animation frame
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
    }
    
    // Use requestAnimationFrame for smooth updates
    this.rafId = requestAnimationFrame(() => {
      this.subscribers.forEach(callback => {
        callback(this.currentTime);
      });
      this.rafId = null;
    });
  }
  
  getCurrentTime(): number {
    return this.currentTime;
  }
  
  reset(): void {
    this.currentTime = 0;
    this.notifySubscribers();
  }
  
  destroy(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
    }
    this.subscribers.clear();
    this.currentTime = 0;
  }
}

// Export singleton instance
export const syncManager = SyncManager.getInstance();