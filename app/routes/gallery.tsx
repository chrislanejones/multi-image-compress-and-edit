import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { GalleryComponent } from '../components/GalleryComponent'

const gallerySearchSchema = z.object({
  selected: z.string().optional(),
  page: z.number().optional().default(1),
})

export const Route = createFileRoute('/gallery')({
  validateSearch: gallerySearchSchema,
  component: GalleryComponent,
})
