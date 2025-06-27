import { createFileRoute } from '@tanstack/react-router'
import { BlurComponent } from '../components/tool-components/BlurComponent'

export const Route = createFileRoute('/edit/$imageId/blur')({
  component: BlurComponent,
})
