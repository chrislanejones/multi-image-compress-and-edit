import { createFileRoute } from '@tanstack/react-router'
import { UploadComponent } from '../components/UploadComponent'

export const Route = createFileRoute('/')({
  component: UploadComponent,
})
