import { create } from 'zustand';
import type { PlaybackState } from '../types';

interface PlaybackStore extends PlaybackState {
  // Actions
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  seek: (time: number) => void;
  setDuration: (duration: number) => void;
  updateCurrentTime: (time: number) => void;
  setPlaybackRate: (rate: number) => void;
  setVolume: (volume: number) => void;
  setLoop: (enable: boolean, start?: number, end?: number) => void;
  toggleStem: (stemId: string) => void;
  muteStem: (stemId: string) => void;
  unmuteStem: (stemId: string) => void;
  setSoloStem: (stemId: string | null) => void;
  reset: () => void;
  
  // Callbacks for external players
  onPlayCallback?: () => void;
  onPauseCallback?: () => void;
  onSeekCallback?: (time: number) => void;
  setPlayCallback: (callback: () => void) => void;
  setPauseCallback: (callback: () => void) => void;
  setSeekCallback: (callback: (time: number) => void) => void;
}

const initialState: PlaybackState = {
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  playbackRate: 1,
  volume: 0.8,
  loop: false,
  loopStart: 0,
  loopEnd: 0,
  selectedStems: ['vocals', 'drums', 'bass', 'other'],
  mutedStems: [],
  soloStem: null,
};

export const usePlaybackStore = create<PlaybackStore>((set, get) => ({
  ...initialState,

  play: () => {
    set({ isPlaying: true });
    get().onPlayCallback?.();
  },

  pause: () => {
    set({ isPlaying: false });
    get().onPauseCallback?.();
  },

  togglePlayPause: () => {
    const { isPlaying } = get();
    if (isPlaying) {
      get().pause();
    } else {
      get().play();
    }
  },

  seek: (time: number) => {
    set({ currentTime: time });
    get().onSeekCallback?.(time);
  },

  setDuration: (duration: number) => {
    set({ duration });
  },

  updateCurrentTime: (time: number) => {
    const { loop, loopEnd, loopStart } = get();
    
    // Handle looping
    if (loop && loopEnd > loopStart && time >= loopEnd) {
      get().seek(loopStart);
    } else {
      set({ currentTime: time });
    }
  },

  setPlaybackRate: (rate: number) => {
    set({ playbackRate: Math.max(0.25, Math.min(2, rate)) });
  },

  setVolume: (volume: number) => {
    set({ volume: Math.max(0, Math.min(1, volume)) });
  },

  setLoop: (enable: boolean, start?: number, end?: number) => {
    const updates: Partial<PlaybackState> = { loop: enable };
    if (start !== undefined) updates.loopStart = start;
    if (end !== undefined) updates.loopEnd = end;
    set(updates);
  },

  toggleStem: (stemId: string) => {
    const { selectedStems } = get();
    if (selectedStems.includes(stemId)) {
      set({ selectedStems: selectedStems.filter(id => id !== stemId) });
    } else {
      set({ selectedStems: [...selectedStems, stemId] });
    }
  },

  muteStem: (stemId: string) => {
    const { mutedStems } = get();
    if (!mutedStems.includes(stemId)) {
      set({ mutedStems: [...mutedStems, stemId] });
    }
  },

  unmuteStem: (stemId: string) => {
    const { mutedStems } = get();
    set({ mutedStems: mutedStems.filter(id => id !== stemId) });
  },

  setSoloStem: (stemId: string | null) => {
    set({ soloStem: stemId });
  },

  reset: () => {
    set(initialState);
  },

  // Callback setters
  setPlayCallback: (callback: () => void) => {
    set({ onPlayCallback: callback });
  },

  setPauseCallback: (callback: () => void) => {
    set({ onPauseCallback: callback });
  },

  setSeekCallback: (callback: (time: number) => void) => {
    set({ onSeekCallback: callback });
  },
}));

// Selector hooks for common use cases
export const useIsPlaying = () => usePlaybackStore(state => state.isPlaying);
export const useCurrentTime = () => usePlaybackStore(state => state.currentTime);
export const useDuration = () => usePlaybackStore(state => state.duration);
export const useVolume = () => usePlaybackStore(state => state.volume);
export const usePlaybackRate = () => usePlaybackStore(state => state.playbackRate);
export const useActiveStem = () => {
  const { selectedStems, mutedStems, soloStem } = usePlaybackStore(state => ({
    selectedStems: state.selectedStems,
    mutedStems: state.mutedStems,
    soloStem: state.soloStem,
  }));

  // If a stem is soloed, only that stem is active
  if (soloStem) {
    return [soloStem];
  }

  // Otherwise, return selected stems that aren't muted
  return selectedStems.filter(stem => !mutedStems.includes(stem));
};