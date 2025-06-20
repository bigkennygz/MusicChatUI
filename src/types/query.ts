import type { StemType } from './analysis';

export interface QueryRequest {
  track_id: string;
  query: string;
  stem?: StemType;
  feature_filters?: string[];
}

export interface QueryResult {
  query_id: string;
  segments: TimeSegment[];
  confidence: number;
  explanation: string;
}

export interface TimeSegment {
  start: number;
  end: number;
  label: string;
  confidence: number;
  features: Record<string, number>;
}