import { useState } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2,
  VolumeX,
  RotateCcw
} from 'lucide-react';
import { Button } from '@components/ui/Button';
import { usePlaybackStore } from '../../stores/playbackStore';
import { cn } from '@lib/utils';

interface PlaybackControlsProps {
  className?: string;
  showVolumeControl?: boolean;
  showSpeedControl?: boolean;
  showLoopControl?: boolean;
}

export function PlaybackControls({
  className,
  showVolumeControl = true,
  showSpeedControl = true,
  showLoopControl = true,
}: PlaybackControlsProps) {
  const {
    isPlaying,
    currentTime,
    duration,
    volume,
    playbackRate,
    loop,
    togglePlayPause,
    seek,
    setVolume,
    setPlaybackRate,
    setLoop,
  } = usePlaybackStore();

  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(volume);

  // Format time display
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Skip forward/backward
  const skipTime = (seconds: number) => {
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    seek(newTime);
  };

  // Toggle mute
  const toggleMute = () => {
    if (volume > 0) {
      setPreviousVolume(volume);
      setVolume(0);
    } else {
      setVolume(previousVolume || 0.8);
    }
  };

  const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 2];

  return (
    <div className={cn('flex items-center gap-4 p-4 bg-white rounded-lg', className)}>
      {/* Play/Pause and Skip Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => skipTime(-10)}
          className="h-8 w-8 p-0"
          title="Skip back 10s"
        >
          <SkipBack className="h-4 w-4" />
        </Button>

        <Button
          variant="primary"
          size="sm"
          onClick={togglePlayPause}
          className="h-10 w-10 p-0 rounded-full"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5 ml-0.5" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => skipTime(10)}
          className="h-8 w-8 p-0"
          title="Skip forward 10s"
        >
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>

      {/* Time Display */}
      <div className="flex items-center gap-2 text-sm font-mono">
        <span className="text-gray-700">{formatTime(currentTime)}</span>
        <span className="text-gray-400">/</span>
        <span className="text-gray-500">{formatTime(duration)}</span>
      </div>

      {/* Volume Control */}
      {showVolumeControl && (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMute}
            className="h-8 w-8 p-0"
            title={volume === 0 ? 'Unmute' : 'Mute'}
          >
            {volume === 0 ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-20 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #7c3aed 0%, #7c3aed ${volume * 100}%, #e5e7eb ${volume * 100}%, #e5e7eb 100%)`,
            }}
          />
        </div>
      )}

      {/* Speed Control */}
      {showSpeedControl && (
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSpeedMenu(!showSpeedMenu)}
            className="h-8 px-2 text-xs font-mono"
            title="Playback speed"
          >
            {playbackRate}x
          </Button>
          {showSpeedMenu && (
            <div className="absolute bottom-full mb-2 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10">
              {playbackRates.map((rate) => (
                <button
                  key={rate}
                  onClick={() => {
                    setPlaybackRate(rate);
                    setShowSpeedMenu(false);
                  }}
                  className={cn(
                    'block w-full px-3 py-1 text-sm text-left hover:bg-gray-100',
                    playbackRate === rate && 'bg-purple-100 text-purple-700'
                  )}
                >
                  {rate}x
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Loop Control */}
      {showLoopControl && (
        <Button
          variant={loop ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setLoop(!loop)}
          className="h-8 w-8 p-0"
          title={loop ? 'Disable loop' : 'Enable loop'}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}