import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense, lazy } from 'react';
import { AppProvider } from './store/AppContext';
import { AuthProvider } from './contexts/AuthContext';

// Layout (not lazy loaded - needed immediately)
import AppShell from './components/Layout/AppShell';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Loading fallback component
import { LoadingOverlay } from './components/UI/LoadingState';

// Development tools
import PerformanceMonitor from './components/Dev/PerformanceMonitor';

// Lazy load pages for code splitting
const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const TenderPage = lazy(() => import('./pages/TenderPage'));
const RupPage = lazy(() => import('./pages/RupPage'));
const StatusPage = lazy(() => import('./pages/StatusPage'));
const ExpertPage = lazy(() => import('./pages/ExpertPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const ContactPersonPage = lazy(() => import('./pages/ContactPersonPage'));
const AuditLogPage = lazy(() => import('./pages/AuditLogPage'));

// Configure React Query with optimized defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false, // ❌ DISABLED - Prevent auto-refetch on focus
      refetchInterval: false, // ❌ DISABLED - No auto-refetch interval (was causing connection pool exhaustion)
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppProvider>
          <Router>
            <Routes>
              {/* Public route - Login */}
              <Route 
                path="/login" 
                element={
                  <Suspense fallback={<LoadingOverlay message="Memuat..." />}>
                    <LoginPage />
                  </Suspense>
                } 
              />

              {/* Protected routes */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <AppShell />
                  </ProtectedRoute>
                }
              >
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
                <Route
                  path="contacts"
                  element={
                    <Suspense fallback={<LoadingOverlay message="Memuat Contact Person..." />}>
                      <ContactPersonPage />
                    </Suspense>
                  }
                />
                <Route
                  path="audit"
                  element={
                    <Suspense fallback={<LoadingOverlay message="Memuat Audit Log..." />}>
                      <AuditLogPage />
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
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
