import { router } from './router'

export default createStartHandler({
  router,
  getRouterManifest,
})(defaultStreamHandler)
