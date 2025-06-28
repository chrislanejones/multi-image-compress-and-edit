import { defineConfig } from '@tanstack/start/config';

export default defineConfig({
  router: {
    routesDirectory: './app/routes',
    generatedRouteTree: './app/routeTree.gen.ts',
  },
});
