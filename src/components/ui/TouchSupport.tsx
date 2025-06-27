import { useEffect, useRef } from 'react';

interface TouchSupportProps {
  onSeek?: (time: number) => void;
  duration: number;
  children: React.ReactNode;
  className?: string;
}

export function TouchSupport({ onSeek, duration, children, className = '' }: TouchSupportProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !onSeek) return;

    let isDragging = false;

    const handleTouchStart = (e: TouchEvent) => {
      isDragging = true;
      e.preventDefault();
      handleTouchMove(e);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      
      const touch = e.touches[0];
      const rect = container.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, x / rect.width));
      const time = percentage * duration;
      
      onSeek(time);
    };

    const handleTouchEnd = () => {
      isDragging = false;
    };

    // Add touch event listeners
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSeek, duration]);

  return (
    <div ref={containerRef} className={`touch-manipulation select-none ${className}`}>
      {children}
    </div>
  );
}