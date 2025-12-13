import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "../components/ui/button";
import { Terminal } from "../components/ui/terminal";
import { Upload, Images } from "lucide-react";
import { useImageContext } from "../context/image-context";
import imageCompression from "browser-image-compression";
import { useState, useRef, useCallback, useEffect } from "react";
import { useUploadStore } from "../stores";
import { ThemeToggle } from "../components/ui/theme-toggle";

export const Route = createFileRoute("/upload")({
  component: UploadPage,
});

function UploadPage() {
  const navigate = useNavigate();
  const { addImages, images } = useImageContext();
  const {
    terminalOutput,
    addTerminalLine,
    setTerminalOutput,
    hasProcessedImages,
    setHasProcessedImages,
  } = useUploadStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [processingStartTime, setProcessingStartTime] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasImages = images.length > 0;

  async function handleFiles(files: FileList) {
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    setProcessingStartTime(Date.now());
    setProgress({ current: 0, total: files.length });

    // Initialize terminal output
    const newTerminalOutput = [
      { text: `$ imagehorse --compress --verbose`, type: "command" as const },
      {
        text: `ImageHorse v2.0`,
        type: "info" as const,
      },
      { text: `Processing ${files.length} files...`, type: "info" as const },
      { text: `─────────────────────────────────────`, type: "info" as const },
    ];

    try {
      const processed = await Promise.all(
        Array.from(files).map(async (file, index) => {
          setProgress((prev) => ({ ...prev, current: index + 1 }));

          const originalSize = file.size;
          const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          };
          const compressedFile = await imageCompression(file, options);
          const compressedSize = compressedFile.size;
          const compressionRatio = Math.round(
            ((originalSize - compressedSize) / originalSize) * 100
          );

          const url = URL.createObjectURL(compressedFile);

          // Add terminal output for this file
          const fileIndex = String(index + 1).padStart(2, "0");
          const originalSizeMB = (originalSize / (1024 * 1024)).toFixed(1);
          const compressedSizeMB = (compressedSize / (1024 * 1024)).toFixed(1);
          newTerminalOutput.push(
            {
              text: `[${fileIndex}] Processing ${file.name}`,
              type: "info" as const,
            },
            {
              text: `  → Original: ${originalSizeMB}MB → Compressed: ${compressedSizeMB}MB (${compressionRatio}% reduction)`,
              type: "info" as const,
            },
            {
              text: `  ✓ Dimensions optimized: 1920x1080`,
              type: "info" as const,
            }
          );

          const imageData = {
            id: crypto.randomUUID(),
            file: compressedFile,
            url,
            name: compressedFile.name,
            size: compressedFile.size,
            width: 0,
            height: 0,
            compressedSize,
            compressedUrl: url,
            metadata: {
              originalSize,
              compressedSize,
              compressionRatio,
            },
          };

          return imageData;
        })
      );

      // Add completion message
      newTerminalOutput.push(
        { text: "", type: "info" as const },
        {
          text: "✓ All images processed successfully",
          type: "info" as const,
        },
        { text: `→ Total images: ${processed.length}`, type: "info" as const }
      );

      setTerminalOutput(newTerminalOutput);
      setHasProcessedImages(true);
      addImages(processed);

      // Ensure minimum 5 second display time
      const elapsedTime = Date.now() - processingStartTime;
      const minDisplayTime = 5000;
      const remainingTime = Math.max(0, minDisplayTime - elapsedTime);

      setTimeout(() => {
        setIsProcessing(false);
        setProgress({ current: 0, total: 0 });
      }, remainingTime);
    } catch (error) {
      console.error("Error processing images:", error);
      setIsProcessing(false);
      setProgress({ current: 0, total: 0 });
    }
  }

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) handleFiles(e.target.files);
    },
    []
  );

  const handleUploadClick = useCallback(
    () => fileInputRef.current?.click(),
    []
  );

  const handleReviewImages = useCallback(
    () => navigate({ to: "/resize-and-optimize" }),
    [navigate]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent) => e.preventDefault(),
    []
  );

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  }, []);

  const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const files: File[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) {
          files.push(file);
        }
      }
    }

    if (files.length > 0) {
      const fileList = new DataTransfer();
      files.forEach(file => fileList.items.add(file));
      handleFiles(fileList.files);
    }
  }, []);

  // Add paste event listener
  // Monitor images and update terminal when they change
  useEffect(() => {
    // Only add removal message if we had terminal output (meaning images were processed before)
    if (terminalOutput.length > 0 && images.length === 0 && hasProcessedImages) {
      // Check if we haven't already added the removal message
      const lastEntry = terminalOutput[terminalOutput.length - 1];
      if (!lastEntry?.text.includes("Images removed")) {
        addTerminalLine("→ Images removed: All images cleared from gallery", "info");
      }
    }
  }, [images.length, terminalOutput, hasProcessedImages, addTerminalLine]);

  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [handlePaste]);

  const progressPercent =
    progress.total > 0 ? (progress.current / progress.total) * 100 : 0;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Computer Window Design */}
      <div className="w-full max-w-2xl rounded-xl p-1 text-sm bg-gradient-to-br from-card to-background dark:from-card dark:to-background">
        <div className="flex items-center justify-between p-2">
          <div className="flex gap-2">
            <span className="size-3 rounded-full bg-destructive"></span>
            <span className="size-3 rounded-full bg-secondary"></span>
            <span className="size-3 rounded-full bg-accent"></span>
          </div>
          <ThemeToggle />
        </div>
        <div className="bg-background rounded-lg p-8">
          {/* Header Section */}
          <div className="flex flex-col items-center p-7 rounded-2xl bg-gradient-to-br from-muted to-card mb-8">
            <div>
              <img
                className="size-32 rounded-md"
                alt="ImageHorse Logo"
                src="/Image-Horse-Logo.svg"
              />
            </div>
            <div className="flex flex-col items-center mt-4">
              <h1 className="text-2xl font-medium text-foreground">ImageHorse</h1>
              <h2 className="font-medium text-primary">
                Upload Multiple Images for Core Web Vitals Compression and Image
                Editing
              </h2>
              <span className="flex gap-2 font-medium text-muted-foreground mt-2">
                <span>v2.0</span>
                <span>·</span>
                <span>2025</span>
              </span>
            </div>
          </div>

          {/* Progress Bar - only show when processing */}
          {isProcessing && (
            <div className="w-full bg-muted rounded-full h-3 mb-6">
              <div
                className="bg-primary h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}

          {/* Terminal Output - show when processing or has stored output */}
          {(isProcessing ||
            hasProcessedImages ||
            terminalOutput.length > 0) && (
            <Terminal className="rounded-lg mb-6">
              <div className="font-mono text-sm space-y-1">
                {terminalOutput.length > 0 ? (
                  terminalOutput.map((entry, index) => (
                    <div
                      key={index}
                      className={`${
                        entry.type === "command"
                          ? "text-accent"
                          : entry.type === "error"
                            ? "text-destructive"
                            : entry.type === "success"
                              ? "text-accent"
                              : entry.type === "progress"
                                ? "text-primary"
                                : "text-muted-foreground"
                      }`}
                    >
                      {entry.text}
                    </div>
                  ))
                ) : (
                  <div className="text-muted-foreground">
                    <div className="text-accent">$ imagehorse --ready</div>
                    <div>ImageHorse v2.0 - Ready for image processing</div>
                    <div>Drop files or click to upload...</div>
                  </div>
                )}
              </div>
            </Terminal>
          )}

          {/* Upload Area */}
          <div
            className={`flex flex-col items-center justify-center p-8 border-2 border-dashed ${
              isDragging
                ? "border-primary bg-primary/10"
                : "border-muted-foreground/50 bg-muted/50"
            } rounded-lg hover:bg-muted/70 transition-colors cursor-pointer mb-6`}
            onClick={handleUploadClick}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="h-10 w-10 text-primary mb-4" />
            <p className="text-sm text-muted-foreground text-center">
              Drag and drop your images here, click to browse, or paste from
              clipboard
            </p>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            accept="image/*"
            className="hidden"
          />

          {/* Buttons */}
          <div className="flex gap-4 w-full">
            <Button
              onClick={handleUploadClick}
              variant="outline"
              className="flex-1"
            >
              Select Images
            </Button>
            {hasImages && (
              <Button
                onClick={handleReviewImages}
                variant="outline"
                className="flex-1"
              >
                <Images className="mr-2 h-4 w-4" />
                Review and Edit Images ({images.length})
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
