import { createFileRoute } from '@tanstack/react-router'
import { ToolEditor } from '@/components/editor/tool-editor'

type ToolSearch = {
  toolType: 'crop' | 'blur' | 'paint' | 'text' | 'bulkCrop' | 'bulkTextEditor'
}

export const Route = createFileRoute('/edit/$imageId/tool/$toolType')({
  component: ToolEditor,
  validateSearch: (search: Record<string, unknown>): ToolSearch => ({
    toolType: search.toolType as ToolSearch['toolType'],
  }),
})
