import {
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'

import UploadPage from '../src/pages/UploadPage'
import GalleryPage from '../src/pages/GalleryPage'
import EditPage from '../src/pages/EditPage'
import ToolPage from '../src/pages/ToolPage'

const rootRoute = createRootRoute()

const uploadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: UploadPage,
})

const galleryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/gallery',
  component: GalleryPage,
})

const editRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/edit/$imageId',
  component: EditPage,
})

const toolRoute = createRoute({
  getParentRoute: () => editRoute,
  path: '/tool/$toolType',
  component: ToolPage,
})

export const routeTree = rootRoute.addChildren([
  uploadRoute,
  galleryRoute,
  editRoute.addChildren([toolRoute]),
])

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
})
