import type { AnalysisResults, AnalysisJob } from '../../../types/analysis';
import type { 
  ProcessedAnalysisData, 
  FeatureData, 
  TimeSeriesData,
  SegmentData,
  Section,
  StemData 
} from '../types';

export function processAnalysisData(
  results: AnalysisResults, 
  jobStatus: AnalysisJob
): ProcessedAnalysisData {
  const features = new Map<string, FeatureData>();
  const sections: Section[] = [];
  const stems: StemData[] = [];

  // Process sections from analysis summary
  if (results.analysis_summary?.sections) {
    results.analysis_summary.sections.forEach((section, index) => {
      sections.push({
        id: `section-${index}`,
        start: section.start,
        end: section.end,
        type: mapSectionType(section.label),
        label: section.label,
        confidence: section.confidence,
      });
    });
  }

  // Process features by stem
  if (results.features_by_stem) {
    // Process mix features
    const mixFeatures = results.features_by_stem.mix;
    if (mixFeatures) {
      // Process each feature type
      Object.entries(mixFeatures).forEach(([featureName, featureData]) => {
        const featureKey = featureName.toLowerCase().replace(/\s+/g, '_');
        
        // Special handling for band_energy which has a different structure
        if (featureKey === 'band_energy' && typeof featureData.values === 'object' && !Array.isArray(featureData.values)) {
          features.set(featureKey, {
            name: featureName,
            type: 'energy',
            data: {
              timestamps: featureData.times,
              values: featureData.values, // Keep as object with band arrays
            },
            metadata: {
              description: 'Multi-band energy analysis',
              range: [0, 1], // Band energy is typically normalized
              average: 0.5,
              defaultVisualization: 'line',
            },
          });
        } else {
          // Standard feature processing
          features.set(featureKey, {
            name: featureName,
            type: categorizeFeatureType(featureName),
            data: {
              timestamps: featureData.times,
              values: featureData.values,
            },
            metadata: {
              description: `${featureName} analysis`,
              range: [featureData.statistics.min, featureData.statistics.max],
              average: featureData.statistics.mean,
              defaultVisualization: 'line',
            },
          });
        }
      });
    }

    // Process individual stems
    Object.entries(results.features_by_stem).forEach(([stemName, stemFeatures]) => {
      if (stemName === 'mix') return; // Already processed
      
      const processedFeatures = new Map<string, FeatureData>();
      
      Object.entries(stemFeatures).forEach(([featureName, featureData]) => {
        const featureKey = featureName.toLowerCase().replace(/\s+/g, '_');
        processedFeatures.set(featureKey, {
          name: `${stemName} ${featureName}`,
          type: categorizeFeatureType(featureName),
          data: {
            timestamps: featureData.times,
            values: featureData.values,
          },
          metadata: {
            description: `${featureName} for ${stemName}`,
            range: [featureData.statistics.min, featureData.statistics.max],
            average: featureData.statistics.mean,
            defaultVisualization: 'line',
          },
        });
      });

      stems.push({
        id: stemName,
        name: stemName.charAt(0).toUpperCase() + stemName.slice(1),
        type: stemName as StemData['type'],
        audioUrl: analysisApi.getAudioUrl(jobStatus.job_id, stemName),
        features: processedFeatures,
        isAvailable: true,
      });
    });
  }

  return {
    id: jobStatus.job_id,
    fileName: jobStatus.file_name,
    duration: results.track?.duration || results.analysis_summary?.duration || 0,
    audioUrl: analysisApi.getAudioUrl(jobStatus.job_id),
    features,
    stems,
    sections,
    metadata: {
      analyzedAt: jobStatus.created_at,
      processingTime: 0, // Not available in current API
      version: '2.0',
      key: results.analysis_summary?.key,
      tempo: results.analysis_summary?.tempo,
      timeSignature: results.analysis_summary?.time_signature,
    },
  };
}

// Helper functions
function categorizeFeatureType(featureName: string): FeatureData['type'] {
  const name = featureName.toLowerCase();
  if (name.includes('tempo') || name.includes('bpm')) return 'tempo';
  if (name.includes('energy') || name.includes('loudness')) return 'energy';
  if (name.includes('spectral') || name.includes('brightness') || name.includes('centroid')) return 'spectral';
  if (name.includes('chord') || name.includes('key') || name.includes('harmonic')) return 'harmonic';
  if (name.includes('section') || name.includes('structure')) return 'structural';
  if (name.includes('mood') || name.includes('emotion') || name.includes('valence')) return 'emotional';
  return 'energy'; // default
}

function convertToTimeSeries(data: unknown): TimeSeriesData {
  if (!data) {
    return { timestamps: [], values: [] };
  }

  // Type guard for time series data structure
  if (
    typeof data === 'object' && 
    data !== null &&
    'timestamps' in data && 
    'values' in data
  ) {
    const tsData = data as Record<string, unknown>;
    if (Array.isArray(tsData.timestamps) && Array.isArray(tsData.values)) {
      return {
        timestamps: tsData.timestamps as number[],
        values: tsData.values as number[],
        confidence: Array.isArray(tsData.confidence) ? tsData.confidence as number[] : undefined,
        units: typeof tsData.units === 'string' ? tsData.units : undefined,
      };
    }
  }

  // Handle different data formats
  if (Array.isArray(data) && data.every(item => typeof item === 'number')) {
    return {
      timestamps: data.map((_, i) => i),
      values: data as number[],
    };
  }

  return { timestamps: [], values: [] };
}

function convertToSegments(data: { segments?: Array<{ start?: number; time?: number; end?: number; duration?: number; label?: string; value?: string; confidence?: number; color?: string }> }): SegmentData {
  if (!data || !data.segments) {
    return { segments: [] };
  }

  return {
    segments: data.segments.map((seg) => {
      const start = seg.start ?? seg.time ?? 0;
      return {
        start,
        end: seg.end ?? (start + (seg.duration ?? 1)),
        label: seg.label || seg.value || 'Unknown',
        confidence: seg.confidence || 0.8,
        color: seg.color,
      };
    }),
  };
}

function calculateAverage(values: number[]): number {
  if (!values || values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

function mapSectionType(label: string): Section['type'] {
  const labelLower = label.toLowerCase();
  if (labelLower.includes('intro')) return 'intro';
  if (labelLower.includes('verse')) return 'verse';
  if (labelLower.includes('chorus')) return 'chorus';
  if (labelLower.includes('bridge')) return 'bridge';
  if (labelLower.includes('outro')) return 'outro';
  if (labelLower.includes('break')) return 'break';
  if (labelLower.includes('instrumental')) return 'instrumental';
  return 'verse'; // default
}

// Import analysisApi for audio URLs
import { analysisApi } from '../api/analysisApi';

// Export helper functions for potential future use
export { convertToTimeSeries, convertToSegments, calculateAverage };

// Data alignment utilities
export function alignTimeSeriesData(features: FeatureData[]): FeatureData[] {
  if (features.length === 0) return features;

  // Find the common time range
  let minTime = Infinity;
  let maxTime = -Infinity;
  let maxPoints = 0;

  features.forEach(feature => {
    if (feature.data && 'timestamps' in feature.data) {
      const timestamps = feature.data.timestamps;
      if (timestamps.length > 0) {
        minTime = Math.min(minTime, timestamps[0]);
        maxTime = Math.max(maxTime, timestamps[timestamps.length - 1]);
        maxPoints = Math.max(maxPoints, timestamps.length);
      }
    }
  });

  // Align all features to the same time grid
  return features.map(feature => {
    if (feature.data && 'timestamps' in feature.data) {
      // Interpolate to common time grid if needed
      // For now, return as-is
      return feature;
    }
    return feature;
  });
}

// Data decimation for performance
export function decimateData(data: TimeSeriesData, targetPoints: number): TimeSeriesData {
  if (data.timestamps.length <= targetPoints) {
    return data;
  }

  const factor = Math.ceil(data.timestamps.length / targetPoints);
  const decimatedTimestamps: number[] = [];
  const decimatedValues: number[] = [];
  const decimatedConfidence: number[] = [];

  for (let i = 0; i < data.timestamps.length; i += factor) {
    decimatedTimestamps.push(data.timestamps[i]);
    decimatedValues.push(data.values[i]);
    if (data.confidence) {
      decimatedConfidence.push(data.confidence[i]);
    }
  }

  return {
    timestamps: decimatedTimestamps,
    values: decimatedValues,
    confidence: decimatedConfidence.length > 0 ? decimatedConfidence : undefined,
    units: data.units,
  };
}