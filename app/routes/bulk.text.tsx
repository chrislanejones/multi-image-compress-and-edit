import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { BulkTextComponent } from '../components/bulk/BulkTextComponent'

const bulkTextSearchSchema = z.object({
  selected: z.string().optional(),
})

export const Route = createFileRoute('/bulk/text')({
  validateSearch: bulkTextSearchSchema,
  component: BulkTextComponent,
})
