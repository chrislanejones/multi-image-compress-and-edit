"use client";

export interface ThemeProviderProps {
  children: React.ReactNode;
  attribute?: string;
  defaultTheme?: string;
}

// ===== CORE IMAGE TYPES =====

/**
 * Represents a blur brush stroke for selective blurring
 */
export interface BlurStroke {
  id: string;
  points: { x: number; y: number }[];
  blurAmount: number;
  brushSize: number;
  timestamp: number;
}

/**
 * Represents a paint stroke for drawing/painting
 */
export interface PaintStroke {
  id: string;
  tool: "brush" | "eraser";
  points: { x: number; y: number }[];
  color: string;
  brushSize: number;
  timestamp: number;
}

/**
 * Represents the core data structure for an image file within the application.
 */
export interface ImageFile {
  id: string;
  file: File; // ← keep required
  url: string;
  name: string;
  size: number;
  width: number;
  height: number;
  compressedSize?: number;
  compressedUrl?: string;
  rotation?: number;
  flipHorizontal?: boolean;
  flipVertical?: boolean;
  crop?: { x: number; y: number; width: number; height: number };
  resize?: { width: number; height: number };
  metadata?: ImageMetadata;
}

export interface FullImageContextType {
  images: ImageFile[];
  selectedImage: ImageFile | null;
  paginatedImages: ImageFile[];
  currentPage: number;
  totalPages: number;
  resizeDraft: ResizeDraft | null;
  isCompressing: boolean;
  compressionProgress: number;
  itemsPerPage: number;
  loadingImages: Set<string>;
  onDrop: (acceptedFiles: File[], fileRejections: any[], event: any) => void;
  addImages: (images: ImageFile[]) => void;
  onRemove: (id: string) => void;
  removeAllImages: () => void;
  navigateImage: (direction: NavigationDirection) => void;
  onNavigatePage: (direction: "prev" | "next") => void;
  onClose: () => void;
  onSelect: (id: string | null) => void; // ← added
  updateImage: (id: string, updates: Partial<ImageFile>) => void;
  onRotate: (id: string, degrees: number) => void;
  onCrop: (id: string, crop: ImageFile["crop"]) => void;
  onResize: (id: string, resize?: { width: number; height: number }) => void;
  onCompress: () => void;
  onDownload: () => void;
  onClear: () => void;
  setResizeDraft: (draft: ResizeDraft | null) => void;
  handleApplyResize: () => void;
  handleReset: () => void;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (count: number) => void;
  onRotateLeft: (id: string) => void;
  onRotateRight: (id: string) => void;
  onFlipHorizontal: (id: string) => void;
  onFlipVertical: (id: string) => void;
  onReset: (id: string) => void;
  onApplyCrop: () => void;
  onApplyBlur: () => void;
  onApplyPaint: () => void;
  onApplyText: () => void;
  resetCompression: (id: string) => void;
}

/**
 * Extends ImageFile with properties relevant for global state or caching,
 * such as URLs for different optimized versions.
 * Note: originalSize and compressedSize are now part of ImageMetadata for consistency.
 */
export interface GlobalImage extends ImageFile {
  thumbnail?: string; // URL for a small thumbnail version
  compressed?: string; // URL for a compressed version suitable for display
  // 'originalSize' and 'compressedSize' moved into ImageMetadata.
}

/**
 * Detailed metadata associated with an image file, including optimization data.
 */
export interface ImageMetadata {
  originalSize: number; // in bytes
  compressedSize: number; // in bytes
  compressionRatio: number; // decimal between 0 and 1 (e.g., 0.5 for 50% savings)
  format?: ImageFormat; // The format of the image (e.g., 'jpeg', 'png')
  quality?: number; // Quality setting used for compression (0-100)
  lastModified?: number; // Unix timestamp of last modification
  isOptimized?: boolean; // Flag indicating if the image has undergone optimization
  editHistory?: EditAction[]; // A log of edits applied to the image
}

/**
 * Describes a single edit action performed on an image.
 */
export interface EditAction {
  id: string;
  type: EditType;
  timestamp: number;
  parameters: Record<string, any>; // Parameters specific to the edit type
  description?: string; // Human-readable description of the action
}

/**
 * Defines the supported image formats for processing and export.
 */
export type ImageFormat = "jpeg" | "png" | "webp" | "avif";

/**
 * Settings for image compression operations.
 */
export interface CompressionSettings {
  format: ImageFormat;
  quality: number;
  maxWidth?: number;
  maxHeight?: number;
  maintainAspectRatio?: boolean;
}

/**
 * Result object returned after an image compression or processing operation.
 */
export interface CompressionResult {
  url: string;
  blob: Blob;
  size: number;
  width: number;
  height: number;
  compressionRatio: number; // decimal between 0 and 1
}

/**
 * Represents a draft state for resizing, used in UI for temporary dimension changes.
 */
export interface ResizeDraft {
  width: number;
  height: number;
}

/**
 * Mouse position coordinates.
 */
export interface MousePosition {
  x: number;
  y: number;
}

// ===== EDITOR STATE AND NAVIGATION =====

/**
 * Defines the high-level states within the image editor UI.
 * Route-based modes (crop, blur, paint, text) are handled via URL params.
 */
export type EditorState =
  | "resizeAndOptimize"
  | "editImage" // Generic state for main editing
  | "bulkImageEdit"
  | "aiEditor"
  | "crop"
  | "blur"
  | "paint"
  | "text";

/**
 * Route-based editing modes (no longer in EditorState)
 */
export type EditMode = "crop" | "blur" | "paint" | "text";

/**
 * Route-based bulk editing modes
 */
export type BulkMode = "crop" | "text";

/**
 * Defines directions for navigating between images in a gallery or list.
 */
export type NavigationDirection = "next" | "prev" | "next10" | "prev10";

/**
 * Enumerates the types of editing actions that can be applied to an image.
 */
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

/**
 * Defines a rectangular crop area.
 */
export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
  unit?: "px" | "%"; // Unit of measurement for the coordinates
}

/**
 * Settings for the cropping tool.
 */
export interface CropSettings {
  aspect?: number; // Aspect ratio (e.g., 16/9, 1/1)
  cropShape?: "rect" | "round"; // Shape of the crop area
  showGrid?: boolean; // Whether to display a grid overlay
  restrictPosition?: boolean; // Whether the crop area is restricted within image bounds
}

// ===== RESIZE AND OPTIMIZATION =====

/**
 * Settings for image resizing operations.
 */
export interface ResizeSettings {
  width: number;
  height: number;
  quality: number; // JPEG/WebP quality (0-100)
  format: ImageFormat;
  maintainAspectRatio?: boolean;
  resizeMode?: "contain" | "cover" | "stretch"; // How the image should fit new dimensions
}

/**
 * Settings for image optimization, focusing on file size reduction.
 */
export interface OptimizationSettings {
  targetSizeKB?: number; // Target file size in kilobytes
  compressionLevel: CompressionLevel; // Predefined compression profiles
  progressive?: boolean; // For JPEG, enable progressive rendering
  stripMetadata?: boolean; // Remove EXIF and other metadata
}

/**
 * Predefined levels for image compression, mapping to quality values.
 */
export type CompressionLevel =
  | "low"
  | "medium"
  | "high"
  | "extremeSmall"
  | "extremeBW";

// Constants for compression levels
export const COMPRESSION_LEVELS = [
  { value: "low", label: "Low (Best Quality)", quality: 95 },
  { value: "medium", label: "Medium (Balanced)", quality: 85 },
  { value: "high", label: "High (Smaller File)", quality: 75 },
  { value: "extremeSmall", label: "Extreme (Smallest File)", quality: 60 },
  { value: "extremeBW", label: "Extreme B&W (Black & White)", quality: 30 },
] as const;

// ===== COMPONENT PROPS =====

/**
 * Props for a component displaying an optimized image.
 */
export interface OptimizedImageProps {
  image: ImageFile;
  isSelected: boolean;
  onClick: () => void;
  onRemove: (id: string, e: React.MouseEvent) => void;
}

/**
 * Props for a thumbnail display component.
 */
export interface ThumbnailProps {
  image: ImageFile;
  isSelected: boolean;
  onClick: () => void;
  onRemove: (e: React.MouseEvent) => void;
  forceUpdate: (obj: {}) => void; // A utility prop for re-rendering, consider alternatives if possible
  size?: "small" | "medium" | "large";
}

/**
 * Props for the image resizer UI component.
 */
export interface ImageResizerProps {
  width: number;
  height: number;
  maxWidth: number;
  maxHeight: number;
  onResize: (width: number, height: number) => void;
  onApplyResize: () => void;
  format: ImageFormat;
  onReset: () => void;
  onFormatChange: (format: ImageFormat) => void;
  onDownload?: () => void;
  isCompressing?: boolean;
  quality?: number;
  onQualityChange?: (quality: number) => void;
  compressionLevel: CompressionLevel;
  onCompressionLevelChange?: (level: CompressionLevel) => void;
}

/**
 * Props for a component displaying image statistics (original vs. new).
 */
export interface ImageStatsProps {
  originalStats?: {
    width: number;
    height: number;
    size: number;
    format: ImageFormat;
  };
  newStats?: {
    width: number;
    height: number;
    size: number;
    format: ImageFormat;
  };
  dataSavings: number; // Total data saved in bytes
  hasEdited: boolean; // Flag indicating if edits have been made
  fileName?: string;
  format: ImageFormat; // Current format
  fileType: string; // MIME type (e.g., "image/jpeg")
}

/**
 * Props for an image zoom view component.
 */
export interface ImageZoomViewProps {
  imageUrl: string;
}

// ===== GALLERY AND PAGINATION =====

/**
 * Data structure for managing a gallery of images.
 */
export interface GalleryData {
  totalGalleryPages: number;
  currentImages: ImageFile[];
  currentSelectedImage: ImageFile | null;
}

/**
 * Data for pagination controls.
 */
export interface PaginationData {
  totalPages: number;
  currentImages: ImageFile[];
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Aggregate statistics for images in a gallery or collection.
 */
export interface GalleryStats {
  totalOriginalSize: number; // Sum of original sizes in bytes
  totalCompressedSize: number; // Sum of compressed sizes in bytes
  totalSavings: number; // Bytes saved
  savingsPercent: number; // Percentage savings
  imageCount: number;
}

// ===== TOOLS AND EDITING =====

/**
 * Represents an arrow shape for the paint tool.
 */
export type ArrowShape = {
  id: string;
  type: "arrow";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  double: boolean;
  color: string;
  width: number;
};

/**
 * Represents an emoji shape for the paint tool.
 */
export type EmojiShape = {
  id: string;
  type: "emoji";
  x: number;
  y: number;
  text: string;
  size: number;
};

/**
 * Union type for all supported shapes in the paint tool.
 */
export type Shape = ArrowShape | EmojiShape;

/**
 * Settings for the paint/brush tool.
 */
export interface PaintSettings {
  brushSize: number;
  brushColor: string; // Hex or RGBA string
  brushOpacity: number; // 0-1
  blendMode?: "normal" | "multiply" | "screen" | "overlay";
}

/**
 * Settings for the blur tool.
 */
export interface BlurSettings {
  radius: number; // Blur radius in pixels
  type: "gaussian" | "motion" | "radial";
  strength: number; // Intensity of the blur
}

/**
 * Settings for the text tool.
 */
export interface TextSettings {
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string; // Hex or RGBA string
  position: { x: number; y: number }; // Position on the canvas
  alignment: "left" | "center" | "right";
  bold?: boolean;
  italic?: boolean;
}

/**
 * Settings for image filter adjustments.
 */
export interface FilterSettings {
  brightness: number; // e.g., 0-200, 100 is normal
  contrast: number; // e.g., 0-200, 100 is normal
  saturation: number; // e.g., 0-200, 100 is normal
  hue: number; // e.g., 0-360 degrees
  sepia: number; // e.g., 0-100
  grayscale: number; // e.g., 0-100
}

// ===== BULK OPERATIONS =====

/**
 * Represents a single bulk operation task.
 */
export interface BulkOperation {
  id: string;
  type: EditType; // Type of bulk edit (e.g., 'crop', 'resize')
  settings: any; // Settings specific to the bulk operation
  targetImageIds: string[]; // IDs of images targeted by this operation
  progress: number; // Current progress (0-100)
  status: "pending" | "processing" | "completed" | "failed";
  error?: string;
}

/**
 * Options for controlling bulk processing.
 */
export interface BulkProcessingOptions {
  batchSize: number; // Number of images to process concurrently
  onProgress?: (current: number, total: number) => void;
  onComplete?: (results: any[]) => void;
  onError?: (error: Error) => void;
}

// ===== DOWNLOAD AND EXPORT =====

/**
 * Options for downloading a single image.
 */
export interface DownloadOptions {
  filename?: string;
  format: ImageFormat;
  quality: number; // Quality for the output format (0-100)
  includeMetadata?: boolean; // Whether to include original image metadata
}

/**
 * Options for bulk downloading multiple images, potentially as a ZIP.
 */
export interface BulkDownloadOptions extends DownloadOptions {
  zipFilename: string; // Name of the ZIP file
  createZip: boolean; // Whether to create a ZIP archive
  folderStructure?: "flat" | "byType" | "byDate"; // How to organize files within the ZIP
}

/**
 * Result object after an export or download operation.
 */
export interface ExportResult {
  success: boolean;
  url?: string; // Blob URL or download URL
  blob?: Blob; // The resulting Blob data
  filename?: string;
  error?: string;
}

// ===== UPLOAD AND PROCESSING =====

/**
 * Options for image upload functionality.
 */
export interface UploadOptions {
  maxFileSize: number; // Maximum allowed file size in bytes
  allowedTypes: string[]; // Array of allowed MIME types (e.g., 'image/jpeg')
  autoCompress: boolean; // Automatically apply compression on upload
  generateThumbnails: boolean; // Generate thumbnails on upload
}

/**
 * Tracks the progress of an image processing batch.
 */
export interface ProcessingProgress {
  current: number; // Current item count
  total: number; // Total item count
  stage: "uploading" | "processing" | "compressing" | "complete";
  currentFile?: string; // Name of the file currently being processed
}

/**
 * Interface for a generic image processing result, typically from an API or service.
 */
export interface ProcessingResult {
  url: string;
  blob: Blob;
  size: number;
  width: number;
  height: number;
  compressionRatio?: number;
}

// ===== THEME AND UI =====

/**
 * Defines the available theme modes for the UI.
 */
export type ThemeMode = "light" | "dark" | "system";

/**
 * User interface settings.
 */
export interface UISettings {
  theme: ThemeMode;
  thumbnailSize: "small" | "medium" | "large";
  gridColumns: number; // Number of columns in image grid
  showPreview: boolean; // Whether to show a large preview of the selected image
  autoSave: boolean; // Automatically save changes
}

/**
 * Global application settings.
 */
export interface AppSettings {
  theme: "light" | "dark" | "system";
  autoSave: boolean;
  compressionLevel: CompressionLevel;
  defaultFormat: ImageFormat;
  showAdvancedOptions: boolean;
}

/**
 * Represents the score for Core Web Vitals metrics.
 */
export type CoreWebVitalsScore =
  | "good"
  | "almost-there"
  | "needs-improvement"
  | "poor";

/**
 * Generic UI state for managing loading, processing, and errors.
 */
export interface UIState {
  isLoading: boolean;
  isProcessing: boolean;
  hasError: boolean;
  errorMessage?: string;
  progress?: number;
}

// ===== CONTEXT TYPES =====

/**
 * Interface for the Image Context, providing state and actions related to image management.
 */
export interface ImageContextType {
  images: ImageFile[];
  selectedImage: ImageFile | null;
  selectedImageId: string | null;
  editorState: EditorState;
  isEditMode: boolean; // True if an editor tool is active
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
  // Specific editing actions that toolbars will call
  onApplyCrop?: () => void;
  onRotateLeft?: () => void;
  onRotateRight?: () => void;
  onFlipHorizontal?: () => void;
  onFlipVertical?: () => void;
  onReset?: () => void; // Reset current image edits
  onClose?: () => void; // Close the current editor
  onNavigatePage?: (direction: "prev" | "next") => void;
}

// ===== EVENT TYPES =====

/**
 * Data for an image upload event.
 */
export interface ImageUploadEvent {
  files: File[];
  totalSize: number;
  timestamp: number;
}

/**
 * Data for an image edit event, logging what was done.
 */
export interface ImageEditEvent {
  imageId: string;
  editType: EditType;
  settings: any; // Settings used for the edit
  timestamp: number;
}

/**
 * Data for an image download event.
 */
export interface ImageDownloadEvent {
  imageIds: string[];
  format: ImageFormat;
  timestamp: number;
}

// ===== ERROR TYPES =====

/**
 * Generic error interface for processing issues.
 */
export interface ProcessingError {
  code: string;
  message: string;
  imageId?: string; // ID of the image involved in the error
  details?: any; // Additional error details
}

/**
 * Represents a validation error for input fields.
 */
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// ===== UTILITY TYPES =====

/**
 * Generic dimensions object.
 */
export type Dimensions = {
  width: number;
  height: number;
};

/**
 * Generic position object.
 */
export type Position = {
  x: number;
  y: number;
};

/**
 * RGBA color components.
 */
export type RGBA = {
  r: number;
  g: number;
  b: number;
  a: number; // Alpha channel (0-1)
};

/**
 * Utility type for component refs in React.
 */
export type ComponentRef<T> = React.RefObject<T>;

// ===== HOOKS TYPES =====

/**
 * Return type for a `useImageEditor` hook.
 */
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

/**
 * Return type for a `useImageUpload` hook.
 */
export interface UseImageUploadReturn {
  uploadImages: (files: FileList) => Promise<void>;
  isUploading: boolean;
  uploadProgress: ProcessingProgress;
  uploadError: string | null;
}

// ===== API TYPES =====

/**
 * Standard API response structure.
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Request payload for an image processing API endpoint.
 */
export interface ImageProcessingRequest {
  imageId: string;
  operation: EditType;
  settings: any;
}

/**
 * Response payload from an image processing API endpoint.
 */
export interface ImageProcessingResponse {
  imageId: string;
  resultUrl: string;
  metadata: ImageMetadata;
  processingTime: number; // Time taken for processing in milliseconds
}

// ===== STORAGE TYPES =====

/**
 * Represents an image stored in IndexedDB.
 */
export interface StoredImage {
  id: string;
  name: string;
  type: string;
  fileData: string;
  url?: string;
  width?: number;
  height?: number;
  lastModified?: number;
  metadata?: Record<string, any>;
}

/**
 * Represents an image record before it's stored in IndexedDB.
 */
export interface ImageRecord {
  id: string;
  file: File;
  url: string;
  width?: number;
  height?: number;
  metadata?: Record<string, any>;
}

/**
 * Generic interface for an item stored in a persistent storage.
 */
export interface StorageItem {
  id: string;
  data: any;
  timestamp: number;
  expiresAt?: number; // Optional expiration timestamp
}

/**
 * Generic interface for a cache entry.
 */
export interface CacheEntry<T = any> {
  key: string;
  value: T;
  timestamp: number;
  ttl?: number; // Time to live in milliseconds
}

// ===== KEYBOARD SHORTCUTS =====

/**
 * Defines a keyboard shortcut and its associated action.
 */
export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

// ===== ADVANCED EDITING =====

/**
 * Represents a layer in a multi-layered image editor.
 */
export interface LayerData {
  id: string;
  type: "image" | "text" | "shape";
  visible: boolean;
  opacity: number; // 0-1
  blendMode: string; // CSS blend mode string (e.g., 'normal', 'multiply')
  position: Position;
  data: any; // Data specific to the layer type (e.g., image URL, text string)
}

/**
 * Represents a state in the editor's history, allowing undo/redo.
 */
export interface HistoryState {
  id: string;
  imageData: string; // Base64 or URL of the image state
  description: string; // Description of the action that led to this state
  timestamp: number;
}

/**
 * Specific history snapshot for the editor store with image data.
 */
export interface HistorySnapshot {
  url: string;
  width: number;
  height: number;
  crop?: any; // react-image-crop Crop type - using any for compatibility
  rotation?: number;
  flipHorizontal?: boolean;
  flipVertical?: boolean;
  quality: number;
  format: ImageFormat;
  compressionLevel: CompressionLevel;
}

// ===== TYPE GUARDS =====

/**
 * Type guard to check if an object conforms to the ImageFile interface.
 * @param obj The object to check.
 * @returns True if the object is an ImageFile, false otherwise.
 */
export function isImageFile(obj: any): obj is ImageFile {
  return obj && typeof obj.id === "string" && obj.file instanceof File;
}

/**
 * Type guard to check if a string is a valid ImageFormat.
 * @param format The string to check.
 * @returns True if the string is a valid ImageFormat, false otherwise.
 */
export function isValidImageFormat(format: string): format is ImageFormat {
  return ["jpeg", "png", "webp", "avif"].includes(format);
}

/**
 * Type guard to check if a string is a valid CompressionLevel.
 * @param level The string to check.
 * @returns True if the string is a valid CompressionLevel, false otherwise.
 */
export function isValidCompressionLevel(
  level: string
): level is CompressionLevel {
  return ["low", "medium", "high", "extremeSmall", "extremeBW"].includes(level);
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
export const IMAGES_PER_PAGE = 10;

// ===== TEXT TOOL TYPES =====

/**
 * Interface for TextTool component props.
 */
export interface TextToolProps {
  imageUrl: string;
  onApplyText: (textedImageUrl: string) => void;
  onCancel: () => void;
  setEditorState: (state: EditorState) => void;
  setBold: (bold: boolean) => void;
  setItalic: (italic: boolean) => void;
}

/**
 * Interface for TextTool component ref methods.
 */
export interface TextToolRef {
  applyText: () => void;
  getCanvasDataUrl: () => string | null;
}
