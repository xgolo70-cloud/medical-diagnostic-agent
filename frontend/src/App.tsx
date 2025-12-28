import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout';
import { useAppSelector } from './store/hooks';

// Placeholder page components (to be implemented in Phase 2/3)
const DashboardPage = () => (
  <div>
    <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
    <p className="text-gray-600">Welcome to the Clinical Dashboard</p>
  </div>
);

const DiagnosisPage = () => (
  <div>
    <h1 className="text-2xl font-bold mb-4">New Diagnosis</h1>
    <p className="text-gray-600">Diagnosis features coming in Phase 3</p>
  </div>
);

const HistoryPage = () => (
  <div>
    <h1 className="text-2xl font-bold mb-4">History</h1>
    <p className="text-gray-600">Audit history coming in Phase 4</p>
  </div>
);

const SettingsPage = () => (
  <div>
    <h1 className="text-2xl font-bold mb-4">Settings</h1>
    <p className="text-gray-600">Settings coming soon</p>
  </div>
);

const LoginPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="bg-white p-8 rounded-lg shadow-md w-96">
      <h1 className="text-2xl font-bold mb-4 text-center">Login</h1>
      <p className="text-gray-600 text-center">Login form coming in Phase 2</p>
    </div>
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
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
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
