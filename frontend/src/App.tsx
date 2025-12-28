import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { Layout } from './components/layout';
import { LoginForm } from './components/auth';
import { DashboardPage } from './pages';
import { useAppSelector } from './store/hooks';

// Placeholder pages for Phase 3/4
const DiagnosisPage = () => (
  <Box>
    <Typography variant="h4" fontWeight={700} gutterBottom>
      New Diagnosis
    </Typography>
    <Typography color="text.secondary">
      Diagnosis form with manual entry and PDF upload coming in Phase 3.
    </Typography>
  </Box>
);

const HistoryPage = () => (
  <Box>
    <Typography variant="h4" fontWeight={700} gutterBottom>
      Diagnosis History
    </Typography>
    <Typography color="text.secondary">
      Audit history and diagnosis logs coming in Phase 4.
    </Typography>
  </Box>
);

const SettingsPage = () => (
  <Box>
    <Typography variant="h4" fontWeight={700} gutterBottom>
      Settings
    </Typography>
    <Typography color="text.secondary">
      User preferences and configuration options.
    </Typography>
  </Box>
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
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginForm />}
      />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="diagnosis" element={<DiagnosisPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
