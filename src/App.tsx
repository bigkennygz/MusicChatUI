import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@lib/api/queryClient';
import { useAuthStore } from '@features/auth/stores/authStore';
import { ProtectedRoute } from '@features/auth/components/ProtectedRoute';
import { LoginPage } from '@features/auth/components/LoginPage';
import { MainLayout } from '@components/layout/MainLayout';
import { ToastContainer } from '@components/ui/Toast';
import { ErrorRecovery } from '@components/common/ErrorRecovery';
import { PageSkeleton } from '@components/ui/PageSkeleton';

// Lazy load heavy pages
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const UploadPage = lazy(() => import('@features/upload/pages').then(m => ({ default: m.UploadPage })));
const AnalysisPage = lazy(() => import('@features/analysis/pages').then(m => ({ default: m.AnalysisPage })));

// Lazy load dev tools only in development
const ReactQueryDevtools = import.meta.env.DEV 
  ? lazy(() => import('@tanstack/react-query-devtools').then(m => ({ default: m.ReactQueryDevtools })))
  : null;

export default function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <ErrorRecovery>
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
              <Route index element={
                <Suspense fallback={<PageSkeleton />}>
                  <Dashboard />
                </Suspense>
              } />
              <Route path="upload" element={
                <Suspense fallback={<PageSkeleton />}>
                  <UploadPage />
                </Suspense>
              } />
              <Route path="analysis/:jobId" element={
                <Suspense fallback={<PageSkeleton />}>
                  <AnalysisPage />
                </Suspense>
              } />
              <Route path="query" element={<div>Query Page (Coming Soon)</div>} />
              <Route path="library" element={<div>Library Page (Coming Soon)</div>} />
            </Route>
          </Routes>
        </Router>
        <ToastContainer />
        {ReactQueryDevtools && import.meta.env.DEV && (
          <Suspense fallback={null}>
            <ReactQueryDevtools initialIsOpen={false} />
          </Suspense>
        )}
      </QueryClientProvider>
    </ErrorRecovery>
  );
}