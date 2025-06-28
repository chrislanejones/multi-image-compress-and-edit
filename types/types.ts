export interface ImageFile {
  id: string;
  file: File;
  url: string;
}

export type NavigationDirection = 'next' | 'prev' | 'next10' | 'prev10';

export type EditorState =
  | 'imageEdit'
  | 'bulkImageEdit'
  | 'bulkCrop'
  | 'bulkTextEditor'
  | 'resizeAndOptimize';

export interface EditToolProps {
  imageUrl: string;
  onApply: (editedImageUrl: string) => void;
  onCancel: () => void;
}

export interface ImageEditorProps {
  imageUrl: string;
  onImageChange: (newImageUrl: string) => void;
  onDownload?: () => void;
  onClose: () => void;
  fileName: string;
  fileType: string;
  fileSize: number;
  currentPage?: number;
  totalPages?: number;
  onNavigateImage?: (direction: NavigationDirection) => void;
  onRemoveAll?: () => void;
  onUploadNew?: () => void;
  allImages: ImageFile[];
  currentImageId: string;
  onSelectImage: (image: ImageFile) => void;
}
