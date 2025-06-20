import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analysisApi } from '../../../../features/analysis/api/analysisApi';
import { JobStatusCard } from '../JobStatusCard';
import { Button } from '../../../../components/ui/Button';

export interface JobListProps {
  filter?: 'all' | 'pending' | 'processing' | 'completed' | 'failed';
  onJobSelect?: (jobId: string) => void;
}

export function JobList({ filter = 'all', onJobSelect }: JobListProps) {
  const [page, setPage] = useState(1);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['analysis', 'jobs', filter, page],
    queryFn: () => analysisApi.listJobs({
      status: filter === 'all' ? undefined : filter,
      page,
      limit: 10,
    }),
  });

  if (isLoading) return <div className="text-center py-4 text-gray-500">Loading jobs...</div>;
  if (error) return <div className="text-center py-4 text-red-600">Error loading jobs</div>;
  if (!data) return null;

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {data.items.map((job) => (
          <JobStatusCard
            key={job.job_id}
            job={job}
            onViewResults={() => onJobSelect?.(job.job_id)}
          />
        ))}
      </div>
      
      {data.items.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No jobs found
        </div>
      )}

      {data.has_more && (
        <div className="flex justify-center mt-4">
          <Button
            onClick={() => setPage(p => p + 1)}
            variant="secondary"
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}