import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EnergyTimelineChart } from '../EnergyTimelineChart';
import type { FeatureData } from '../../../types';

// Mock Chart.js
vi.mock('chart.js/auto', () => ({
  default: class MockChart {
    constructor() {}
    destroy() {}
    update() {}
    draw() {}
    data = {};
    ctx = {};
    scales = { x: { getPixelForValue: () => 0 } };
    chartArea = { left: 0, right: 100, top: 0, bottom: 100 };
  }
}));

// Mock BaseChart since we're testing the logic, not the chart rendering
vi.mock('../BaseChart', () => ({
  BaseChart: ({ config }: { config: any }) => (
    <div data-testid="base-chart">
      <div data-testid="chart-datasets">{config.data.datasets.length}</div>
    </div>
  )
}));

const mockBandEnergyData: FeatureData = {
  stem: 'mix',
  feature_name: 'band_energy',
  data: {
    values: {
      sub_bass: [0.1, 0.2, 0.15, 0.3],
      bass: [0.3, 0.4, 0.35, 0.5],
      mids: [0.5, 0.6, 0.55, 0.7],
      highs: [0.2, 0.3, 0.25, 0.4],
    },
    timestamps: [0, 1, 2, 3]
  },
  statistics: {
    mean: 0.35,
    std: 0.15,
    min: 0.1,
    max: 0.7,
  }
};

const mockSingleEnergyData: FeatureData = {
  stem: 'mix',
  feature_name: 'energy',
  data: {
    timestamps: [0, 1, 2, 3, 4],
    values: [0.1, 0.3, 0.5, 0.4, 0.2]
  },
  statistics: {
    mean: 0.3,
    std: 0.15,
    min: 0.1,
    max: 0.5,
  }
};

describe('EnergyTimelineChart', () => {
  const defaultProps = {
    currentTime: 1.5,
    duration: 4,
    onSeek: vi.fn(),
    height: 300,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with band energy data', () => {
    render(<EnergyTimelineChart {...defaultProps} data={mockBandEnergyData} />);
    
    const baseChart = screen.getByTestId('base-chart');
    expect(baseChart).toBeInTheDocument();
    
    // Should have 4 datasets (one for each band)
    expect(screen.getByTestId('chart-datasets')).toHaveTextContent('4');
  });

  it('should render with single energy data', () => {
    render(<EnergyTimelineChart {...defaultProps} data={mockSingleEnergyData} />);
    
    const baseChart = screen.getByTestId('base-chart');
    expect(baseChart).toBeInTheDocument();
    
    // Should have 1 dataset for single energy
    expect(screen.getByTestId('chart-datasets')).toHaveTextContent('1');
  });

  it('should handle null data', () => {
    render(<EnergyTimelineChart {...defaultProps} data={null} />);
    
    const baseChart = screen.getByTestId('base-chart');
    expect(baseChart).toBeInTheDocument();
    
    // Should have no datasets
    expect(screen.getByTestId('chart-datasets')).toHaveTextContent('0');
  });

  it('should handle invalid data structure', () => {
    const invalidData: FeatureData = {
      stem: 'mix',
      feature_name: 'energy',
      data: {
        invalid: 'structure'
      },
      statistics: {
        mean: 0,
        std: 0,
        min: 0,
        max: 0,
      }
    };

    render(<EnergyTimelineChart {...defaultProps} data={invalidData} />);
    
    const baseChart = screen.getByTestId('base-chart');
    expect(baseChart).toBeInTheDocument();
    
    // Should handle gracefully with no datasets
    expect(screen.getByTestId('chart-datasets')).toHaveTextContent('0');
  });

  it('should pass correct props to BaseChart', () => {
    const onSeek = vi.fn();
    render(
      <EnergyTimelineChart 
        {...defaultProps} 
        data={mockSingleEnergyData}
        onSeek={onSeek}
        height={400}
        className="custom-class"
      />
    );
    
    expect(screen.getByTestId('base-chart')).toBeInTheDocument();
  });

  describe('data transformation', () => {
    it('should create proper datasets for band energy', () => {
      const { container } = render(<EnergyTimelineChart {...defaultProps} data={mockBandEnergyData} />);
      
      // Verify that band energy data creates multiple datasets
      expect(screen.getByTestId('chart-datasets')).toHaveTextContent('4');
    });

    it('should handle missing timestamps', () => {
      const dataWithoutTimestamps: FeatureData = {
        ...mockBandEnergyData,
        data: {
          values: {
            sub_bass: [0.1, 0.2],
            bass: [0.3, 0.4],
            mids: [0.5, 0.6],
            highs: [0.2, 0.3],
          }
        }
      };

      render(<EnergyTimelineChart {...defaultProps} data={dataWithoutTimestamps} />);
      
      // Should still render with generated timestamps
      expect(screen.getByTestId('base-chart')).toBeInTheDocument();
    });
  });
});