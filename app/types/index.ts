"use client";

// ===== CORE IMAGE TYPES =====
export interface ImageFile {
  id: string;
  file: File;
  url: string;
  width?: number;
  height?: number;
  metadata?: {
    originalSize: number; // in bytes
    compressedSize: number; // in bytes
    compressionRatio: number; // integer percentage
  };
}

export interface GlobalImage extends ImageFile {
  thumbnail?: string;
  compressed?: string;
  originalSize: number; // Keep for backward compatibility with existing code
  compressedSize?: number; // Keep for backward compatibility with existing code
  extendedMetadata?: ImageMetadata;
}

export interface ImageMetadata {
  format?: string;
  quality?: number;
  lastModified?: number;
  isOptimized?: boolean;
  editHistory?: EditAction[];
}

export interface EditAction {
  id: string;
  type: EditType;
  timestamp: number;
  parameters: Record<string, any>;
  description?: string;
}

export type ImageFormat = "jpeg" | "png" | "webp" | "avif";

export interface CompressionSettings {
  format: ImageFormat;
  quality: number;
  maxWidth?: number;
  maxHeight?: number;
  maintainAspectRatio?: boolean;
}

export interface CompressionResult {
  url: string;
  blob: Blob;
  size: number;
  width: number;
  height: number;
  compressionRatio: number;
}

// ===== EDITOR STATE AND NAVIGATION =====
export type EditorState =
  | "resizeAndOptimize"
  | "editImage"
  | "bulkImageEdit"
  | "crop"
  | "blur"
  | "paint"
  | "text"
  | "bulkCrop"
  | "bulkTextEditor"
  | "aiEditor";

export type NavigationDirection = "next" | "prev" | "next10" | "prev10";

export type EditType =
  | "crop"
  | "resize"
  | "rotate"
  | "flip"
  | "blur"
  | "paint"
  | "text"
  | "filter"
  | "compress";

// ===== CROPPING =====
export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
  unit?: "px" | "%";
}

export interface CropSettings {
  aspect?: number;
  cropShape?: "rect" | "round";
  showGrid?: boolean;
  restrictPosition?: boolean;
}

// ===== RESIZE AND OPTIMIZATION =====
export interface ResizeSettings {
  width: number;
  height: number;
  quality: number;
  format: ImageFormat;
  maintainAspectRatio?: boolean;
  resizeMode?: "contain" | "cover" | "stretch";
}

export interface OptimizationSettings {
  targetSizeKB?: number;
  compressionLevel: "low" | "medium" | "high" | "extremeSmall" | "extremeBW";
  progressive?: boolean;
  stripMetadata?: boolean;
}

// ===== COMPONENT PROPS =====
export interface OptimizedImageProps {
  image: ImageFile;
  isSelected: boolean;
  onClick: () => void;
  onRemove: (id: string, e: React.MouseEvent) => void;
}

export interface ThumbnailProps {
  image: ImageFile;
  isSelected: boolean;
  onClick: () => void;
  onRemove: (e: React.MouseEvent) => void;
  forceUpdate: (obj: {}) => void;
  size?: "small" | "medium" | "large";
}

// ===== GALLERY AND PAGINATION =====
export interface GalleryData {
  totalGalleryPages: number;
  currentImages: ImageFile[];
  currentSelectedImage: ImageFile | null;
}

export interface PaginationData {
  totalPages: number;
  currentImages: ImageFile[];
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface GalleryStats {
  totalOriginalSize: number;
  totalCompressedSize: number;
  totalSavings: number;
  savingsPercent: number;
  imageCount: number;
}

// ===== TOOLS AND EDITING =====
export interface PaintSettings {
  brushSize: number;
  brushColor: string;
  brushOpacity: number;
  blendMode?: "normal" | "multiply" | "screen" | "overlay";
}

export interface BlurSettings {
  radius: number;
  type: "gaussian" | "motion" | "radial";
  strength: number;
}

export interface TextSettings {
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  position: { x: number; y: number };
  alignment: "left" | "center" | "right";
  bold?: boolean;
  italic?: boolean;
}

export interface FilterSettings {
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  sepia: number;
  grayscale: number;
}

// ===== BULK OPERATIONS =====
export interface BulkOperation {
  id: string;
  type: EditType;
  settings: any;
  targetImageIds: string[];
  progress: number;
  status: "pending" | "processing" | "completed" | "failed";
  error?: string;
}

export interface BulkProcessingOptions {
  batchSize: number;
  onProgress?: (current: number, total: number) => void;
  onComplete?: (results: any[]) => void;
  onError?: (error: Error) => void;
}

// ===== DOWNLOAD AND EXPORT =====
export interface DownloadOptions {
  format: ImageFormat;
  quality: number;
  filename?: string;
  includeMetadata?: boolean;
}

export interface BulkDownloadOptions extends DownloadOptions {
  zipFilename: string;
  createZip: boolean;
  folderStructure?: "flat" | "byType" | "byDate";
}

export interface ExportResult {
  success: boolean;
  url?: string;
  blob?: Blob;
  filename?: string;
  error?: string;
}

// ===== UPLOAD AND PROCESSING =====
export interface UploadOptions {
  maxFileSize: number;
  allowedTypes: string[];
  autoCompress: boolean;
  generateThumbnails: boolean;
}

export interface ProcessingProgress {
  current: number;
  total: number;
  stage: "uploading" | "processing" | "compressing" | "complete";
  currentFile?: string;
}

// ===== THEME AND UI =====
export type ThemeMode = "light" | "dark" | "system";

export interface UISettings {
  theme: ThemeMode;
  thumbnailSize: "small" | "medium" | "large";
  gridColumns: number;
  showPreview: boolean;
  autoSave: boolean;
}

// ===== CONTEXT TYPES =====
export interface ImageContextType {
  images: ImageFile[];
  selectedImage: ImageFile | null;
  selectedImageId: string | null;
  editorState: EditorState;
  isEditMode: boolean;
  currentPage: number;
  totalPages: number;
  addImages: (files: FileList) => void;
  removeImage: (id: string) => void;
  removeAllImages: () => void;
  selectImage: (image: ImageFile) => void;
  updateImageUrl: (id: string, newUrl: string) => void;
  navigateImage: (direction: NavigationDirection) => void;
  setCurrentPage: (page: number) => void;
  setEditorState: (state: EditorState) => void;
  setEditMode: (isEditMode: boolean) => void;
}

// ===== EVENT TYPES =====
export interface ImageUploadEvent {
  files: File[];
  totalSize: number;
  timestamp: number;
}

export interface ImageEditEvent {
  imageId: string;
  editType: EditType;
  settings: any;
  timestamp: number;
}

export interface ImageDownloadEvent {
  imageIds: string[];
  format: ImageFormat;
  timestamp: number;
}

// ===== ERROR TYPES =====
export interface ImageProcessingError {
  code: string;
  message: string;
  imageId?: string;
  details?: any;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// ===== UTILITY TYPES =====
export type Dimensions = {
  width: number;
  height: number;
};

export type Position = {
  x: number;
  y: number;
};

export type RGBA = {
  r: number;
  g: number;
  b: number;
  a: number;
};

// ===== HOOKS TYPES =====
export interface UseImageEditorReturn {
  currentImage: ImageFile | null;
  isEditing: boolean;
  editorState: EditorState;
  setEditorState: (state: EditorState) => void;
  applyEdit: (editType: EditType, settings: any) => Promise<void>;
  undoEdit: () => void;
  redoEdit: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export interface UseImageUploadReturn {
  uploadImages: (files: FileList) => Promise<void>;
  isUploading: boolean;
  uploadProgress: ProcessingProgress;
  uploadError: string | null;
}

// ===== API TYPES =====
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ImageProcessingRequest {
  imageId: string;
  operation: EditType;
  settings: any;
}

export interface ImageProcessingResponse {
  imageId: string;
  resultUrl: string;
  metadata: ImageMetadata;
  processingTime: number;
}

// ===== STORAGE TYPES =====
export interface StorageItem {
  id: string;
  data: any;
  timestamp: number;
  expiresAt?: number;
}

export interface CacheEntry<T = any> {
  key: string;
  value: T;
  timestamp: number;
  ttl?: number;
}

// ===== KEYBOARD SHORTCUTS =====
export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

// ===== ADVANCED EDITING =====
export interface LayerData {
  id: string;
  type: "image" | "text" | "shape";
  visible: boolean;
  opacity: number;
  blendMode: string;
  position: Position;
  data: any;
}

export interface HistoryState {
  id: string;
  imageData: string;
  description: string;
  timestamp: number;
}

// ===== TYPE GUARDS =====
export function isImageFile(obj: any): obj is ImageFile {
  return obj && typeof obj.id === "string" && obj.file instanceof File;
}

export function isGlobalImage(obj: any): obj is GlobalImage {
  return (
    isImageFile(obj) &&
    (obj.thumbnail !== undefined || obj.compressed !== undefined)
  );
}

export function isValidImageFormat(format: string): format is ImageFormat {
  return ["jpeg", "png", "webp", "avif"].includes(format);
}

// ===== CONSTANTS =====
export const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
] as const;

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const DEFAULT_COMPRESSION_QUALITY = 85;
export const DEFAULT_THUMBNAIL_SIZE = 200;
export const IMAGES_PER_PAGE = 12;

// ===== RE-EXPORTS FROM IMAGE-UTILS =====
// These types are already defined in image-utils.ts but exported here for convenience
export type { CropArea as UtilsCropArea } from "../utils/core-image-utils";

// ===== DEPRECATED TYPES (for backward compatibility) =====
/**
 * @deprecated GlobalImage now extends ImageFile - use ImageFile for new code
 */
export type LegacyImageFile = ImageFile;

// ===== UTILITY TYPE HELPERS =====
/**
 * Helper to extract metadata from ImageFile
 */
export type ImageFileMetadata = NonNullable<ImageFile["metadata"]>;

/**
 * Helper to create ImageFile with required metadata
 */
export type ImageFileWithMetadata = ImageFile & {
  metadata: {
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
  };
};
