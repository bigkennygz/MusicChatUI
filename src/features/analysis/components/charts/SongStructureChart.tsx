import { useMemo, useCallback } from 'react';
import type { Section } from '../../types';
import { formatDuration } from '@/lib/utils/format';

interface SongStructureChartProps {
  sections: Section[];
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  height?: number;
  className?: string;
}

// Color mapping for different section types
const SECTION_COLORS: Record<Section['type'], string> = {
  intro: '#10b981',      // emerald-500
  verse: '#3b82f6',      // blue-500
  chorus: '#ef4444',     // red-500
  bridge: '#f59e0b',     // amber-500
  outro: '#6366f1',      // indigo-500
  instrumental: '#8b5cf6', // violet-500
  break: '#64748b',      // slate-500
};

// Human-readable labels
const SECTION_LABELS: Record<Section['type'], string> = {
  intro: 'Intro',
  verse: 'Verse',
  chorus: 'Chorus',
  bridge: 'Bridge',
  outro: 'Outro',
  instrumental: 'Instrumental',
  break: 'Break',
};

export function SongStructureChart({
  sections,
  currentTime,
  duration,
  onSeek,
  height = 120,
  className = '',
}: SongStructureChartProps) {

  // Calculate section positions and widths
  const sectionLayout = useMemo(() => {
    if (!sections.length || duration === 0) return [];

    return sections.map((section) => {
      const startPercent = (section.start / duration) * 100;
      const widthPercent = ((section.end - section.start) / duration) * 100;
      
      return {
        ...section,
        startPercent,
        widthPercent,
        color: SECTION_COLORS[section.type] || SECTION_COLORS.break,
        displayLabel: SECTION_LABELS[section.type] || section.label,
      };
    });
  }, [sections, duration]);

  // Find current section
  const currentSection = useMemo(() => {
    return sectionLayout.find(
      section => currentTime >= section.start && currentTime <= section.end
    );
  }, [sectionLayout, currentTime]);

  // Handle click on section
  const handleSectionClick = useCallback((section: typeof sectionLayout[0]) => {
    // Seek to the start of the section
    onSeek(section.start);
  }, [onSeek]);

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

  if (!sections.length) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-50 rounded-lg`} style={{ height }}>
        <p className="text-gray-500">No structure data available</p>
      </div>
    );
  }

  const playheadPosition = (currentTime / duration) * 100;

  return (
    <div className={`${className} relative`} style={{ height }}>
      {/* Section info */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-2 py-1 text-sm">
        <span className="font-medium text-gray-700">
          {currentSection ? `${currentSection.displayLabel}` : 'Section'}
        </span>
        <span className="text-gray-500 text-xs">
          {sections.length} sections
        </span>
      </div>

      {/* Main timeline container */}
      <div 
        className="absolute top-8 left-0 right-0 bottom-4 cursor-pointer"
        onClick={handleTimelineClick}
      >
        {/* Background */}
        <div className="absolute inset-0 bg-gray-100 rounded-lg overflow-hidden">
          {/* Sections */}
          {sectionLayout.map((section) => (
            <div
              key={section.id}
              className="absolute top-0 bottom-0 transition-all duration-150 hover:brightness-110"
              style={{
                left: `${section.startPercent}%`,
                width: `${section.widthPercent}%`,
                backgroundColor: section.color,
                opacity: currentSection?.id === section.id ? 1 : 0.8,
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleSectionClick(section);
              }}
              title={`${section.displayLabel} (${formatDuration(section.start)} - ${formatDuration(section.end)})`}
            >
              {/* Section label */}
              {section.widthPercent > 5 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-xs font-medium px-1 truncate">
                    {section.displayLabel}
                  </span>
                </div>
              )}
              
              {/* Confidence indicator */}
              {section.widthPercent > 3 && (
                <div 
                  className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-20"
                  style={{ height: `${(1 - section.confidence) * 30}%` }}
                  title={`Confidence: ${(section.confidence * 100).toFixed(0)}%`}
                />
              )}
            </div>
          ))}

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
      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 px-1">
        <span>{formatDuration(0)}</span>
        <span>{formatDuration(duration)}</span>
      </div>

      {/* Section navigation buttons */}
      <div className="absolute -bottom-8 left-0 right-0 flex justify-center gap-1">
        {sectionLayout.map((section) => (
          <button
            key={section.id}
            className={`w-2 h-2 rounded-full transition-all ${
              currentSection?.id === section.id 
                ? 'bg-purple-600 w-6' 
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
            onClick={() => handleSectionClick(section)}
            title={section.displayLabel}
            aria-label={`Jump to ${section.displayLabel}`}
          />
        ))}
      </div>
    </div>
  );
}