import { Card, CardHeader, CardContent } from '../../../../components/ui/Card';
import { JobList } from '../JobList';

interface RecentJobsProps {
  onJobSelect?: (jobId: string) => void;
}

export function RecentJobs({ onJobSelect }: RecentJobsProps) {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Recent Analyses</h3>
      </CardHeader>
      <CardContent>
        <JobList filter="completed" onJobSelect={onJobSelect} />
      </CardContent>
    </Card>
  );
}