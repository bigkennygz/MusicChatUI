import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

// Lazy load all chart components
export const EnergyTimelineChart = lazy(() => 
  import('./EnergyTimelineChart').then(module => ({ default: module.EnergyTimelineChart }))
);

export const SongStructureChart = lazy(() => 
  import('./SongStructureChart').then(module => ({ default: module.SongStructureChart }))
);

export const TempoChart = lazy(() => 
  import('./TempoChart').then(module => ({ default: module.TempoChart }))
);

export const ChordProgressionChart = lazy(() => 
  import('./ChordProgressionChart').then(module => ({ default: module.ChordProgressionChart }))
);

// Chart loading skeleton
export function ChartLoadingSkeleton({ height = 250 }: { height?: number }) {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-1/4" />
      <div style={{ height }} className="w-full">
        <Skeleton className="w-full h-full" />
      </div>
    </div>
  );
}

// Wrapper component with Suspense
export function LazyChartWrapper({ 
  children, 
  height = 250 
}: { 
  children: React.ReactNode;
  height?: number;
}) {
  return (
    <Suspense fallback={<ChartLoadingSkeleton height={height} />}>
      {children}
    </Suspense>
  );
}