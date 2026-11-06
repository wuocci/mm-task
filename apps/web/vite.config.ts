import tailwindcss from '@tailwindcss/vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Server rendering with TanStack Start. The API key is read by the server at request time
// (see src/api/upstream.server.ts), so no dev proxy is needed.
export default defineConfig({
  plugins: [tailwindcss(), tanstackStart(), react()],
});
