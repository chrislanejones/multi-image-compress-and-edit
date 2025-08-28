// app/types.ts - Comprehensive Types for ImageHorse
"use client";

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
 * Supported codecs for image compression
 */
export type Codec = "avif" | "webp" | "jpeg";

/**
 * Supported image formats for processing and export
 */
export type ImageFormat = "jpeg" | "png" | "webp" | "avif";

/**
 * Compression levels for different quality/size tradeoffs
 */
export type CompressionLevel =
  | "ultraLight"
  | "light"
  | "balanced"
  | "aggressive"
  | "ultraAggressive"
  | "extremeWeb";

/**
 * Core Web Vitals performance scores
 */
export type CoreWebVitalsScore =
  | "good"
  | "almost-there"
  | "needs-improvement"
  | "poor";

/**
 * Detailed metadata associated with an image file
 */
export interface ImageMetadata {
  // File size information
  originalSize: number;
  compressedSize?: number;
  compressionRatio?: number; // percentage 0-100

  // Technical details
  codec?: Codec;
  quality?: number; // 0-1 range
  bpp?: number; // bytes per pixel
  absCap?: number; // absolute cap used

  // Dimensions
  width?: number;
  height?: number;

  // Performance metrics
  boltTier?: 1 | 2 | 3; // Performance tier
  coreWebVitalsScore?: CoreWebVitalsScore;

  // Processing metadata
  lastModified?: number;
  isOptimized?: boolean;
  editHistory?: EditAction[];
  processingTime?: number; // milliseconds
}

/**
 * Core image file structure
 */
export interface ImageFile {
  id: string;
  file: File;
  url: string;
  name: string;
  size?: number; // Made optional to match context
  width?: number;
  height?: number;

  // Compressed versions
  compressedUrl?: string;
  compressedSize?: number;

  // Transform state
  rotation?: number;
  flipHorizontal?: boolean;
  flipVertical?: boolean;
  crop?: { x: number; y: number; width: number; height: number };
  resize?: { width: number; height: number };

  // Metadata
  metadata?: ImageMetadata;
}

/**
 * Extended image with global state properties
 */
export interface GlobalImage extends ImageFile {
  thumbnail?: string;
  compressed?: string;
}

// ===== EDITOR STATE TYPES =====

/**
 * High-level editor states
 */
export type EditorState =
  | "resizeAndOptimize"
  | "editImage"
  | "bulkImageEdit"
  | "aiEditor"
  | "crop"
  | "blur"
  | "paint"
  | "text";

/**
 * Route-based editing modes
 */
export type EditMode = "crop" | "blur" | "paint" | "text";

/**
 * Bulk editing modes
 */
export type BulkMode = "crop" | "text";

/**
 * Types of editing actions
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

/**
 * Edit action history entry
 */
export interface EditAction {
  id: string;
  type: EditType;
  timestamp: number;
  parameters: Record<string, any>;
  description?: string;
}

// ===== PROCESSING TYPES =====

/**
 * Processing progress tracking
 */
export interface ProcessingProgress {
  current: number;
  total: number;
  stage: "uploading" | "processing" | "compressing" | "complete";
  currentFile?: string;
}

/**
 * Individual image processing result
 */
export interface ProcessingResult {
  imageId: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  codec: Codec;
  quality: number;
  width: number;
  height: number;
  bpp: number;
  boltTier: 1 | 2 | 3;
  coreWebVitalsScore: CoreWebVitalsScore;
  processingTime: number;
  url: string;
  blob: Blob;
}

/**
 * Batch processing statistics
 */
export interface ProcessingStats {
  totalOriginalSize: number;
  totalCompressedSize: number;
  totalSavings: number;
  averageCompressionRatio: number;
  coreWebVitalsDistribution: Record<CoreWebVitalsScore, number>;
  goodScorePercentage: number;
  imageCount: number;
  totalProcessingTime: number;
  averageProcessingTime: number;
  codecDistribution: Record<Codec, number>;
  qualityStats: {
    min: number;
    max: number;
    average: number;
  };
}

// ===== TOOL SETTINGS TYPES =====

/**
 * Crop area definition
 */
export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
  unit?: "px" | "%";
}

/**
 * Crop tool settings
 */
export interface CropSettings {
  aspect?: number;
  cropShape?: "rect" | "round";
  showGrid?: boolean;
  restrictPosition?: boolean;
}

/**
 * Paint/brush tool settings
 */
export interface PaintSettings {
  brushSize: number;
  brushColor: string;
  brushOpacity: number;
  blendMode?: "normal" | "multiply" | "screen" | "overlay";
}

/**
 * Blur tool settings
 */
export interface BlurSettings {
  radius: number;
  type: "gaussian" | "motion" | "radial";
  strength: number;
}

/**
 * Text tool settings
 */
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

// ===== COMPRESSION TYPES =====

/**
 * Compression settings for image processing
 */
export interface CompressionSettings {
  format: ImageFormat;
  quality: number;
  maxWidth?: number;
  maxHeight?: number;
  maintainAspectRatio?: boolean;
}

/**
 * Compression result with metadata
 */
export interface CompressionResult {
  url: string;
  blob: Blob;
  size: number;
  width: number;
  height: number;
  compressionRatio: number;
}

/**
 * Resize settings
 */
export interface ResizeSettings {
  width: number;
  height: number;
  quality: number;
  format: ImageFormat;
  maintainAspectRatio?: boolean;
  resizeMode?: "contain" | "cover" | "stretch";
}

/**
 * Resize draft state
 */
export interface ResizeDraft {
  width: number;
  height: number;
}

// ===== UI COMPONENT TYPES =====

/**
 * Theme provider props
 */
export interface ThemeProviderProps {
  children: React.ReactNode;
  attribute?: string;
  defaultTheme?: string;
}

/**
 * Theme modes
 */
export type ThemeMode = "light" | "dark" | "system";

/**
 * Navigation directions
 */
export type NavigationDirection = "next" | "prev" | "next10" | "prev10";

/**
 * Mouse position
 */
export interface MousePosition {
  x: number;
  y: number;
}

/**
 * Generic dimensions
 */
export type Dimensions = {
  width: number;
  height: number;
};

/**
 * Generic position
 */
export type Position = {
  x: number;
  y: number;
};

// ===== COMPONENT PROPS TYPES =====

/**
 * Optimized image component props
 */
export interface OptimizedImageProps {
  image: ImageFile;
  isSelected: boolean;
  onClick: () => void;
  onRemove: (id: string, e: React.MouseEvent) => void;
}

/**
 * Thumbnail component props
 */
export interface ThumbnailProps {
  image: ImageFile;
  isSelected: boolean;
  onClick: () => void;
  onRemove: (e: React.MouseEvent) => void;
  forceUpdate?: (obj: {}) => void;
  size?: "small" | "medium" | "large";
  isLoading?: boolean;
}

/**
 * Image resizer component props
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
 * Image stats component props
 */
export interface ImageStatsProps {
  selectedImage: ImageFile | null;
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
  dataSavings?: number;
  hasEdited?: boolean;
  fileName?: string;
}

/**
 * Image zoom view props
 */
export interface ImageZoomViewProps {
  imageUrl: string;
  imageTransforms?: {
    rotation?: number;
    flipHorizontal?: boolean;
    flipVertical?: boolean;
  };
}

/**
 * Text tool component props
 */
export interface TextToolProps {
  imageUrl: string;
  onApplyText: (textedImageUrl: string) => void;
  onCancel: () => void;
  setEditorState: (state: string) => void;
  setBold: (bold: boolean) => void;
  setItalic: (italic: boolean) => void;
}

/**
 * Text tool ref methods
 */
export interface TextToolRef {
  applyText: () => void;
  getCanvasDataUrl: () => string | null;
}

// ===== CONTEXT TYPES =====

/**
 * Image context interface
 */
export interface ImageContextType {
  images: ImageFile[];
  selectedImage: ImageFile | null;
  paginatedImages: ImageFile[];
  currentPage: number;
  totalPages: number;
  resizeDraft: ResizeDraft | null;
  loadingImages: Set<string>;
  itemsPerPage: number;

  // Actions
  addFiles: (files: File[]) => Promise<void>;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  removeAllImages: () => void;
  updateImage: (id: string, patch: Partial<ImageFile>) => void;
  navigateImage: (direction: NavigationDirection) => void;
  onNavigatePage?: (direction: "prev" | "next") => void;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (count: number) => void;

  // Editor operations
  setResizeDraft: (draft: ResizeDraft | null) => void;
  handleApplyResize: () => void;
  handleReset: () => void;
  onApplyCrop: () => void;
  onApplyBlur: () => void;
  onApplyPaint: () => void;
  onApplyText: () => void;

  // Transform operations
  onRotateLeft: (id: string) => void;
  onRotateRight: (id: string) => void;
  onFlipHorizontal: (id: string) => void;
  onFlipVertical: (id: string) => void;
  onReset: (id: string) => void;
  onRotate: (id: string, degrees: number) => void;
  onCrop: (id: string, crop: any) => void;
  onResize: (id: string, resize?: { width: number; height: number }) => void;
  onCompress: () => void;
  onDownload: () => void;
  onClear: () => void;
  onClose: () => void;
}

// ===== STORAGE TYPES =====

/**
 * Stored image in IndexedDB
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
 * Image record for storage
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
 * Generic storage item
 */
export interface StorageItem {
  id: string;
  data: any;
  timestamp: number;
  expiresAt?: number;
}

/**
 * Cache entry
 */
export interface CacheEntry<T = any> {
  key: string;
  value: T;
  timestamp: number;
  ttl?: number;
}

// ===== ERROR TYPES =====

/**
 * Processing error
 */
export interface ProcessingError {
  code: string;
  message: string;
  imageId?: string;
  details?: any;
}

/**
 * Validation error
 */
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// ===== API TYPES =====

/**
 * Standard API response
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Image processing request
 */
export interface ImageProcessingRequest {
  imageId: string;
  operation: EditType;
  settings: any;
}

/**
 * Image processing response
 */
export interface ImageProcessingResponse {
  imageId: string;
  resultUrl: string;
  metadata: ImageMetadata;
  processingTime: number;
}

// ===== UTILITY TYPES =====

/**
 * RGBA color
 */
export type RGBA = {
  r: number;
  g: number;
  b: number;
  a: number;
};

/**
 * Component ref
 */
export type ComponentRef<T> = React.RefObject<T>;

// ===== TYPE GUARDS =====

/**
 * Check if object is ImageFile
 */
export function isImageFile(obj: any): obj is ImageFile {
  return obj && typeof obj.id === "string" && obj.file instanceof File;
}

/**
 * Check if string is valid ImageFormat
 */
export function isValidImageFormat(format: string): format is ImageFormat {
  return ["jpeg", "png", "webp", "avif"].includes(format);
}

/**
 * Check if string is valid CompressionLevel
 */
export function isValidCompressionLevel(
  level: string
): level is CompressionLevel {
  return [
    "ultraLight",
    "light",
    "balanced",
    "aggressive",
    "ultraAggressive",
    "extremeWeb",
  ].includes(level);
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
export const DEFAULT_COMPRESSION_QUALITY = 65; // More aggressive default
export const DEFAULT_THUMBNAIL_SIZE = 200;
export const IMAGES_PER_PAGE = 10;

// Core Web Vitals thresholds
export const CORE_WEB_VITALS_THRESHOLDS = {
  EXCELLENT_PIXELS: 600 * 400, // 240K pixels
  GOOD_PIXELS: 1000 * 800, // 800K pixels
  DECENT_PIXELS: 1200 * 900, // 1.08M pixels
  POOR_PIXELS: 1800 * 1200, // 2.16M pixels

  EXCELLENT_SIZE: 50_000, // 50KB
  GOOD_SIZE: 100_000, // 100KB
  DECENT_SIZE: 200_000, // 200KB
  POOR_SIZE: 400_000, // 400KB
} as const;
