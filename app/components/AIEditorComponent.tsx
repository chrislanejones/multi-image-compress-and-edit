import React from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function AIEditorComponent() {
  const { imageId } = useParams({ from: '/ai/$imageId' })
  const navigate = useNavigate()

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>AI Editor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>AI-powered editing features coming soon!</p>
          <Button 
            onClick={() => navigate({ to: '/edit/$imageId', params: { imageId } })}
            className="w-full"
          >
            Back to Edit
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
