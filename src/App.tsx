import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@lib/api/queryClient';
import { useAuthStore } from '@features/auth/stores/authStore';
import { ProtectedRoute } from '@features/auth/components/ProtectedRoute';
import { LoginPage } from '@features/auth/components/LoginPage';
import { MainLayout } from '@components/layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { UploadPage } from '@features/upload/pages';
import { ToastContainer } from '@components/ui/Toast';

export default function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="upload" element={<UploadPage />} />
            <Route path="analysis" element={<div>Analysis Page (Coming Soon)</div>} />
            <Route path="query" element={<div>Query Page (Coming Soon)</div>} />
            <Route path="library" element={<div>Library Page (Coming Soon)</div>} />
          </Route>
        </Routes>
      </Router>
      <ToastContainer />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}