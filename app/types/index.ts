// Core Web Vitals and Editor Types
export type CoreWebVitalsScore =
  | 'poor'
  | 'needs-improvement'
  | 'almost-there'
  | 'good'

export type EditorState =
  | 'resizeAndOptimize'
  | 'editImage'
  | 'bulkImageEdit'
  | 'crop'
  | 'blur'
  | 'paint'
  | 'text'
  | 'bulkCrop'
  | 'bulkTextEditor'
  | 'aiEditor'

export type ImageFormat = 'jpeg' | 'png' | 'webp'

export type NavigationDirection = 'next' | 'prev' | 'next10' | 'prev10'

// Image and File Types
export interface ImageFile {
  id: string
  file: File
  url: string
  width?: number
  height?: number
  metadata?: Record<string, any>
}

export interface ImageStats {
  width: number
  height: number
  size: number
  format: string
}

export interface ImageDataItem {
  id: string
  url: string
  file: File
  width?: number
  height?: number
}

// Gallery Component Types
export interface OptimizedImageProps {
  image: ImageFile
  isSelected: boolean
  onClick: () => void
  onRemove: (imageId: string, e?: React.MouseEvent) => void
}

export interface ResizeSettings {
  width: number
  height: number
  quality: number
  format: string
}

export interface GalleryData {
  totalGalleryPages: number
  currentImages: ImageFile[]
  currentSelectedImage: ImageFile | null
}

// Tool-specific Types
export interface PaintStroke {
  points: { x: number; y: number }[]
  color: string
  width: number
}

export interface TextOverlay {
  text: string
  x: number
  y: number
  fontSize: number
  color: string
  bold?: boolean
  italic?: boolean
}

export interface MousePosition {
  x: number
  y: number
}

// Component Props Interfaces
export interface ImageResizerProps {
  width: number
  height: number
  maxWidth: number
  maxHeight: number
  onResize: (width: number, height: number) => void
  onApplyResize: () => void
  format: string
  onReset: () => void
  onFormatChange: (format: string) => void
  onDownload?: () => void
  isCompressing?: boolean
  quality?: number
  onQualityChange?: (quality: number) => void
  compressionLevel?: string
  onCompressionLevelChange?: (level: string) => void
}

export interface ImageStatsProps {
  originalStats?: ImageStats
  newStats?: ImageStats
  dataSavings?: number
  hasEdited?: boolean
  fileName?: string
  format: string
  fileType?: string
}

export interface ImageZoomViewProps {
  imageUrl: string
}

export interface SimplePaginationProps {
  currentPage: number
  totalPages: number
  totalImages?: number
  onBackTen?: () => void
  onPrevious?: () => void
  onNext?: () => void
  onForwardTen?: () => void
  onNavigate?: (direction: NavigationDirection) => void
  isDisabled?: boolean
  className?: string
}

export interface RotationControlsProps {
  onRotate: (degrees: number) => void
  onFlipHorizontal: () => void
  onFlipVertical: () => void
  onReset: () => void
  currentRotation?: number
}

// Editor Canvas Props
export interface EditorCanvasProps {
  editorState?: EditorState
  imageUrl: string
  zoom?: number
  width?: number
  height?: number
  allImages?: ImageDataItem[]
  currentImageId?: string
  aspect?: number
  rotation?: number
  showCrop?: boolean
  onCropChange?: (crop: any) => void
  onZoomChange?: (zoom: number) => void
  onCropComplete?: (crop: any, croppedArea: any) => void
  showPaint?: boolean
  paintStrokes?: PaintStroke[]
  isBlurring?: boolean
  blurAmount?: number
  blurRadius?: number
  blurData?: any
  textOverlays?: TextOverlay[]
  imgRef?: React.RefObject<HTMLImageElement>
  cropToolRef?: React.RefObject<CroppingToolRef>
  blurCanvasRef?: React.RefObject<BlurBrushCanvasRef>
  paintToolRef?: React.RefObject<PaintToolRef>
  textToolRef?: React.RefObject<TextToolRef>
  onCropResult?: (url: string) => void
  onBlurResult?: (url: string) => void
  onPaintResult?: (url: string) => void
  onTextResult?: (url: string) => void
  onStateChange?: (state: EditorState) => void
  setMultiCropData?: (data: any) => void
  setBold?: (bold: boolean) => void
  setItalic?: (italic: boolean) => void
  setIsEraser?: (isEraser: boolean) => void
  isEraser?: boolean
  isBulkMode?: boolean
}

// Toolbar Props
export interface ImageEditorToolbarProps {
  editorState: EditorState
  isCompressing?: boolean
  zoom: number
  historyIndex?: number
  historyLength?: number
  currentPage?: number
  totalPages?: number
  padlockAnimation?: boolean
  bulkCropData?: any
  blurAmount?: number
  blurRadius?: number
  allImages?: ImageDataItem[]
  onZoomIn: () => void
  onZoomOut: () => void
  onUndo?: () => void
  onRedo?: () => void
  onClose?: () => void
  onRemoveAll?: () => void
  onUploadNew?: () => void
  onNavigateImage?: (direction: NavigationDirection) => void
  onStateChange: (state: EditorState) => void
  onApplyCrop?: () => void
  onApplyBlur?: () => void
  onApplyPaint?: () => void
  onApplyText?: () => void
  onBlurAmountChange?: (amount: number) => void
  onBlurRadiusChange?: (radius: number) => void
  onBulkCropApply?: () => void
  onRotateLeft?: () => void
  onRotateRight?: () => void
  onFlipHorizontal?: () => void
  onFlipVertical?: () => void
  onReset?: () => void
}

// Tool Component Refs and Props
export interface CroppingToolRef {
  getCanvasDataUrl: () => string | null
  getCrop: () => any
  getImageRef: () => HTMLImageElement | null
  applyCrop: () => void
}

export interface CroppingToolProps {
  imageUrl: string
  onApply: (croppedImageUrl: string) => void
  onCancel: () => void
  className?: string
  aspectRatio?: number
}

export interface BlurBrushCanvasRef {
  getCanvasDataUrl: () => string | null
  clear: () => void
}

export interface BlurBrushCanvasProps {
  imageUrl: string
  blurAmount: number
  blurRadius: number
  zoom?: number
  onApply: (blurredImageUrl: string) => void
  onCancel: () => void
  onBlurAmountChange: (amount: number) => void
  onBlurRadiusChange: (radius: number) => void
}

export interface PaintToolRef {
  getCanvasDataUrl: () => string | null
  clear: () => void
}

export interface PaintToolProps {
  imageUrl: string
  onApplyPaint: (paintedImageUrl: string) => void
  onCancel: () => void
  onToggleEraser?: () => void
  isEraser?: boolean
}

export interface TextToolRef {
  applyText: () => void
  getCanvasDataUrl: () => string | null
}

export interface TextToolProps {
  imageUrl: string
  onApplyText: (textedImageUrl: string) => void
  onCancel: () => void
  setEditorState: (state: string) => void
  setBold: (bold: boolean) => void
  setItalic: (italic: boolean) => void
}
