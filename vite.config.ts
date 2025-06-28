import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

export default defineConfig({
  plugins: [
    TanStackRouterVite({
      routesDirectory: './app/routes',
      generatedRouteTree: './app/routeTree.gen.ts',
    }),
    react(),
  ],
  resolve: {
    alias: {
      '@': '/app/components',
      '~': '/app',
    },
  },
  css: {
    postcss: './postcss.config.js',
  },
})
