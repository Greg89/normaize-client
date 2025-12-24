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
  const disableAuth = import.meta.env['VITE_DISABLE_AUTH'] === 'true';

  const appTree = (
    <BrowserRouter>
      <App />
      <Toaster position="top-right" />
    </BrowserRouter>
  );

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      {disableAuth ? appTree : <Auth0ProviderWrapper>{appTree}</Auth0ProviderWrapper>}
    </React.StrictMode>
  );
} 