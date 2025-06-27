import { createFileRoute } from '@tanstack/react-router'
import { TextComponent } from '../components/tool-components/TextComponent'

export const Route = createFileRoute('/edit/$imageId/text')({
  component: TextComponent,
})
