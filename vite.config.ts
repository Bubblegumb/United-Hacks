import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on mode (development/production)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      proxy: {
        // Requests to /api/football-data/** are forwarded to football-data.org.
        '^/api/football-data/': {
          target: 'https://api.football-data.org/v4',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/football-data/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              const key = env.VITE_API_KEY || env.FOOTBALL_DATA_API_KEY;
              if (key) proxyReq.setHeader('X-Auth-Token', key);
            });
          },
        },
        // Requests to /api/api-football/** are forwarded to api-sports.io.
        '^/api/api-football/': {
          target: 'https://v3.football.api-sports.io',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/api-football/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              const key = env.VITE_APIFOOTBALL_KEY || env.APIFOOTBALL_API_KEY;
              if (key) proxyReq.setHeader('x-apisports-key', key);
            });
          },
        },
      },
    },
  };
});
