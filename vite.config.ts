import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import path from "path";

export default defineConfig({
  plugins: [
    TanStackRouterVite({
      routesDirectory: "./app/routes",
      generatedRouteTree: "./app/routeTree.gen.ts",
      // Modern TanStack Router options
      routeFileIgnorePrefix: "-",
      quoteStyle: "single",
    }),
    react({
      // Optimize React for Bun + Vite
      babel: {
        plugins: [
          // Remove console.log in production
          process.env.NODE_ENV === "production" && [
            "babel-plugin-transform-remove-console",
            { exclude: ["error", "warn"] },
          ],
        ].filter(Boolean),
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./app"),
      "~": path.resolve(__dirname, "./app"),
    },
  },

  // Optimized for Bun's fast transpilation
  build: {
    outDir: "dist",
    sourcemap: false,
    minify: "esbuild", // Bun works great with esbuild
    target: "esnext",
    rollupOptions: {
      output: {
        // Better chunk splitting for Bun
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["@tanstack/react-router"],
          ui: ["lucide-react"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },

  server: {
    port: 5173,
    host: true,
    // Optimized for Bun's speed
    hmr: {
      overlay: false,
    },
  },

  // Bun-optimized dependency handling
  optimizeDeps: {
    include: ["react", "react-dom", "@tanstack/react-router", "lucide-react"],
    exclude: ["@tanstack/router-cli"],
    // Let Bun handle more of the bundling
    force: false,
  },

  css: {
    devSourcemap: false,
  },

  preview: {
    port: 4173,
    host: true,
  },

  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === "development"),
  },
});
