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
      <CardContent className="p-4">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-muted-foreground">Original:</span>
            <p>{formatBytes(originalSize || 0)}</p>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">New Size:</span>
            <p className="text-green-400">
              {formatBytes(compressedSize || originalSize || 0)}
            </p>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">Savings:</span>
            <p className="text-green-400 font-semibold">
              {compressionRatio || 0}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
