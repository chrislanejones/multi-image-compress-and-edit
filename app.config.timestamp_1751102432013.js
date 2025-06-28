// app.config.ts
import { defineConfig } from "@tanstack/start/config";
var app_config_default = defineConfig({
  vite: {
    resolve: {
      alias: {
        "@": "/components",
        "~": "/app"
      }
    }
  },
  tsr: {
    routesDirectory: "./app/routes",
    generatedRouteTree: "./app/routeTree.gen.ts"
  }
});
export {
  app_config_default as default
};
