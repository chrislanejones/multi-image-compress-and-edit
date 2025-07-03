import { createFileRoute } from '@tanstack/react-router'
import ResizeAndOptimize from '@/components/resize-and-optimize'

export const Route = createFileRoute('/resize-and-optimize')({
  component: ResizeAndOptimize,
})
