import { createFileRoute } from '@tanstack/react-router'
import { ImageEditor } from '~/components/editor/image-editor'

type EditorSearch = {
  state?: 'editImage' | 'bulkImageEdit' | 'aiEditor'
}

export const Route = createFileRoute('/edit/$imageId')({
  component: ImageEditor,
  validateSearch: (search: Record<string, unknown>): EditorSearch => ({
    state: (search.state as EditorSearch['state']) || 'editImage',
  }),
})
