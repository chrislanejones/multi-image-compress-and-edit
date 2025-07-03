import { createFileRoute } from '@tanstack/react-router'
import PhotoUpload from '@/components/photo-upload'

export const Route = createFileRoute('/')({
  component: PhotoUpload,
})
