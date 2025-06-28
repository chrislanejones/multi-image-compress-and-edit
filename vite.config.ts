// For TanStack Start, most configuration should be in app.config.ts
// This file is mainly for any additional Vite-specific settings not covered by Start
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      '@': '/components',
      '~': '/app',
    },
  },
});
