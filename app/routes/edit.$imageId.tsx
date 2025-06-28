import { createFileRoute } from '@tanstack/react-router'
import EditPageComponent from '@/components/edit-page'

type EditorSearch = {
  state?: 'editImage' | 'bulkImageEdit' | 'aiEditor'
}

export const Route = createFileRoute('/edit/$imageId')({
  component: EditPageComponent,
  validateSearch: (search: Record<string, unknown>): EditorSearch => ({
    state: (search.state as EditorSearch['state']) || 'editImage',
  }),
})
