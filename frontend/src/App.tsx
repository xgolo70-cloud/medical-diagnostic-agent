import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { Layout } from './components/layout';
import { LoginForm } from './components/auth';
import { DashboardPage, DiagnosisPage, HistoryPage } from './pages';
import { useAppSelector } from './store/hooks';

// Settings placeholder
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
