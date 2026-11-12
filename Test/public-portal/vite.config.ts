import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('three') || id.includes('@react-three') || id.includes('troika') || id.includes('maath') || id.includes('meshline')) {
              return 'vendor-three';
            }
            if (id.includes('jspdf')) {
              return 'vendor-jspdf';
            }
            if (id.includes('@mui') || id.includes('@emotion')) {
              return 'vendor-mui';
            }
            if (id.includes('framer-motion') || id.includes('motion-dom') || id.includes('motion-utils')) {
              return 'vendor-motion';
            }
            if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('react-router') || id.includes('/scheduler/')) {
              return 'vendor-react';
            }
          }
        },
      },
    },
  },
});