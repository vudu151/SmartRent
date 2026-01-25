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
})
