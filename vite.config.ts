import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    TanStackRouterVite({
      routesDirectory: './app/routes',
      generatedRouteTree: './app/routeTree.gen.ts',
    }),
    react()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './app'),
      '~': path.resolve(__dirname, './app'),
    },
  },
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
  },
  server: {
    port: 5173,
    host: true,
  },
  optimizeDeps: {
    exclude: ['@tanstack/router-cli']
  }
})
