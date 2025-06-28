import { useParams, useSearch, useNavigate } from '@tanstack/react-router'

export function ImageEditor() {
  const { imageId } = useParams({ from: '/edit/$imageId' })
  const search = useSearch({ from: '/edit/$imageId' })
  const navigate = useNavigate()

  const editorState = search.state || 'editImage'

  const handleBackToGallery = () => {
    navigate({ to: '/gallery', search: { state: 'resizeAndOptimize' } })
  }

  const handleToolSelect = (toolType: string) => {
    navigate({
      to: '/edit/$imageId/tool/$toolType',
      params: { imageId, toolType }
    })
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleBackToGallery}
            className="flex items-center gap-2 px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-800"
          >
            ← Back to Gallery
          </button>
          <h1 className="text-2xl font-bold">Image Editor - {editorState}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-gray-800 p-6 rounded-lg">
          <div className="flex items-center justify-center min-h-[400px] bg-gray-900 rounded-lg">
            <p>Image {imageId} will be displayed here</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Tools</h3>
            <div className="space-y-2">
              {['crop', 'blur', 'paint', 'text'].map((tool) => (
                <button
                  key={tool}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-700 capitalize"
                  onClick={() => handleToolSelect(tool)}
                >
                  {tool}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
