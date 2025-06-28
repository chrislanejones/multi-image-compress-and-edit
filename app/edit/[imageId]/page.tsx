'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useImageContext } from '../../context/ImageContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Crop, Type, Paintbrush, Blur, Download, Save, RotateCcw } from 'lucide-react';
import Image from 'next/image';

export default function EditPage() {
  const params = useParams();
  const router = useRouter();
  const { images, selectImage, updateImage } = useImageContext();

  const imageId = params.imageId as string;
  const selectedImage = images.find(img => img.id === imageId);

  React.useEffect(() => {
    if (selectedImage) {
      selectImage(selectedImage);
    }
  }, [selectedImage, selectImage]);

  if (!selectedImage) {
    router.push('/gallery');
    return null;
  }

  const tools = [
    {
      name: 'Crop & Resize',
      icon: Crop,
      description: 'Crop and resize your image',
      action: () => console.log('Crop tool - Coming soon!'),
    },
    {
      name: 'Add Text',
      icon: Type,
      description: 'Add text overlay to image',
      action: () => console.log('Text tool - Coming soon!'),
    },
    {
      name: 'Paint & Draw',
      icon: Paintbrush,
      description: 'Draw and paint on image',
      action: () => console.log('Paint tool - Coming soon!'),
    },
    {
      name: 'Blur Effects',
      icon: Blur,
      description: 'Add blur and focus effects',
      action: () => console.log('Blur tool - Coming soon!'),
    },
  ];

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = selectedImage.url;
    a.download = selectedImage.file.name || 'edited-image.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSave = () => {
    // In a real app, this would save the edited image
    console.log('Saving changes...');
    alert('Changes saved! (Demo mode)');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.push(`/gallery?selected=${imageId}`)}
                variant="ghost"
                size="icon"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Edit Image</h1>
                <p className="text-sm text-muted-foreground">{selectedImage.file.name}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
          {/* Tools sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div>
              <h3 className="font-semibold mb-4 text-lg">Tools</h3>
              <div className="space-y-3">
                {tools.map(tool => (
                  <Button
                    key={tool.name}
                    className="w-full justify-start h-auto p-4 text-left"
                    variant="outline"
                    onClick={tool.action}
                  >
                    <div className="flex flex-col items-start w-full">
                      <div className="flex items-center mb-1">
                        <tool.icon className="h-4 w-4 mr-2" />
                        <span className="font-medium text-sm">{tool.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{tool.description}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-3">Quick Actions</h4>
              <div className="space-y-2">
                <Button className="w-full" variant="outline" size="sm">
                  Auto Enhance
                </Button>
                <Button className="w-full" variant="outline" size="sm">
                  <RotateCcw className="h-3 w-3 mr-2" />
                  Reset All
                </Button>
              </div>
            </div>
          </div>

          {/* Main editing area */}
          <div className="lg:col-span-5">
            <div className="bg-muted/20 rounded-lg p-8 min-h-[600px] flex items-center justify-center border-2 border-dashed border-muted">
              <div className="text-center">
                <Image
                  src={selectedImage.url}
                  alt={selectedImage.file.name}
                  width={800}
                  height={600}
                  className="max-w-full max-h-[600px] object-contain rounded shadow-lg mx-auto"
                />
                <div className="mt-4 p-3 bg-background/80 rounded-lg inline-block">
                  <p className="text-sm text-muted-foreground">
                    Select a tool from the sidebar to start editing
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-muted/30 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium mb-1">File Information</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedImage.file.type} • {(selectedImage.file.size / 1024 / 1024).toFixed(2)}{' '}
                    MB
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Status</h4>
                  <p className="text-sm text-green-600">Ready to edit</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Changes</h4>
                  <p className="text-sm text-muted-foreground">No changes yet</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
