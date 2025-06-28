import { createFileRoute } from '@tanstack/react-router'
import { ToolEditor } from '~/components/editor/tool-editor'

export const Route = createFileRoute('/edit/$imageId/tool/$toolType')({
  component: ToolEditor,
})
