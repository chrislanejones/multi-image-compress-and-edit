'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ImageFile } from '@/types/types';
import { Download, X } from 'lucide-react';
import Image from 'next/image';

interface ImageEditorProps {
  imageUrl: string;
  onImageChange: (newImageUrl: string) => void;
  onDownload?: () => void;
  onClose: () => void;
  fileName: string;
  fileType: string;
  fileSize: number;
  allImages: ImageFile[];
  currentImageId: string;
  onSelectImage: (image: ImageFile) => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({
  imageUrl,
  onDownload,
  onClose,
  fileName,
  fileType,
  fileSize,
}) => {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">Image Editor</h2>
        <div className="flex gap-2">
          {onDownload && (
            <Button onClick={onDownload} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          )}
          <Button onClick={onClose} variant="outline" size="sm">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 bg-muted/20">
        <Image
          src={imageUrl}
          alt={fileName}
          width={800}
          height={600}
          className="max-w-full max-h-full object-contain rounded shadow-lg"
        />
      </div>

      <div className="p-4 border-t bg-muted/30">
        <p className="text-sm text-muted-foreground">
          {fileName} • {fileType} • {Math.round(fileSize / 1024)}KB
        </p>
      </div>
    </div>
  );
};

export default ImageEditor;
