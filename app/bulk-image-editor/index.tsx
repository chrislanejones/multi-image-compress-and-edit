import React from 'react';
import { Button } from '~/components/ui/button';
import { ImageFile, EditorState } from '@/types/index';

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
  onSelectImage,
  onNavigateImage,
  onClose,
  onRemoveAll,
  onUploadNew,
}) => {
  const selectedImage = images.find(img => img.id === selectedImageId);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">Bulk Editor - {editorState}</h2>
        <div className="flex gap-2">
          <Button onClick={() => onStateChange('bulkCrop')} variant="outline">
            Crop
          </Button>
          <Button onClick={() => onStateChange('bulkTextEditor')} variant="outline">
            Text
          </Button>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        {selectedImage && (
          <img
            src={selectedImage.url}
            alt={selectedImage.file.name}
            className="max-w-full max-h-full object-contain"
          />
        )}
      </div>

      <div className="p-4 border-t">
        <p className="text-sm text-gray-600">{images.length} images selected</p>
      </div>
    </div>
  );
};

export default BulkImageEditor;
