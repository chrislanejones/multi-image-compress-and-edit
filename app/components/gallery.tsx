import { useNavigate, useSearch } from '@tanstack/react-router'

export function Gallery() {
  const navigate = useNavigate()
  const search = useSearch({ from: '/gallery' })

  const handleBackToUpload = () => {
    navigate({ to: '/' })
  }

  const handleSelectImage = () => {
    navigate({ 
      to: '/edit/$imageId', 
      params: { imageId: 'demo-image' },
      search: { state: 'editImage' }
    })
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleBackToUpload}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            ← Back to Upload
          </button>
          <h1 className="text-2xl font-bold">Gallery - {search.state}</h1>
        </div>
      </div>

      <div className="text-center py-20">
        <p className="text-gray-600 mb-4">Gallery view will be implemented here</p>
        <button 
          onClick={handleSelectImage}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Demo: Select Image for Editing
        </button>
      </div>
    </div>
  )
}
