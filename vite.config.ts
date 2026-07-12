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
        // Requests to /api/** are forwarded to football-data.org.
        // The browser sees the same origin (localhost:5173) so no CORS preflight fires.
        '^/api/': {
          target: 'https://api.football-data.org/v4',
          changeOrigin: true,       // Rewrites the Host header to match the target
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        '/apifootball': {
          target: 'https://v3.football.api-sports.io',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/apifootball/, ''),
          // Inject the API key at the proxy level (server-side) so it is guaranteed
          // to reach the upstream even if browser headers are stripped or missing.
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              const key = env.VITE_APIFOOTBALL_KEY;
              if (key) proxyReq.setHeader('x-apisports-key', key);
            });
          },
        },
      },
    },
  };
});
