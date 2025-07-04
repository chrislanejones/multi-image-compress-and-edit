// vite.config.analyze.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import { visualizer } from "rollup-plugin-visualizer";
import path from "path";

export default defineConfig({
  plugins: [
    TanStackRouterVite({
      routesDirectory: "./app/routes",
      generatedRouteTree: "./app/routeTree.gen.ts",
      routeFileIgnorePrefix: "-",
      quoteStyle: "single",
    }),
    react({
      babel: {
        plugins: [
          process.env.NODE_ENV === "production" && [
            "babel-plugin-transform-remove-console",
            { exclude: ["error", "warn"] },
          ],
        ].filter(Boolean),
      },
    }),
    // Bundle analyzer plugins
    visualizer({
      filename: "dist/bundle-analysis.html",
      open: true,
      gzipSize: true,
      brotliSize: true,
      template: "treemap", // 'treemap' | 'sunburst' | 'network'
    }),
    visualizer({
      filename: "dist/bundle-stats.json",
      json: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./app"),
      "~": path.resolve(__dirname, "./app"),
    },
  },

  build: {
    outDir: "dist",
    sourcemap: true, // Enable for analysis
    minify: "esbuild",
    target: "esnext",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["@tanstack/react-router"],
          ui: ["lucide-react"],
          radix: [
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-select",
            "@radix-ui/react-slider",
          ],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    // Generate detailed build info
    reportCompressedSize: true,
  },

  server: {
    port: 5173,
    host: true,
  },

  optimizeDeps: {
    include: ["react", "react-dom", "@tanstack/react-router", "lucide-react"],
    exclude: ["@tanstack/router-cli"],
  },

  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === "development"),
    __ANALYZE__: JSON.stringify(true),
  },
});
