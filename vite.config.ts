import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/api/opik': {
          target: 'https://www.comet.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/opik/, '/opik/api'),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq, req) => {
              // Add Opik API key and workspace headers
              const apiKey = env.VITE_OPIK_API_KEY;
              const workspace = env.VITE_OPIK_WORKSPACE;

              console.log('=== PROXY DEBUG ===');
              console.log('Original path:', req.url);
              console.log('Proxied path:', proxyReq.path);
              console.log('API Key present:', !!apiKey);
              console.log('Workspace:', workspace);
              console.log('Environment check:', {
                VITE_OPIK_API_KEY: env.VITE_OPIK_API_KEY ? 'Present' : 'Missing',
                VITE_OPIK_WORKSPACE: env.VITE_OPIK_WORKSPACE,
              });

              if (apiKey) {
                proxyReq.setHeader('authorization', apiKey);
                console.log('Set authorization header');
              } else {
                console.log('WARNING: No API key found!');
              }

              if (workspace) {
                proxyReq.setHeader('Comet-Workspace', workspace);
                console.log('Set Comet-Workspace header');
              } else {
                console.log('WARNING: No workspace found!');
              }

              proxyReq.setHeader('Accept', 'application/json');
              console.log('Set Accept header');
              console.log('=== END PROXY DEBUG ===');
            });
          },
        },
      },
    },
  };
});
