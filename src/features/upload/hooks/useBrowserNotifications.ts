import { useEffect, useCallback } from 'react';

export function useBrowserNotifications() {
  useEffect(() => {
    // Request permission on mount
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const notify = useCallback((title: string, body: string, options?: {
    icon?: string;
    tag?: string;
    requireInteraction?: boolean;
    onClick?: () => void;
  }) => {
    if (!('Notification' in window)) {
      console.warn('Browser notifications not supported');
      return;
    }

    if (Notification.permission !== 'granted') {
      console.warn('Browser notification permission not granted');
      return;
    }

    const notification = new Notification(title, {
      body,
      icon: options?.icon || '/icon-192.png',
      tag: options?.tag,
      requireInteraction: options?.requireInteraction,
    });

    if (options?.onClick) {
      notification.onclick = () => {
        options.onClick?.();
        notification.close();
        window.focus();
      };
    }

    return notification;
  }, []);

  return {
    notify,
    permission: 'Notification' in window ? Notification.permission : 'denied',
  };
}