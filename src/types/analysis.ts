export interface AnalysisJob {
  job_id: string;
  file_name: string;
  file_size: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  current_stage?: string;
  current_activity?: string;
  processing_rate?: string;
  estimated_time_remaining?: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  error_message?: string;
}

export interface AnalysisProgress {
  job_id: string;
  percentage: number;
  current_stage: string;
  current_activity: string;
  processing_rate: string;
  estimated_time_remaining: number;
}

export interface Track {
  id: string;
  title: string;
  artist?: string;
  album?: string;
  duration: number;
  file_path: string;
  file_size: number;
  sample_rate: number;
  bit_depth: number;
  channels: number;
  format: string;
  created_at: string;
  tags?: string[];
}

export interface AnalysisSummary {
  track_id: string;
  duration: number;
  key: string;
  mode: string;
  tempo: number;
  time_signature: string;
  loudness: number;
  energy: number;
  danceability: number;
  sections: Section[];
}

export interface Section {
  start: number;
  end: number;
  label: string;
  confidence: number;
}

export interface FeatureData {
  times: number[];
  values: number[];
  stem: StemType;
  feature_name: string;
  statistics: {
    mean: number;
    std: number;
    min: number;
    max: number;
  };
}

export type StemType = 'mix' | 'vocals' | 'drums' | 'bass' | 'other';

export interface AnalysisResults {
  track: Track;
  analysis_summary: AnalysisSummary;
  features_by_stem: Record<StemType, Record<string, FeatureData>>;
}