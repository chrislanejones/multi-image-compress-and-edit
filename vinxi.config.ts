import { createApp } from 'vinxi';

export default createApp({
  routers: [
    {
      name: 'public',
      type: 'static',
      dir: './public',
    },
    {
      name: 'ssr',
      type: 'http',
      handler: './app/ssr.tsx',
      target: 'server',
      plugins: () => [
        import('@vitejs/plugin-react').then(r => r.default()),
        import('@tanstack/router-vite-plugin').then(r => r.TanStackRouterVite()),
      ],
    },
  ],
});
