import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import DataSets from './pages/DataSets'
import Analysis from './pages/Analysis'
import Visualization from './pages/Visualization'
import Login from './pages/Login'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ApiInitializer } from './components/ApiInitializer'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <ApiInitializer>
        <Layout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/datasets" element={
              <ProtectedRoute>
                <DataSets />
              </ProtectedRoute>
            } />
            <Route path="/analysis" element={
              <ProtectedRoute>
                <Analysis />
              </ProtectedRoute>
            } />
            <Route path="/visualization" element={
              <ProtectedRoute>
                <Visualization />
              </ProtectedRoute>
            } />
          </Routes>
        </Layout>
      </ApiInitializer>
    </ErrorBoundary>
  )
}

export default App 