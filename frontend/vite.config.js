import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/InteractiveLanguageMap2/',
  build: {
    target: ['es2022', 'chrome100', 'edge100', 'firefox100', 'safari15'],
  },
  esbuild: {
    supported: {
      'top-level-await': true,  // Explicitly enable top-level await support
    },
  },
  preview: {
    host: '0.0.0.0', // Allow external access in preview mode
    port: 8080,
    allowedHosts: [
      'interactivelanguagemap2.onrender.com', // Allow this host
    ],
  },
});
