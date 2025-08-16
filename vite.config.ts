import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import autoprefixer from 'autoprefixer'
import tailwindcss from 'tailwindcss'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  const isProduction = mode === 'production'

  return {
    plugins: [react()],
    
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    
    server: {
      port: parseInt(env.VITE_DEV_SERVER_PORT || '5173'),
      host: env.VITE_DEV_SERVER_HOST || 'localhost',
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    
    preview: {
      port: process.env.PORT ? parseInt(process.env.PORT) : 4173,
      host: '0.0.0.0',
      allowedHosts: ['healthcheck.railway.app', '.railway.app', 'beta.normaize.com', '.normaize.com'],
    },
    
    build: {
      outDir: 'dist',
      sourcemap: env.VITE_SOURCE_MAP === 'true',
      minify: env.VITE_MINIFY !== 'false',
      target: env.VITE_TARGET_BROWSERS || 'es2015',
      
      rollupOptions: {
        onwarn(warning, warn) {
          // Suppress "use client" directive warnings
          if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
          warn(warning);
        },
        
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            auth: ['@auth0/auth0-react'],
            charts: ['chart.js', 'react-chartjs-2'],
            utils: ['axios', 'clsx'],
          },
        },
      },
      
      // Production optimizations
      ...(isProduction && {
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
          output: {
            manualChunks: {
              vendor: ['react', 'react-dom'],
              auth: ['@auth0/auth0-react'],
              charts: ['chart.js', 'react-chartjs-2'],
              utils: ['axios', 'clsx'],
            },
          },
        },
      }),
    },
    
    // Environment-specific configurations
    define: {
      __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION || '1.0.0'),
      __APP_ENV__: JSON.stringify(mode),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },
    
    // CSS configuration
    css: {
      devSourcemap: true,
      postcss: {
        plugins: [
          autoprefixer,
          tailwindcss,
        ],
      },
    },
    
    // Optimize dependencies
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
      exclude: ['@sentry/react', '@sentry/tracing'],
    },
    
    // Performance optimizations
    esbuild: {
      drop: isProduction ? ['console', 'debugger'] : [],
    },
  }
}) 