// WARNING: The following imports are placeholders.
// You MUST replace them with actual imports for your SSR setup to function correctly.
// These functions are typically provided by your framework (like Next.js) or a specific library.
// If you are not using SSR or this file is not needed for your setup, you can remove it.
declare const createStartHandler: any;
declare const defaultStreamHandler: any;
declare function getRouterManifest(): any; // Assuming this is a function

// If you ARE using SSR with TanStack Router, consult their documentation for the correct setup.
// For example, you might need to import from '@tanstack/react-router-server'.

import { router } from './router'; // Assuming router is exported from app/router.tsx

// This export structure might need to change based on your SSR needs.
export default createStartHandler({
  router,
  getRouterManifest,
})(defaultStreamHandler);
