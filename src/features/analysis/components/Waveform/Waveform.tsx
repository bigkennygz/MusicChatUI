import { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { usePlaybackStore } from '../../stores/playbackStore';
import { Card } from '@components/ui/Card';
import { syncManager } from '../../utils/syncManager';

interface WaveformProps {
  audioUrl: string;
  height?: number;
  waveColor?: string;
  progressColor?: string;
  cursorColor?: string;
  barWidth?: number;
  normalize?: boolean;
  onReady?: (wavesurfer: WaveSurfer) => void;
  onTimeUpdate?: (time: number) => void;
  onError?: (error: Error) => void;
}

export function Waveform({
  audioUrl,
  height = 128,
  waveColor = '#9333ea',
  progressColor = '#7c3aed',
  cursorColor = '#1f2937',
  barWidth = 2,
  normalize = true,
  onReady,
  onTimeUpdate,
  onError,
}: WaveformProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Playback store
  const {
    isPlaying,
    volume,
    playbackRate,
    setDuration,
    updateCurrentTime,
    setPlayCallback,
    setPauseCallback,
    setSeekCallback,
  } = usePlaybackStore();

  useEffect(() => {
    if (!containerRef.current) return;

    // Create WaveSurfer instance
    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor,
      progressColor,
      cursorColor,
      barWidth,
      normalize,
      height,
      interact: true,
      hideScrollbar: true,
      cursorWidth: 2,
      backend: 'WebAudio',
      mediaControls: false,
      plugins: [],
    });

    wavesurferRef.current = ws;

    // Set up event handlers
    ws.on('ready', () => {
      setIsLoading(false);
      setDuration(ws.getDuration());
      onReady?.(ws);
    });

    ws.on('audioprocess', (time) => {
      updateCurrentTime(time);
      syncManager.updateTime(time);
      onTimeUpdate?.(time);
    });

    ws.on('seeking', (currentTime) => {
      updateCurrentTime(currentTime);
      syncManager.updateTime(currentTime);
      onTimeUpdate?.(currentTime);
    });

    ws.on('error', (err) => {
      console.error('WaveSurfer error:', err);
      setError('Failed to load audio');
      setIsLoading(false);
      onError?.(new Error(String(err)));
    });

    // Set up playback callbacks
    setPlayCallback(() => ws.play());
    setPauseCallback(() => ws.pause());
    setSeekCallback((time) => ws.seekTo(time / ws.getDuration()));

    // Load audio
    ws.load(audioUrl);

    // Cleanup
    return () => {
      ws.destroy();
      wavesurferRef.current = null;
    };
  }, [audioUrl]); // Only recreate when URL changes

  // Sync playback state
  useEffect(() => {
    if (!wavesurferRef.current) return;
    
    if (isPlaying && !wavesurferRef.current.isPlaying()) {
      wavesurferRef.current.play();
    } else if (!isPlaying && wavesurferRef.current.isPlaying()) {
      wavesurferRef.current.pause();
    }
  }, [isPlaying]);

  // Sync volume
  useEffect(() => {
    if (!wavesurferRef.current) return;
    wavesurferRef.current.setVolume(volume);
  }, [volume]);

  // Sync playback rate
  useEffect(() => {
    if (!wavesurferRef.current) return;
    wavesurferRef.current.setPlaybackRate(playbackRate);
  }, [playbackRate]);

  if (error) {
    return (
      <Card className="flex items-center justify-center h-32 bg-red-50">
        <p className="text-red-600">{error}</p>
      </Card>
    );
  }

  return (
    <div className="relative w-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="text-sm text-gray-600">Loading waveform...</p>
          </div>
        </div>
      )}
      <div
        ref={containerRef}
        className="w-full"
        style={{ minHeight: height }}
      />
    </div>
  );
}