#!/bin/bash

echo "🚨 EMERGENCY PERFORMANCE FIX"
echo "============================"

# 1. Kill any running dev server
pkill -f "bun dev" || pkill -f "npm run dev" || pkill -f "yarn dev"

# 2. Replace the broken resize-and-optimize.tsx with a minimal version
cat > app/components/resize-and-optimize.tsx << 'EOF'
import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Home } from "lucide-react";
import { useImageContext } from "../context/image-context";

export default function ResizeAndOptimize() {
  const navigate = useNavigate();
  const { images } = useImageContext();

  // Emergency: Just show basic info without heavy processing
  if (images.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">No images yet</h2>
          <Button onClick={() => navigate({ to: "/" })}>
            <Home className="mr-2 h-4 w-4" />
            Back to Upload
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold mb-4">Gallery (Emergency Mode)</h1>
          <p className="mb-4">Found {images.length} images</p>
          
          {/* Simple list instead of heavy thumbnail grid */}
          <div className="space-y-2 mb-6">
            {images.slice(0, 10).map((img, index) => (
              <div key={img.id} className="p-2 border rounded">
                <p className="text-sm">{index + 1}. {img.file?.name || 'Unknown'}</p>
                <p className="text-xs text-gray-500">
                  Size: {Math.round(img.originalSize / 1024)}KB
                </p>
              </div>
            ))}
            {images.length > 10 && (
              <p className="text-sm text-gray-500">...and {images.length - 10} more</p>
            )}
          </div>

          <div className="flex gap-4">
            <Button onClick={() => navigate({ to: "/" })}>
              <Home className="mr-2 h-4 w-4" />
              Back to Upload
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
EOF

echo "✅ Replaced broken gallery with emergency minimal version"

# 3. Clean up any processing that might be running
cat > app/utils/simple-core-utils.ts << 'EOF'
// EMERGENCY MINIMAL UTILS - No heavy processing
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i)) + " " + sizes[i];
}

// Disabled heavy functions to prevent CPU overload
export async function aggressiveCompress300KB(file: File): Promise<{
  compressed: string;
  compressedSize: number;
}> {
  console.log("⚠️ Compression disabled in emergency mode");
  return {
    compressed: URL.createObjectURL(file),
    compressedSize: file.size
  };
}

export async function compressImage(): Promise<any> {
  console.log("⚠️ Compression disabled in emergency mode");
  return { url: "", blob: new Blob(), width: 0, height: 0 };
}

export async function processImagesBatch(files: FileList): Promise<any[]> {
  console.log("⚠️ Batch processing disabled in emergency mode");
  return [];
}
EOF

echo "✅ Disabled heavy image processing"

# 4. Simplify the photo upload to not process anything
cat > app/components/photo-upload.tsx << 'EOF'
import React, { useState, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Upload } from "lucide-react";
import { Card, CardHeader, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { useImageContext } from "../context/image-context";

export default function PhotoUpload() {
  const navigate = useNavigate();
  const { addImages, images } = useImageContext();
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList) {
    if (!files?.length) return;

    setIsProcessing(true);
    
    // EMERGENCY: No processing, just add files directly
    const quickImages = Array.from(files).slice(0, 5).map(file => ({
      id: crypto.randomUUID(),
      file,
      url: URL.createObjectURL(file),
      originalSize: file.size,
      metadata: { originalSize: file.size }
    }));

    addImages(quickImages);
    
    setTimeout(() => {
      setIsProcessing(false);
      navigate({ to: "/resize-and-optimize" });
    }, 500);
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <h1 className="text-2xl font-bold">ImageHorse (Emergency Mode)</h1>
          <p className="text-sm text-gray-600">Upload limited to 5 files, no processing</p>
        </CardHeader>
        
        <CardContent>
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-10 w-10 text-gray-400 mb-4 mx-auto" />
            <p className="text-sm text-gray-600">Click to upload images</p>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            disabled={isProcessing}
          />
        </CardContent>
        
        <CardFooter>
          {images.length > 0 ? (
            <div className="flex gap-4 w-full">
              <Button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="flex-1"
              >
                Add More
              </Button>
              <Button 
                onClick={() => navigate({ to: "/resize-and-optimize" })}
                className="flex-1"
                variant="outline"
              >
                View ({images.length})
              </Button>
            </div>
          ) : (
            <Button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? "Loading..." : "Select Images"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
EOF

echo "✅ Simplified photo upload"

echo ""
echo "🎯 EMERGENCY FIX COMPLETE!"
echo ""
echo "Your app should now:"
echo "✅ Load instantly"
echo "✅ Not crush your CPU"
echo "✅ Allow basic image upload (max 5 files)"
echo "✅ Show a simple gallery list"
echo ""
echo "🚀 Start your server:"
echo "bun dev"
echo ""
echo "📝 This removes all heavy processing to get you running again."
echo "   You can add features back slowly once it's stable."