import { createFileRoute } from '@tanstack/react-router'
import { CropComponent } from '../components/tool-components/CropComponent'

export const Route = createFileRoute('/edit/$imageId/crop')({
  component: CropComponent,
})
