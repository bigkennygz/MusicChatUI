// Extended types for analysis visualization

// Feature data structure for visualization
export interface FeatureData {
  name: string;
  type: 'tempo' | 'energy' | 'spectral' | 'harmonic' | 'structural' | 'emotional';
  data: TimeSeriesData | SegmentData | MatrixData;
  metadata: FeatureMetadata;
}

export interface TimeSeriesData {
  timestamps: number[];
  values: number[];
  confidence?: number[];
  units?: string;
}

export interface SegmentData {
  segments: Segment[];
}

export interface Segment {
  start: number;
  end: number;
  label: string;
  confidence: number;
  color?: string;
}

export interface MatrixData {
  matrix: number[][];
  xLabels?: string[];
  yLabels?: string[];
}

export interface FeatureMetadata {
  description: string;
  range: [number, number];
  average?: number;
  defaultVisualization: 'line' | 'bar' | 'heatmap' | 'segments';
}

// Processed analysis data for visualization
export interface ProcessedAnalysisData {
  id: string;
  fileName: string;
  duration: number;
  audioUrl: string;
  features: Map<string, FeatureData>;
  stems: StemData[];
  sections: Section[];
  metadata: AnalysisMetadata;
}

export interface StemData {
  id: string;
  name: string;
  type: 'vocals' | 'drums' | 'bass' | 'other' | 'piano' | 'guitar';
  audioUrl: string;
  features: Map<string, FeatureData>;
  isAvailable: boolean;
}

export interface Section {
  id: string;
  start: number;
  end: number;
  type: 'intro' | 'verse' | 'chorus' | 'bridge' | 'outro' | 'instrumental' | 'break';
  label: string;
  confidence: number;
}

export interface AnalysisMetadata {
  analyzedAt: string;
  processingTime: number;
  version: string;
  key?: string;
  tempo?: number;
  timeSignature?: string;
}

// Playback state
export interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  volume: number;
  loop: boolean;
  loopStart: number;
  loopEnd: number;
  selectedStems: string[];
  mutedStems: string[];
  soloStem: string | null;
}

// Visualization settings
export interface VisualizationSettings {
  timeRange: [number, number];
  zoomLevel: number;
  selectedFeatures: string[];
  chartTypes: Map<string, 'line' | 'bar' | 'heatmap'>;
  normalizeData: boolean;
  showConfidence: boolean;
  colorScheme: 'default' | 'colorblind' | 'highContrast';
}

// Timeline marker
export interface TimeMarker {
  id: string;
  time: number;
  label: string;
  type: 'user' | 'automatic' | 'section';
  color?: string;
}