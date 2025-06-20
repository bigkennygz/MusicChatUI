import { Card, CardContent, CardHeader } from '@components/ui/Card';
import { useAuthStore } from '@features/auth/stores/authStore';

export function Dashboard() {
  const user = useAuthStore((state) => state.user);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Welcome back, {user?.username}!</h2>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            This is your MusicChat dashboard. From here you can upload audio files,
            analyze music features, and query your music library.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}