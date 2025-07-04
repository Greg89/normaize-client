import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import DataSets from './pages/DataSets'
import Analysis from './pages/Analysis'
import Visualization from './pages/Visualization'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/datasets" element={<DataSets />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/visualization" element={<Visualization />} />
        </Routes>
      </Layout>
    </ErrorBoundary>
  )
}

export default App 