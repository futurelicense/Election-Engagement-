import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // In dev, /api goes to the backend. Start backend: npm run dev:backend (or npm run dev:all)
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('error', (err, _req, res) => {
            console.warn('[Vite proxy] Backend not reachable at http://localhost:3000. Start it with: npm run dev:backend');
          });
          proxy.on('proxyReq', (proxyReq, req) => {
            // Ensure path is forwarded as-is (e.g. /api/countries -> backend /api/countries)
            if (req.url?.startsWith('/api')) proxyReq.path = req.url;
          });
        },
      },
    },
  },
})
