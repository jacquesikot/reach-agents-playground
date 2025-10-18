import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    base: '/',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
    },
    server: {
      proxy: {
        '/api/opik': {
          target: 'https://www.comet.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/opik/, '/opik/api'),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              // Add Opik API key and workspace headers
              const apiKey = env.VITE_OPIK_API_KEY;
              const workspace = env.VITE_OPIK_WORKSPACE;

              if (apiKey) {
                proxyReq.setHeader('authorization', apiKey);
              }

              if (workspace) {
                proxyReq.setHeader('Comet-Workspace', workspace);
              }

              proxyReq.setHeader('Accept', 'application/json');
            });
          },
        },
      },
    },
  };
});
