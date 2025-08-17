import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import DataSets from './pages/DataSets';
import Analysis from './pages/Analysis';
import Visualization from './pages/Visualization';
import Login from './pages/Login';
import AccountSettings from './pages/AccountSettings';
import { ApiInitializer } from './components/ApiInitializer';
import { SentryErrorBoundary } from './components/SentryErrorBoundary';
import { GlobalErrorBoundary } from './components/GlobalErrorBoundary';
import { useAuth } from './hooks/useAuth';
import LoadingSpinner from './components/LoadingSpinner';


function App() {
  const { isAuthenticated, isLoading, error } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // If there's an authentication error, show error message
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Authentication Error
            </h2>
            <p className="text-gray-600 mb-4">
              There was an issue with your authentication. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated, only show the login page without the layout
  if (!isAuthenticated) {
    return (
      <GlobalErrorBoundary>
        <SentryErrorBoundary>
          <ApiInitializer>
            <Routes>
              <Route path="*" element={<Login />} />
            </Routes>
          </ApiInitializer>
        </SentryErrorBoundary>
      </GlobalErrorBoundary>
    );
  }

  // If authenticated, show the full app with layout
  return (
    <GlobalErrorBoundary>
      <SentryErrorBoundary>
        <ApiInitializer>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/datasets" element={<DataSets />} />
              <Route path="/analysis" element={<Analysis />} />
              <Route path="/visualization" element={<Visualization />} />
              <Route path="/account" element={<AccountSettings />} />

              {/* Redirect any unknown routes to dashboard */}
              <Route path="*" element={<Dashboard />} />
            </Routes>
          </Layout>
        </ApiInitializer>
      </SentryErrorBoundary>
    </GlobalErrorBoundary>
  );
}

export default App 