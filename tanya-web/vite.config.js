import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  appType: 'custom', // Custom app type for SSR
  resolve: {
    alias: {
      events: 'events',
    },
  },
  define: {
    'process.env': {}, // Polyfill process for some older libs if needed
  },
  ssr: {
    external: ['parse'], // Don't bundle parse SDK
  },
});
