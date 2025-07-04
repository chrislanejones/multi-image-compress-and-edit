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
