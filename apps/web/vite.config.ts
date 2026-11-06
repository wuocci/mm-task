import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // Empty prefix loads unprefixed variables. API_KEY stays here on the server; only VITE_* reaches the bundle.
  const { API_KEY } = loadEnv(mode, process.cwd(), '');
  if (!API_KEY) {
    console.warn('API_KEY is not set in apps/web/.env.local; API requests will get 401.');
  }

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:7071',
          headers: API_KEY ? { 'x-api-key': API_KEY } : {},
        },
      },
    },
  };
});
