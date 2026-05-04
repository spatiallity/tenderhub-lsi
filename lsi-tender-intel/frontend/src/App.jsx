import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense, lazy } from 'react';
import { AppProvider } from './store/AppContext';

// Layout (not lazy loaded - needed immediately)
import AppShell from './components/Layout/AppShell';

// Loading fallback component
import { LoadingOverlay } from './components/UI/LoadingState';

// Development tools
import PerformanceMonitor from './components/Dev/PerformanceMonitor';

// Lazy load pages for code splitting
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const TenderPage = lazy(() => import('./pages/TenderPage'));
const RupPage = lazy(() => import('./pages/RupPage'));
const StatusPage = lazy(() => import('./pages/StatusPage'));
const ExpertPage = lazy(() => import('./pages/ExpertPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

// Configure React Query with optimized defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds - data considered fresh for shorter time
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: true, // Auto-refetch when user focuses window
      refetchInterval: 60 * 1000, // Auto-refetch every 60 seconds when tab is active
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <Router>
          <Routes>
            <Route path="/" element={<AppShell />}>
              <Route 
                index 
                element={
                  <Suspense fallback={<LoadingOverlay message="Memuat Dashboard..." />}>
                    <DashboardPage />
                  </Suspense>
                } 
              />
              <Route 
                path="tender" 
                element={
                  <Suspense fallback={<LoadingOverlay message="Memuat Tender Intelligence..." />}>
                    <TenderPage />
                  </Suspense>
                } 
              />
              <Route 
                path="rup" 
                element={
                  <Suspense fallback={<LoadingOverlay message="Memuat RUP Pipeline..." />}>
                    <RupPage />
                  </Suspense>
                } 
              />
              <Route 
                path="status" 
                element={
                  <Suspense fallback={<LoadingOverlay message="Memuat Status Tender..." />}>
                    <StatusPage />
                  </Suspense>
                } 
              />
              <Route 
                path="experts" 
                element={
                  <Suspense fallback={<LoadingOverlay message="Memuat Tenaga Ahli..." />}>
                    <ExpertPage />
                  </Suspense>
                } 
              />
              <Route 
                path="settings" 
                element={
                  <Suspense fallback={<LoadingOverlay message="Memuat Pengaturan..." />}>
                    <SettingsPage />
                  </Suspense>
                } 
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Router>
        
        {/* Performance Monitor (Development Only) */}
        <PerformanceMonitor />
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;
