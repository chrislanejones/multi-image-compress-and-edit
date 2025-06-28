'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ImageFile, EditorState } from '@/types/types';
import { Crop, Type, X } from 'lucide-react';
import Image from 'next/image';

interface BulkImageEditorProps {
  editorState: EditorState;
  images: ImageFile[];
  selectedImageId: string;
  onStateChange: (state: EditorState) => void;
  onSelectImage: (imageId: string) => void;
  onNavigateImage: () => void;
  onClose: () => void;
  onRemoveAll: () => void;
  onUploadNew: () => void;
}

const BulkImageEditor: React.FC<BulkImageEditorProps> = ({
  editorState,
  images,
  selectedImageId,
  onStateChange,
  onClose,
}) => {
  const selectedImage = images.find(img => img.id === selectedImageId);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">Bulk Editor - {editorState}</h2>
        <div className="flex gap-2">
          <Button onClick={() => onStateChange('bulkCrop')} variant="outline" size="sm">
            <Crop className="h-4 w-4 mr-2" />
            Crop
          </Button>
          <Button onClick={() => onStateChange('bulkTextEditor')} variant="outline" size="sm">
            <Type className="h-4 w-4 mr-2" />
            Text
          </Button>
          <Button onClick={onClose} variant="outline" size="sm">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 bg-muted/20">
        {selectedImage && (
          <Image
            src={selectedImage.url}
            alt={selectedImage.file.name}
            width={800}
            height={600}
            className="max-w-full max-h-full object-contain rounded shadow-lg"
          />
        )}
      </div>

      <div className="p-4 border-t bg-muted/30">
        <p className="text-sm text-muted-foreground">
          {images.length} images selected for bulk editing
        </p>
      </div>
    </div>
  );
};

export default BulkImageEditor;
