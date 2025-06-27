import { useMemo, useCallback, useState } from 'react';
import type { FeatureData } from '../../types';
import { formatDuration } from '@/lib/utils/format';

interface ChordProgressionChartProps {
  data: FeatureData | null;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  height?: number;
  className?: string;
}

interface ChordSegment {
  start: number;
  end: number;
  chord: string;
  confidence: number;
  isMinor: boolean;
  color: string;
}

// Chord type detection
const isMinorChord = (chord: string): boolean => {
  return chord.includes('m') && !chord.includes('maj');
};

// Color mapping for chord types
const getChordColor = (chord: string, confidence: number): string => {
  const opacity = 0.5 + (confidence * 0.5); // 0.5 to 1.0 based on confidence
  
  if (isMinorChord(chord)) {
    // Cool colors for minor chords
    return `rgba(59, 130, 246, ${opacity})`; // Blue
  } else {
    // Warm colors for major chords  
    return `rgba(251, 146, 60, ${opacity})`; // Orange
  }
};

// Convert chord to Roman numeral (simplified)
const toRomanNumeral = (chord: string): string => {
  const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
  const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  
  // Extract root note
  const root = chord.match(/^[A-G][#b]?/)?.[0] || chord;
  const baseNote = root[0];
  
  // Find position in scale (simplified - doesn't handle all keys)
  const position = notes.indexOf(baseNote);
  if (position === -1) return chord;
  
  let roman = romanNumerals[position];
  
  // Lowercase for minor chords
  if (isMinorChord(chord)) {
    roman = roman.toLowerCase();
  }
  
  // Add chord quality
  if (chord.includes('7')) roman += '7';
  if (chord.includes('maj7')) roman = roman.replace('7', 'maj7');
  if (chord.includes('dim')) roman += '°';
  if (chord.includes('aug')) roman += '+';
  
  return roman;
};

export function ChordProgressionChart({
  data,
  currentTime,
  duration,
  onSeek,
  height = 100,
  className = '',
}: ChordProgressionChartProps) {
  const [showRomanNumerals, setShowRomanNumerals] = useState(false);

  // Process chord data into segments
  const chordSegments = useMemo<ChordSegment[]>(() => {
    if (!data?.data || !('segments' in data.data)) {
      // Try to parse from time series data
      if (data?.data && 'timestamps' in data.data && 'values' in data.data) {
        const timeSeriesData = data.data as { timestamps: number[]; values: any[]; confidence?: number[] };
        const segments: ChordSegment[] = [];
        
        for (let i = 0; i < timeSeriesData.timestamps.length - 1; i++) {
          const chord = String(timeSeriesData.values[i]);
          const confidence = timeSeriesData.confidence?.[i] ?? 0.8;
          
          // Skip if same as previous chord
          if (i > 0 && chord === String(timeSeriesData.values[i - 1])) {
            continue;
          }
          
          // Find the end of this chord
          let endIndex = i + 1;
          while (endIndex < timeSeriesData.values.length && 
                 String(timeSeriesData.values[endIndex]) === chord) {
            endIndex++;
          }
          
          segments.push({
            start: timeSeriesData.timestamps[i],
            end: timeSeriesData.timestamps[Math.min(endIndex, timeSeriesData.timestamps.length - 1)],
            chord,
            confidence,
            isMinor: isMinorChord(chord),
            color: getChordColor(chord, confidence),
          });
          
          i = endIndex - 1; // Skip processed indices
        }
        
        return segments;
      }
    }
    
    // Handle segment data format
    if (data?.data && 'segments' in data.data) {
      const segmentData = data.data as { segments: any[] };
      return segmentData.segments.map(seg => ({
        start: seg.start || 0,
        end: seg.end || seg.start + 1,
        chord: seg.label || seg.value || 'N.C.',
        confidence: seg.confidence ?? 0.8,
        isMinor: isMinorChord(seg.label || seg.value || ''),
        color: getChordColor(seg.label || seg.value || '', seg.confidence ?? 0.8),
      }));
    }
    
    return [];
  }, [data]);

  // Find current chord
  const currentChord = useMemo(() => {
    return chordSegments.find(
      segment => currentTime >= segment.start && currentTime < segment.end
    );
  }, [chordSegments, currentTime]);

  // Handle click on timeline
  const handleTimelineClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = x / rect.width;
    const time = percentage * duration;
    
    if (time >= 0 && time <= duration) {
      onSeek(time);
    }
  }, [duration, onSeek]);

  // Handle chord click
  const handleChordClick = useCallback((segment: ChordSegment, event: React.MouseEvent) => {
    event.stopPropagation();
    onSeek(segment.start);
  }, [onSeek]);

  if (!chordSegments.length) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-50 rounded-lg`} style={{ height }}>
        <p className="text-gray-500">No chord data available</p>
      </div>
    );
  }

  const playheadPosition = (currentTime / duration) * 100;

  return (
    <div className={`${className} relative`} style={{ height }}>
      {/* Header with toggle */}
      <div className="absolute -top-6 left-0 right-0 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          Current: {currentChord ? (showRomanNumerals ? toRomanNumeral(currentChord.chord) : currentChord.chord) : 'N.C.'}
        </span>
        <button
          onClick={() => setShowRomanNumerals(!showRomanNumerals)}
          className="text-xs text-purple-600 hover:text-purple-700 font-medium"
        >
          {showRomanNumerals ? 'Show Chord Names' : 'Show Roman Numerals'}
        </button>
      </div>

      {/* Main timeline */}
      <div 
        className="absolute top-4 left-0 right-0 bottom-4 cursor-pointer"
        onClick={handleTimelineClick}
      >
        <div className="absolute inset-0 bg-gray-100 rounded-lg overflow-hidden">
          {/* Chord segments */}
          {chordSegments.map((segment, index) => {
            const startPercent = (segment.start / duration) * 100;
            const widthPercent = ((segment.end - segment.start) / duration) * 100;
            
            return (
              <div
                key={`${segment.chord}-${index}`}
                className="absolute top-0 bottom-0 transition-all duration-150 hover:brightness-110 border-r border-white/30"
                style={{
                  left: `${startPercent}%`,
                  width: `${widthPercent}%`,
                  backgroundColor: segment.color,
                  opacity: currentChord?.chord === segment.chord ? 1 : 0.8,
                }}
                onClick={(e) => handleChordClick(segment, e)}
                title={`${segment.chord} (${formatDuration(segment.start)} - ${formatDuration(segment.end)})`}
              >
                {/* Chord label */}
                {widthPercent > 3 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white text-sm font-semibold px-1 truncate drop-shadow-sm">
                      {showRomanNumerals ? toRomanNumeral(segment.chord) : segment.chord}
                    </span>
                  </div>
                )}
                
                {/* Confidence indicator as bottom border */}
                <div 
                  className="absolute bottom-0 left-0 right-0 bg-black/20"
                  style={{ height: `${(1 - segment.confidence) * 20}%` }}
                />
              </div>
            );
          })}

          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-purple-600 pointer-events-none transition-all duration-75"
            style={{ left: `${playheadPosition}%` }}
          >
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-purple-600 rounded-full" />
          </div>
        </div>
      </div>

      {/* Time labels */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500">
        <span>{formatDuration(0)}</span>
        <span>{formatDuration(duration)}</span>
      </div>

      {/* Legend */}
      <div className="absolute -bottom-6 left-0 text-xs text-gray-500 flex items-center gap-4">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: 'rgba(251, 146, 60, 0.8)' }} />
          <span>Major</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: 'rgba(59, 130, 246, 0.8)' }} />
          <span>Minor</span>
        </div>
      </div>
    </div>
  );
}