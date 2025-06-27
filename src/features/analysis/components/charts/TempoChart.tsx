import { useMemo } from 'react';
import type { ChartConfiguration } from 'chart.js';
import { BaseChart } from './BaseChart';
import type { FeatureData } from '../../types';
import { decimateData } from '../../utils/dataDecimation';

interface TempoChartProps {
  data: FeatureData | null;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  height?: number;
  className?: string;
}

interface TimeSeriesTempoData {
  timestamps: number[];
  values: number[];
  confidence?: number[];
}

// Type guard for tempo data structure
function isTimeSeriesTempoData(data: unknown): data is TimeSeriesTempoData {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;
  return Array.isArray(obj.timestamps) && Array.isArray(obj.values);
}


// Common BPM gridlines
const COMMON_BPMS = [60, 80, 100, 120, 140, 160, 180];

export function TempoChart({
  data,
  currentTime,
  duration,
  onSeek,
  height = 300,
  className = '',
}: TempoChartProps) {
  const chartConfig = useMemo<ChartConfiguration<'line'>>(() => {
    if (!data || !data.data) {
      return {
        type: 'line',
        data: { datasets: [] },
      };
    }

    const datasets = [];
    
    // Check if we have time series data with tempo values
    if (isTimeSeriesTempoData(data.data)) {
      const timeSeriesData = data.data;
      
      // Decimate for performance
      const decimated = decimateData(timeSeriesData.timestamps, timeSeriesData.values, {
        targetPoints: 500,
        method: 'lttb',
      });
      
      // Main tempo line
      const tempoData = decimated.times.map((time, i) => ({
        x: time,
        y: decimated.values[i],
      }));

      datasets.push({
        label: 'Tempo (BPM)',
        data: tempoData,
        borderColor: 'rgba(124, 58, 237, 0.8)',
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.2,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointBackgroundColor: 'rgba(124, 58, 237, 0.8)',
      });

      // Add confidence bands if available
      if (timeSeriesData.confidence && Array.isArray(timeSeriesData.confidence)) {
        const confidenceDecimated = decimateData(
          timeSeriesData.timestamps, 
          timeSeriesData.confidence,
          { targetPoints: 500, method: 'lttb' }
        );

        // Upper confidence band
        const upperBand = decimated.times.map((time, i) => {
          const confidence = confidenceDecimated.values[i] || 0.8;
          const variance = (1 - confidence) * 10; // Convert confidence to BPM variance
          return {
            x: time,
            y: decimated.values[i] + variance,
          };
        });

        // Lower confidence band
        const lowerBand = decimated.times.map((time, i) => {
          const confidence = confidenceDecimated.values[i] || 0.8;
          const variance = (1 - confidence) * 10;
          return {
            x: time,
            y: Math.max(30, decimated.values[i] - variance), // Min 30 BPM
          };
        });

        // Add confidence band as a filled area
        datasets.push({
          label: 'Confidence Range',
          data: upperBand,
          borderColor: 'transparent',
          backgroundColor: 'rgba(124, 58, 237, 0.1)',
          fill: '+1', // Fill to next dataset
          pointRadius: 0,
          pointHoverRadius: 0,
        });

        datasets.push({
          label: 'Lower Bound',
          data: lowerBand,
          borderColor: 'transparent',
          backgroundColor: 'transparent',
          fill: false,
          pointRadius: 0,
          pointHoverRadius: 0,
          showLine: false,
        });
      }
    }

    return {
      type: 'line',
      data: { datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                if (context.datasetIndex === 0) {
                  return `Tempo: ${context.parsed.y.toFixed(1)} BPM`;
                }
                return '';
              },
            },
            filter: (item) => item.datasetIndex === 0, // Only show main tempo line
          },
          annotation: {
            annotations: {
              // Add horizontal lines for common BPMs
              ...COMMON_BPMS.reduce((acc, bpm) => ({
                ...acc,
                [`bpm${bpm}`]: {
                  type: 'line',
                  yMin: bpm,
                  yMax: bpm,
                  borderColor: 'rgba(0, 0, 0, 0.1)',
                  borderWidth: 1,
                  borderDash: [5, 5],
                },
              }), {}),
            },
          },
        },
        scales: {
          x: {
            type: 'linear',
            title: {
              display: true,
              text: 'Time',
            },
          },
          y: {
            title: {
              display: true,
              text: 'Tempo (BPM)',
            },
            min: 40,
            max: 200,
            ticks: {
              stepSize: 20,
              callback: (value: any) => `${value} BPM`,
            },
            grid: {
              color: (context) => {
                if (COMMON_BPMS.includes(context.tick.value)) {
                  return 'rgba(0, 0, 0, 0.15)';
                }
                return 'rgba(0, 0, 0, 0.05)';
              },
            },
          },
        },
      },
    };
  }, [data]);

  if (!data) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-50 rounded-lg`} style={{ height }}>
        <p className="text-gray-500">No tempo data available</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <BaseChart
        config={chartConfig}
        currentTime={currentTime}
        duration={duration}
        onSeek={onSeek}
        height={height}
        className="relative"
      />
      {/* BPM range indicator */}
      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
        <span>Slow (60-80)</span>
        <span>Moderate (80-120)</span>
        <span>Fast (120-140)</span>
        <span>Very Fast (140+)</span>
      </div>
    </div>
  );
}