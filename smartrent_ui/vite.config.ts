import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Call backend like fetch("/api/health") in dev
      '/api': 'http://localhost:8080',
    },
  },
  resolve: {
    alias: [{ find: '@', replacement: '/src' }],
  },
  build: {
    sourcemap: true, // Enable source maps for production builds
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@material-tailwind/react', '@heroicons/react'],
          charts: ['apexcharts', 'react-apexcharts']
        }
      }
    }
  },
  // Ensure source maps are enabled in dev mode (default is true)
  css: {
    devSourcemap: true,
  },
})
