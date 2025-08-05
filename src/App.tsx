import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import DataSets from './pages/DataSets'
import Analysis from './pages/Analysis'
import Visualization from './pages/Visualization'
import Login from './pages/Login'
import AccountSettings from './pages/AccountSettings'
import { ApiInitializer } from './components/ApiInitializer'
import { SentryErrorBoundary } from './components/SentryErrorBoundary'
import { useAuth } from './hooks/useAuth'
import LoadingSpinner from './components/LoadingSpinner'

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // If not authenticated, only show the login page without the layout
  if (!isAuthenticated) {
    return (
      <SentryErrorBoundary>
        <ApiInitializer>
          <Routes>
            <Route path="*" element={<Login />} />
          </Routes>
        </ApiInitializer>
      </SentryErrorBoundary>
    );
  }

  // If authenticated, show the full app with layout
  return (
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
  )
}

export default App 