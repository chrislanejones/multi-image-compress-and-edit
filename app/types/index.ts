export type CoreWebVitalsScore = "poor" | "needs-improvement" | "almost-there" | "good";

export type EditorState =
  | "resizeAndOptimize"
  | "editImage"
  | "bulkImageEdit"
  | "crop"
  | "blur"
  | "paint"
  | "text"
  | "bulkCrop";

export type ImageFormat = "jpeg" | "png" | "webp";

export type NavigationDirection = "next" | "prev" | "next10" | "prev10";

export interface ImageFile {
  id: string;
  file: File;
  url: string;
  width?: number;
  height?: number;
  metadata?: Record<string, any>;
}

export interface ImageStats {
  width: number;
  height: number;
  size: number;
  format: string;
}

export interface PaintStroke {
  points: { x: number; y: number }[];
  color: string;
  width: number;
}

export interface TextOverlay {
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  bold?: boolean;
  italic?: boolean;
}
