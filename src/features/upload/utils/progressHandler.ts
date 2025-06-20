import { wsManager } from '../../../lib/api/websocket';
import type { AnalysisProgress } from '../../../types/analysis';

export class ProgressHandler {
  private static instance: ProgressHandler;
  private subscribers = new Map<string, Set<(progress: AnalysisProgress) => void>>();

  static getInstance(): ProgressHandler {
    if (!ProgressHandler.instance) {
      ProgressHandler.instance = new ProgressHandler();
    }
    return ProgressHandler.instance;
  }

  subscribe(jobId: string, callback: (progress: AnalysisProgress) => void): () => void {
    if (!this.subscribers.has(jobId)) {
      this.subscribers.set(jobId, new Set());
      wsManager.emit('analyze:subscribe', { job_id: jobId });
    }

    this.subscribers.get(jobId)!.add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(jobId);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.subscribers.delete(jobId);
          wsManager.emit('analyze:unsubscribe', { job_id: jobId });
        }
      }
    };
  }

  handleProgress(jobId: string, progress: AnalysisProgress): void {
    const callbacks = this.subscribers.get(jobId);
    if (callbacks) {
      callbacks.forEach(callback => callback(progress));
    }
  }
}

export const progressHandler = ProgressHandler.getInstance();