import { useParams, useNavigate } from '@tanstack/react-router'

export function ToolEditor() {
  const { imageId, toolType } = useParams({ from: '/edit/$imageId/tool/$toolType' })
  const navigate = useNavigate()

  const handleBackToEditor = () => {
    navigate({ 
      to: '/edit/$imageId', 
      params: { imageId },
      search: { state: 'editImage' }
    })
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleBackToEditor}
            className="flex items-center gap-2 px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-800"
          >
            ← Back to Editor
          </button>
          <h1 className="text-2xl font-bold">Tool: {toolType}</h1>
        </div>
      </div>

      <div className="text-center">
        <p>Tool Editor for {toolType} on image {imageId}</p>
        <p className="text-gray-400 mt-2">Tool implementation goes here</p>
      </div>
    </div>
  )
}
