import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Requests to /api/** are forwarded to football-data.org.
      // The browser sees the same origin (localhost:5173) so no CORS preflight fires.
      '/api': {
        target: 'https://api.football-data.org/v4',
        changeOrigin: true,       // Rewrites the Host header to match the target
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
