import { useMemo } from 'react';
import type { ChartConfiguration } from 'chart.js';
import { BaseChart } from './BaseChart';
import type { FeatureData } from '../../types';
import { decimateData, decimateMultiDimensional } from '../../utils/dataDecimation';
import { transformBandEnergyData, ENERGY_BANDS } from '../../utils/bandEnergyTransform';

interface EnergyTimelineChartProps {
  data: FeatureData | null;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  height?: number;
  className?: string;
}

interface TimeSeriesEnergyData {
  timestamps: number[];
  values: number[];
}

// Type guard for single energy time series data
function isTimeSeriesEnergyData(data: unknown): data is TimeSeriesEnergyData {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;
  return Array.isArray(obj.timestamps) && Array.isArray(obj.values);
}

export function EnergyTimelineChart({
  data,
  currentTime,
  duration,
  onSeek,
  height = 300,
  className = '',
}: EnergyTimelineChartProps) {
  const chartConfig = useMemo<ChartConfiguration<'line'>>(() => {
    if (!data) {
      return {
        type: 'line',
        data: { datasets: [] },
      };
    }

    // Process multi-band energy data
    const datasets = [];
    
    // Try to transform band energy data first
    const bandEnergy = transformBandEnergyData(data);
    
    if (bandEnergy) {
      // Multi-band energy data - decimate for performance
      const decimated = decimateMultiDimensional(bandEnergy.times, bandEnergy.values, {
        targetPoints: 500,
        method: 'lttb',
      });
      
      // Create datasets for each band (4 bands from API)
      for (let bandIndex = 0; bandIndex < ENERGY_BANDS.length; bandIndex++) {
        const bandData = decimated.times.map((time, i) => ({
          x: time,
          y: decimated.values[i][bandIndex] || 0,
        }));

        datasets.push({
          label: ENERGY_BANDS[bandIndex].name,
          data: bandData,
          borderColor: ENERGY_BANDS[bandIndex].color,
          backgroundColor: ENERGY_BANDS[bandIndex].color.replace('0.8', '0.3'),
          fill: bandIndex === 0 ? 'origin' : '-1',
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 4,
          borderWidth: 2,
        });
      }
    } else if (data.data && isTimeSeriesEnergyData(data.data)) {
      // Fallback: Single energy value - decimate for performance
      const timeSeriesData = data.data;
      const decimated = decimateData(timeSeriesData.timestamps, timeSeriesData.values, {
        targetPoints: 500,
        method: 'lttb',
      });
      
      const singleData = decimated.times.map((time, i) => ({
        x: time,
        y: decimated.values[i],
      }));

      // Create a gradient effect with the single energy value
      datasets.push({
        label: 'Overall Energy',
        data: singleData,
        borderColor: 'rgba(124, 58, 237, 0.8)',
        backgroundColor: 'rgba(124, 58, 237, 0.3)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
        borderWidth: 2,
      });
    } else {
      console.error('Unable to process energy data:', data);
      return {
        type: 'line',
        data: { datasets: [] },
      };
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
            display: true,
            position: 'bottom',
            labels: {
              boxWidth: 12,
              padding: 8,
              font: {
                size: 11,
              },
            },
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: (context) => {
                const band = ENERGY_BANDS[context.datasetIndex];
                const value = context.parsed.y.toFixed(3);
                return band ? `${band.name} (${band.range}): ${value}` : `Energy: ${value}`;
              },
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
            stacked: true,
            title: {
              display: true,
              text: 'Energy',
            },
            min: 0,
            ticks: {
              callback: (value: any) => Number(value).toFixed(2),
            },
          },
        },
      },
    };
  }, [data]);

  if (!data) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-50 rounded-lg`} style={{ height }}>
        <p className="text-gray-500">No energy data available</p>
      </div>
    );
  }

  return (
    <BaseChart
      config={chartConfig}
      currentTime={currentTime}
      duration={duration}
      onSeek={onSeek}
      height={height}
      className={className}
    />
  );
}