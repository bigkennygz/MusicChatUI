import { useRef, useEffect, useMemo } from 'react';
import type { ChartConfiguration, ChartType, Chart as ChartJS } from 'chart.js';
import { formatDuration } from '@/lib/utils/format';

export interface BaseChartProps<T extends ChartType = ChartType> {
  config: ChartConfiguration<T>;
  currentTime?: number;
  duration?: number;
  onSeek?: (time: number) => void;
  height?: number;
  className?: string;
}

export function BaseChart<T extends ChartType = ChartType>({
  config,
  currentTime = 0,
  duration = 0,
  onSeek,
  height = 200,
  className = '',
}: BaseChartProps<T>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartJS<T> | null>(null);

  // Common chart options
  const mergedConfig = useMemo(() => {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'nearest' as const,
        axis: 'x' as const,
        intersect: false,
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            title: (context: any) => {
              if (!context[0]?.parsed?.x) return '';
              const value = typeof context[0].parsed.x === 'number' ? context[0].parsed.x : 0;
              return formatDuration(value);
            },
          },
        },
      },
      scales: {
        x: {
          type: 'linear',
          min: 0,
          max: duration,
          ticks: {
            callback: (value: any) => formatDuration(typeof value === 'number' ? value : 0),
            maxTicksLimit: 10,
          },
          grid: {
            display: false,
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)',
          },
        },
      },
      onClick: (event: any, _elements: any, chart: any) => {
        if (!onSeek || !chart || !event.x) return;
        
        const canvasPosition = chart.canvas.getBoundingClientRect();
        const dataX = chart.scales.x.getValueForPixel(event.x - canvasPosition.left);
        
        if (typeof dataX === 'number' && dataX >= 0 && dataX <= duration) {
          onSeek(dataX);
        }
      },
    };

    return {
      ...config,
      options: {
        ...baseOptions,
        ...config.options,
        plugins: {
          ...baseOptions.plugins,
          ...(config.options?.plugins || {}),
        },
        scales: {
          ...baseOptions.scales,
          ...(config.options?.scales || {}),
        },
      },
    } as ChartConfiguration<T>;
  }, [config, duration, onSeek]);

  // Initialize chart
  useEffect(() => {
    if (!canvasRef.current) return;

    let mounted = true;

    // Dynamically import Chart.js to enable code splitting
    import('chart.js/auto').then((ChartModule) => {
      if (!mounted) return;
      
      const Chart = ChartModule.default;
      
      if (chartRef.current) {
        chartRef.current.destroy();
      }

      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;

      chartRef.current = new Chart(ctx, mergedConfig) as ChartJS<T>;
    }).catch((error) => {
      console.error('Failed to load Chart.js:', error);
    });

    return () => {
      mounted = false;
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [mergedConfig]);

  // Update chart data when config changes
  useEffect(() => {
    if (!chartRef.current) return;

    chartRef.current.data = mergedConfig.data;
    chartRef.current.update('none');
  }, [mergedConfig.data]);

  // Draw playback position indicator
  useEffect(() => {
    if (!chartRef.current || currentTime === undefined) return;

    const chart = chartRef.current;
    
    // Store original draw function
    const originalDraw = chart.draw.bind(chart);
    
    // Override draw to add playback indicator
    chart.draw = function() {
      originalDraw();
      
      const ctx = this.ctx;
      const chartArea = this.chartArea;
      const xScale = this.scales.x;
      
      if (!ctx || !chartArea || !xScale) return;
      
      const x = xScale.getPixelForValue(currentTime);
      
      if (x >= chartArea.left && x <= chartArea.right) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x, chartArea.top);
        ctx.lineTo(x, chartArea.bottom);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#7c3aed';
        ctx.stroke();
        ctx.restore();
      }
    };

    chart.update('none');

    return () => {
      if (chartRef.current) {
        chartRef.current.draw = originalDraw;
      }
    };
  }, [currentTime]);

  return (
    <div className={className} style={{ height }}>
      <canvas ref={canvasRef} />
    </div>
  );
}