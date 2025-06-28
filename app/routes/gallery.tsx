import { createFileRoute } from '@tanstack/react-router'
import { Gallery } from '~/components/gallery'

type GallerySearch = {
  state?: 'resizeAndOptimize'
}

export const Route = createFileRoute('/gallery')({
  component: Gallery,
  validateSearch: (search: Record<string, unknown>): GallerySearch => ({
    state: (search.state as GallerySearch['state']) || 'resizeAndOptimize',
  }),
})
