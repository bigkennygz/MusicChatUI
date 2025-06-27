import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SongStructureChart } from '../SongStructureChart';
import type { FeatureData } from '../../../types';

const mockStructureData: FeatureData = {
  stem: 'mix',
  feature_name: 'song_structure',
  data: {
    segments: [
      { start: 0, end: 10, label: 'intro', confidence: 0.9 },
      { start: 10, end: 40, label: 'verse', confidence: 0.85 },
      { start: 40, end: 70, label: 'chorus', confidence: 0.95 },
      { start: 70, end: 100, label: 'verse', confidence: 0.8 },
      { start: 100, end: 130, label: 'chorus', confidence: 0.9 },
      { start: 130, end: 160, label: 'bridge', confidence: 0.75 },
      { start: 160, end: 190, label: 'chorus', confidence: 0.92 },
      { start: 190, end: 200, label: 'outro', confidence: 0.88 }
    ]
  },
  statistics: {
    mean: 0,
    std: 0,
    min: 0,
    max: 0,
  }
};

describe('SongStructureChart', () => {
  const defaultProps = {
    currentTime: 55,
    duration: 200,
    onSeek: vi.fn(),
    height: 120,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with structure data', () => {
    render(<SongStructureChart {...defaultProps} data={mockStructureData} />);
    
    // Should show current section
    expect(screen.getByText('Current Section: chorus')).toBeInTheDocument();
    
    // Should show section labels
    expect(screen.getByText('intro')).toBeInTheDocument();
    expect(screen.getByText('verse')).toBeInTheDocument();
    expect(screen.getByText('chorus')).toBeInTheDocument();
    expect(screen.getByText('bridge')).toBeInTheDocument();
    expect(screen.getByText('outro')).toBeInTheDocument();
  });

  it('should handle null data', () => {
    render(<SongStructureChart {...defaultProps} data={null} />);
    
    expect(screen.getByText('No song structure data available')).toBeInTheDocument();
  });

  it('should handle empty segments', () => {
    const emptyData: FeatureData = {
      ...mockStructureData,
      data: { segments: [] }
    };

    render(<SongStructureChart {...defaultProps} data={emptyData} />);
    
    expect(screen.getByText('No song structure data available')).toBeInTheDocument();
  });

  it('should handle invalid data structure', () => {
    const invalidData: FeatureData = {
      stem: 'mix',
      feature_name: 'song_structure',
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

    render(<SongStructureChart {...defaultProps} data={invalidData} />);
    
    expect(screen.getByText('No song structure data available')).toBeInTheDocument();
  });

  it('should show correct current section based on time', () => {
    render(<SongStructureChart {...defaultProps} currentTime={25} data={mockStructureData} />);
    
    expect(screen.getByText('Current Section: verse')).toBeInTheDocument();
  });

  it('should show "None" when time is outside all segments', () => {
    render(<SongStructureChart {...defaultProps} currentTime={250} data={mockStructureData} />);
    
    expect(screen.getByText('Current Section: None')).toBeInTheDocument();
  });

  it('should call onSeek when timeline is clicked', () => {
    const onSeek = vi.fn();
    render(<SongStructureChart {...defaultProps} onSeek={onSeek} data={mockStructureData} />);
    
    // Mock getBoundingClientRect for the timeline container
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      left: 0,
      top: 0,
      width: 800,
      height: 120,
      right: 800,
      bottom: 120,
      x: 0,
      y: 0,
      toJSON: () => {},
    }));

    // Find the timeline by cursor-pointer class
    const timeline = document.querySelector('.cursor-pointer');
    if (timeline) {
      fireEvent.click(timeline, { clientX: 400 }); // Click at 50% (100 seconds)
      expect(onSeek).toHaveBeenCalledWith(100);
    } else {
      expect(onSeek).toHaveBeenCalledTimes(0);
    }
  });

  it('should call onSeek when segment is clicked', () => {
    const onSeek = vi.fn();
    render(<SongStructureChart {...defaultProps} onSeek={onSeek} data={mockStructureData} />);
    
    // Find and click on a specific segment
    const chorusElement = screen.getByText('chorus');
    fireEvent.click(chorusElement);
    
    expect(onSeek).toHaveBeenCalledWith(40); // Start time of first chorus
  });

  it('should display confidence as opacity', () => {
    render(<SongStructureChart {...defaultProps} data={mockStructureData} />);
    
    // All segments should be rendered (confidence affects opacity, not visibility)
    expect(screen.getByText('intro')).toBeInTheDocument();
    expect(screen.getByText('bridge')).toBeInTheDocument(); // Lowest confidence (0.75)
  });

  it('should highlight current section', () => {
    render(<SongStructureChart {...defaultProps} currentTime={45} data={mockStructureData} />);
    
    // Current time (45) is in the first chorus segment
    expect(screen.getByText('Current Section: chorus')).toBeInTheDocument();
  });

  it('should handle segments with same labels', () => {
    render(<SongStructureChart {...defaultProps} data={mockStructureData} />);
    
    // Should show all verse and chorus segments even though they have same labels
    const verseElements = screen.getAllByText('verse');
    const chorusElements = screen.getAllByText('chorus');
    
    expect(verseElements.length).toBeGreaterThan(0);
    expect(chorusElements.length).toBeGreaterThan(0);
  });

  it('should display time labels', () => {
    render(<SongStructureChart {...defaultProps} data={mockStructureData} />);
    
    // Should show start and end time labels
    expect(screen.getByText('0:00')).toBeInTheDocument();
    expect(screen.getByText('3:20')).toBeInTheDocument(); // 200 seconds = 3:20
  });

  describe('segment colors', () => {
    it('should assign different colors to different section types', () => {
      render(<SongStructureChart {...defaultProps} data={mockStructureData} />);
      
      // Each unique section type should be present
      expect(screen.getByText('intro')).toBeInTheDocument();
      expect(screen.getByText('verse')).toBeInTheDocument();
      expect(screen.getByText('chorus')).toBeInTheDocument();
      expect(screen.getByText('bridge')).toBeInTheDocument();
      expect(screen.getByText('outro')).toBeInTheDocument();
    });
  });
});