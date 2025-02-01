/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    include: ['test/**/*.test.mts'],
    globals: true,
  },
  server: {
    hmr: true,
    watch: {
      usePolling: true,
      interval: 100
    }
  },
  optimizeDeps: {
    include: ['@srcbook/shared']
  },
  build: {
    sourcemap: true,
    minify: false,
    rollupOptions: {
      external: [
        /node:.*/, 
        'express',
        'ws',
        'cors'
      ]
    }
  }
});
