import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { BulkCropComponent } from '../components/bulk/BulkCropComponent'

const bulkCropSearchSchema = z.object({
  selected: z.string().optional(),
})

export const Route = createFileRoute('/bulk/crop')({
  validateSearch: bulkCropSearchSchema,
  component: BulkCropComponent,
})
