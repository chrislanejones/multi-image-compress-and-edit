import { createFileRoute } from '@tanstack/react-router'
import { PaintComponent } from '../components/tool-components/PaintComponent'

export const Route = createFileRoute('/edit/$imageId/paint')({
  component: PaintComponent,
})
