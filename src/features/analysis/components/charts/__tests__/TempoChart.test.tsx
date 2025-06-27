import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TempoChart } from '../TempoChart';
import type { FeatureData } from '../../../types';

// Mock BaseChart
vi.mock('../BaseChart', () => ({
  BaseChart: ({ config }: { config: any }) => (
    <div data-testid="tempo-chart">
      <div data-testid="chart-datasets">{config.data.datasets.length}</div>
      <div data-testid="chart-type">{config.type}</div>
    </div>
  )
}));

const mockTempoData: FeatureData = {
  stem: 'mix',
  feature_name: 'tempo',
  data: {
    timestamps: [0, 1, 2, 3, 4, 5],
    values: [120, 122, 118, 125, 123, 121],
    confidence: [0.9, 0.85, 0.8, 0.95, 0.88, 0.92]
  },
  statistics: {
    mean: 121.5,
    std: 2.5,
    min: 118,
    max: 125,
  }
};

const mockTempoWithoutConfidence: FeatureData = {
  stem: 'mix',
  feature_name: 'tempo',
  data: {
    timestamps: [0, 1, 2, 3],
    values: [120, 122, 118, 125]
  },
  statistics: {
    mean: 121.25,
    std: 2.87,
    min: 118,
    max: 125,
  }
};

describe('TempoChart', () => {
  const defaultProps = {
    currentTime: 2.5,
    duration: 6,
    onSeek: vi.fn(),
    height: 300,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with tempo data including confidence', () => {
    render(<TempoChart {...defaultProps} data={mockTempoData} />);
    
    expect(screen.getByTestId('tempo-chart')).toBeInTheDocument();
    expect(screen.getByTestId('chart-type')).toHaveTextContent('line');
    
    // Should have main tempo line + confidence bands (3 datasets total)
    expect(screen.getByTestId('chart-datasets')).toHaveTextContent('3');
  });

  it('should render with tempo data without confidence', () => {
    render(<TempoChart {...defaultProps} data={mockTempoWithoutConfidence} />);
    
    expect(screen.getByTestId('tempo-chart')).toBeInTheDocument();
    
    // Should have only main tempo line (1 dataset)
    expect(screen.getByTestId('chart-datasets')).toHaveTextContent('1');
  });

  it('should handle null data', () => {
    render(<TempoChart {...defaultProps} data={null} />);
    
    expect(screen.getByTestId('tempo-chart')).toBeInTheDocument();
    expect(screen.getByTestId('chart-datasets')).toHaveTextContent('0');
  });

  it('should handle invalid data structure', () => {
    const invalidData: FeatureData = {
      stem: 'mix',
      feature_name: 'tempo',
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

    render(<TempoChart {...defaultProps} data={invalidData} />);
    
    expect(screen.getByTestId('tempo-chart')).toBeInTheDocument();
    expect(screen.getByTestId('chart-datasets')).toHaveTextContent('0');
  });

  it('should handle empty arrays', () => {
    const emptyData: FeatureData = {
      stem: 'mix',
      feature_name: 'tempo',
      data: {
        timestamps: [],
        values: []
      },
      statistics: {
        mean: 0,
        std: 0,
        min: 0,
        max: 0,
      }
    };

    render(<TempoChart {...defaultProps} data={emptyData} />);
    
    expect(screen.getByTestId('tempo-chart')).toBeInTheDocument();
    expect(screen.getByTestId('chart-datasets')).toHaveTextContent('0');
  });

  it('should pass correct props to BaseChart', () => {
    const onSeek = vi.fn();
    render(
      <TempoChart 
        {...defaultProps} 
        data={mockTempoData}
        onSeek={onSeek}
        height={400}
        className="custom-tempo-class"
      />
    );
    
    expect(screen.getByTestId('tempo-chart')).toBeInTheDocument();
  });

  describe('data decimation', () => {
    it('should handle large datasets', () => {
      const largeTempoData: FeatureData = {
        stem: 'mix',
        feature_name: 'tempo',
        data: {
          timestamps: Array.from({ length: 1000 }, (_, i) => i * 0.1),
          values: Array.from({ length: 1000 }, () => 120 + Math.random() * 10)
        },
        statistics: {
          mean: 125,
          std: 3,
          min: 118,
          max: 135,
        }
      };

      render(<TempoChart {...defaultProps} data={largeTempoData} />);
      
      expect(screen.getByTestId('tempo-chart')).toBeInTheDocument();
      // Should still create the dataset even with decimation
      expect(screen.getByTestId('chart-datasets')).toHaveTextContent('1');
    });
  });

  describe('confidence bands', () => {
    it('should generate confidence bands when confidence data is available', () => {
      render(<TempoChart {...defaultProps} data={mockTempoData} />);
      
      // Should have 3 datasets: main line + upper band + lower band
      expect(screen.getByTestId('chart-datasets')).toHaveTextContent('3');
    });

    it('should handle mismatched confidence array length', () => {
      const mismatchedConfidenceData: FeatureData = {
        stem: 'mix',
        feature_name: 'tempo',
        data: {
          timestamps: [0, 1, 2, 3],
          values: [120, 122, 118, 125],
          confidence: [0.9, 0.85] // Only 2 confidence values for 4 tempo values
        },
        statistics: {
          mean: 121.25,
          std: 2.87,
          min: 118,
          max: 125,
        }
      };

      render(<TempoChart {...defaultProps} data={mismatchedConfidenceData} />);
      
      // Should still work and create confidence bands
      expect(screen.getByTestId('chart-datasets')).toHaveTextContent('3');
    });
  });
});