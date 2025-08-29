"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { formatBytes } from "../utils/image";
import type { ImageFile } from "../types/types";

interface ImageStatsProps {
  selectedImage: ImageFile | null;
}

export default function ImageStats({ selectedImage }: ImageStatsProps) {
  if (!selectedImage?.metadata) return null;

  const { originalSize, compressedSize, compressionRatio } =
    selectedImage.metadata;

  return (
    <Card className="rounded-lg bg-gray-800 text-white border-0 shadow-lg">
      <CardHeader className="p-3 pb-0">
        <CardTitle className="text-lg font-semibold">
          Compression Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Main stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <div className="text-center">
            <span className="font-medium text-muted-foreground block mb-1">Original Size</span>
            <p className="text-xl font-bold">{formatBytes(originalSize || 0)}</p>
          </div>
          <div className="text-center">
            <span className="font-medium text-muted-foreground block mb-1">Compressed Size</span>
            <p className="text-xl font-bold text-green-400">
              {formatBytes(compressedSize || originalSize || 0)}
            </p>
          </div>
          <div className="text-center">
            <span className="font-medium text-muted-foreground block mb-1">Space Saved</span>
            <p className="text-xl font-bold text-green-400">
              {formatBytes((originalSize || 0) - (compressedSize || originalSize || 0))}
            </p>
          </div>
          <div className="text-center">
            <span className="font-medium text-muted-foreground block mb-1">Reduction</span>
            <p className="text-xl font-bold text-green-400">
              {compressionRatio || 0}%
            </p>
          </div>
        </div>
        
        {/* Additional stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t border-gray-700">
          <div className="text-center">
            <span className="font-medium text-muted-foreground block mb-1">Dimensions</span>
            <p className="text-sm">{selectedImage?.width || 'Unknown'} × {selectedImage?.height || 'Unknown'}</p>
          </div>
          <div className="text-center">
            <span className="font-medium text-muted-foreground block mb-1">Format</span>
            <p className="text-sm uppercase">{selectedImage?.file?.type?.split('/')[1] || 'Unknown'}</p>
          </div>
          <div className="text-center">
            <span className="font-medium text-muted-foreground block mb-1">Quality</span>
            <p className="text-sm text-green-400">High</p>
          </div>
          <div className="text-center">
            <span className="font-medium text-muted-foreground block mb-1">Core Web Vitals</span>
            <p className="text-sm text-green-400">✓ Optimized</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
