import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { EditComponent } from '../components/EditComponent'

const editSearchSchema = z.object({
  mode: z.enum(['resize', 'bulk']).optional().default('resize'),
})

export const Route = createFileRoute('/edit/$imageId')({
  validateSearch: editSearchSchema,
  component: EditComponent,
})
