import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { LoadingScreen } from '@components/common/LoadingScreen';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}