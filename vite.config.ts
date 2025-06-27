import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@features': path.resolve(__dirname, './src/features'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },
  build: {
    rollupOptions: {
      external: [],
      output: {
        manualChunks(id) {
          // Vendor chunks - more granular splitting
          if (id.includes('node_modules')) {
            // Core React (essential)
            if (id.includes('react/') || id.includes('react-dom/')) {
              return 'react-core';
            }
            // React Router (page-level splitting)
            if (id.includes('react-router')) {
              return 'react-router';
            }
            // Chart.js (only load when needed)
            if (id.includes('chart.js')) {
              return 'charts-lib';
            }
            // WaveSurfer (only for audio pages)
            if (id.includes('wavesurfer.js')) {
              return 'audio-lib';
            }
            // Framer Motion (animation heavy)
            if (id.includes('framer-motion')) {
              return 'animations';
            }
            // Radix UI (component heavy)
            if (id.includes('@radix-ui')) {
              return 'ui-components';
            }
            // Small utilities can stay together
            if (id.includes('clsx') || id.includes('tailwind-merge') || id.includes('date-fns')) {
              return 'utils';
            }
            // React Query
            if (id.includes('@tanstack/react-query')) {
              return 'data-fetching';
            }
            // Socket.io
            if (id.includes('socket.io-client')) {
              return 'websocket';
            }
            // Everything else in vendor
            return 'vendor-misc';
          }
          
          // Feature-based splitting with granular chunks
          if (id.includes('/src/features/auth/')) {
            return 'auth';
          }
          if (id.includes('/src/features/upload/')) {
            return 'upload';
          }
          if (id.includes('/src/features/analysis/components/charts/')) {
            return 'charts';
          }
          if (id.includes('/src/features/analysis/pages/')) {
            return 'analysis-pages';
          }
          if (id.includes('/src/features/analysis/')) {
            return 'analysis-core';
          }
        },
      },
    },
    chunkSizeWarningLimit: 200, // Stricter warning limit
    // Enhanced minification
    minify: 'esbuild',
    target: 'esnext',
  },
  optimizeDeps: {
    include: ['chart.js/auto'],
  },
});