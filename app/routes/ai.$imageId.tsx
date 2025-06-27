import { createFileRoute } from '@tanstack/react-router'
import { AIEditorComponent } from '../components/AIEditorComponent'

export const Route = createFileRoute('/ai/$imageId')({
  component: AIEditorComponent,
})
