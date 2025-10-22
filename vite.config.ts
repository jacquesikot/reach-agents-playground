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

              // Add cache-busting headers to prevent stale responses
              proxyReq.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
              proxyReq.setHeader('Pragma', 'no-cache');
              proxyReq.setHeader('Expires', '0');
            });

            proxy.on('proxyRes', (proxyRes) => {
              // Remove any caching headers from the response
              delete proxyRes.headers['cache-control'];
              delete proxyRes.headers['etag'];
              delete proxyRes.headers['last-modified'];

              // Add no-cache headers to the response
              proxyRes.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
              proxyRes.headers['Pragma'] = 'no-cache';
              proxyRes.headers['Expires'] = '0';
            });
          },
        },
        '/api/internal': {
          target: 'https://api.dev.usereach.ai',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/internal/, '/api/internal'),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              // Add Agent API headers
              const apiKey = env.VITE_AGENT_API_KEY;
              const orgId = env.VITE_AGENT_ORG_ID;

              if (apiKey) {
                proxyReq.setHeader('x-api-key', apiKey);
              }

              if (orgId) {
                proxyReq.setHeader('x-organization-id', orgId);
              }

              proxyReq.setHeader('Accept', 'application/json');
              proxyReq.setHeader('Content-Type', 'application/json');
            });
          },
        },
      },
    },
  };
});
