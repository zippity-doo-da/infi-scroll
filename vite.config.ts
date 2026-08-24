import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  server: { host: '127.0.0.1', port: 5173 },
  build: { target: 'es2022', rollupOptions: { input: { world: resolve(__dirname, 'index.html'), builder: resolve(__dirname, 'builder.html') } } },
});
