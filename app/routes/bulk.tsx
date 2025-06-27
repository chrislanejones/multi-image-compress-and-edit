import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { BulkEditComponent } from '../components/bulk/BulkEditComponent'

const bulkSearchSchema = z.object({
  selected: z.string().optional(),
})

export const Route = createFileRoute('/bulk')({
  validateSearch: bulkSearchSchema,
  component: BulkEditComponent,
})
