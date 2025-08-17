import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Auth0ProviderWrapper } from './components/Auth0Provider'
import { setupGlobalErrorHandlers } from './utils/globalErrorHandlers'
// Performance monitoring is automatically initialized in the PerformanceMonitor constructor
import { initSentry } from './utils/sentry'
import App from './App'
import './index.css'

// Initialize Sentry, global error handlers and performance monitoring
initSentry();
setupGlobalErrorHandlers();
// Performance monitoring is automatically initialized in the PerformanceMonitor constructor

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <Auth0ProviderWrapper>
        <BrowserRouter>
          <App />
          <Toaster position="top-right" />
        </BrowserRouter>
      </Auth0ProviderWrapper>
    </React.StrictMode>
  );
} 