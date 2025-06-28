import { createFileRoute } from '@tanstack/react-router'
import PhotoUpload from '@/components/photo-upload'

function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <h1 className="text-3xl font-bold mb-6 capitalize">Image Horse</h1>
        <div className="w-full max-w-md">
          <PhotoUpload />
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/')({
  component: HomePage,
})
