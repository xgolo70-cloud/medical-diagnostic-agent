import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout';
import { LoginForm } from './components/auth';
import { LandingPage } from './pages'; // Keep LandingPage eager for fast LCP
import { useAppSelector } from './store/hooks';
import { Activity } from 'lucide-react';
import { ToastProvider } from './components/ui/Toast';
import { TourProvider } from './components/ui/TourProvider';

// Lazy load heavy dashboard pages
const DashboardPage = lazy(() => import('./pages').then(module => ({ default: module.DashboardPage })));
const DiagnosisPage = lazy(() => import('./pages').then(module => ({ default: module.DiagnosisPage })));
const HistoryPage = lazy(() => import('./pages').then(module => ({ default: module.HistoryPage })));
const SettingsPage = lazy(() => import('./pages').then(module => ({ default: module.SettingsPage })));
const MedAIPage = lazy(() => import('./pages').then(module => ({ default: module.MedAIPage })));

// Loading Component
const LoadingFallback = () => (
  <div className="h-screen w-full flex items-center justify-center bg-white text-black">
    <Activity className="w-10 h-10 animate-pulse" />
  </div>
);

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  return (
    <TourProvider>
      <ToastProvider />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Auth */}
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginForm />}
          />

          {/* Protected routes (Layout applied to all) */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/diagnosis" element={<DiagnosisPage />} />
            <Route path="/medai" element={<MedAIPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Catch-all - redirect to dashboard if logged in, else landing */}
          <Route
            path="*"
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/" replace />}
          />
        </Routes>
      </Suspense>
    </TourProvider>
  );
}

export default App;



