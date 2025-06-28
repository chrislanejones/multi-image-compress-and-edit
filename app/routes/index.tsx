import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">ImageHorse</h1>
      <div className="space-y-4">
        <p>Welcome to ImageHorse - Your multi-image compress and edit tool!</p>
        {/* Add your page content here */}
      </div>
    </div>
  )
}
