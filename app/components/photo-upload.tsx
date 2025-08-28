// app/components/photo-upload.tsx
import React, { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Upload, CheckCircle, AlertCircle, Zap } from "lucide-react";
import {
  ComputerWindow,
  ComputerWindowHeader,
  ComputerWindowLogo,
  ComputerWindowTitle,
  ComputerWindowProgress,
  ComputerWindowTerminal,
  TerminalCommand,
  TerminalInfo,
  TerminalSuccess,
  TerminalWarning,
  TerminalHighlight,
} from "./ui/computer-window";
import { Button } from "./ui/button";
import { useImageContext } from "../context/image-context";

interface ProcessingStats {
  totalOriginalSize: number;
  totalCompressedSize: number;
  averageCompressionRatio: number;
  coreWebVitalsDistribution: Record<string, number>;
  goodScorePercentage: number;
}

export default function PhotoUpload() {
  const navigate = useNavigate();
  const { addFiles, images, loadingImages } = useImageContext();

  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [processingStartTime, setProcessingStartTime] = useState<number>(0);
  const [processingLogs, setProcessingLogs] = useState<string[]>([]);
  const [compressionStats, setCompressionStats] =
    useState<ProcessingStats | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addLog = useCallback((message: string) => {
    setProcessingLogs((prev) => [...prev.slice(-12), message]); // Keep last 12 logs
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Calculate stats when images change
  useEffect(() => {
    if (images.length > 0 && isProcessing) {
      const stats = {
        totalOriginalSize: 0,
        totalCompressedSize: 0,
        averageCompressionRatio: 0,
        coreWebVitalsDistribution: {
          good: 0,
          "almost-there": 0,
          "needs-improvement": 0,
          poor: 0,
        },
        goodScorePercentage: 0,
      };

      let processedCount = 0;

      images.forEach((img) => {
        if (img.metadata) {
          stats.totalOriginalSize += img.metadata.originalSize || img.size || 0;
          stats.totalCompressedSize +=
            img.metadata.compressedSize || img.size || 0;

          if (img.metadata.compressionRatio !== undefined) {
            stats.averageCompressionRatio += img.metadata.compressionRatio;
            processedCount++;
          }

          const score = img.metadata.coreWebVitalsScore || "poor";
          stats.coreWebVitalsDistribution[score]++;
        }
      });

      if (processedCount > 0) {
        stats.averageCompressionRatio = Math.round(
          stats.averageCompressionRatio / processedCount
        );
        stats.goodScorePercentage = Math.round(
          ((stats.coreWebVitalsDistribution.good +
            stats.coreWebVitalsDistribution["almost-there"]) /
            images.length) *
            100
        );
        setCompressionStats(stats);
      }

      setProgress({
        current: images.length - loadingImages.size,
        total: images.length,
      });
    }
  }, [images, loadingImages, isProcessing]);

  const handleFiles = useCallback(
    async (files: FileList) => {
      if (!files || files.length === 0) return;

      setIsProcessing(true);
      setProcessingStartTime(Date.now());
      setProcessingLogs([]);
      setCompressionStats(null);
      setProgress({ current: 0, total: files.length });

      addLog("🚀 ImageHorse Enhanced Compression Started");
      addLog(`📊 Processing ${files.length} images for Core Web Vitals`);
      addLog("🎯 Target: Excellent performance scores for all images");
      addLog("─".repeat(50));

      try {
        // Convert FileList to File array and process
        const fileArray = Array.from(files);
        await addFiles(fileArray);

        // Monitor processing completion
        const checkCompletion = () => {
          if (loadingImages.size === 0) {
            // All images processed
            const elapsedTime = Date.now() - processingStartTime;
            addLog("─".repeat(50));
            addLog("🎉 All images processed successfully!");

            if (compressionStats) {
              addLog(
                `💾 Total savings: ${formatBytes(compressionStats.totalOriginalSize - compressionStats.totalCompressedSize)}`
              );
              addLog(
                `📊 Average compression: ${compressionStats.averageCompressionRatio}%`
              );
              addLog(
                `⚡ Core Web Vitals: ${compressionStats.goodScorePercentage}% optimized`
              );
              addLog(
                `✨ ${compressionStats.coreWebVitalsDistribution.good} images have excellent performance`
              );

              if (compressionStats.coreWebVitalsDistribution.poor > 0) {
                addLog(
                  `⚠️ ${compressionStats.coreWebVitalsDistribution.poor} images need manual optimization`
                );
              }
            }

            addLog(`⏱️ Completed in ${(elapsedTime / 1000).toFixed(1)}s`);
            addLog("🚀 Ready for editing!");

            // Navigate after showing results
            setTimeout(() => {
              navigate({ to: "/resize-and-optimize" });
            }, 3000);
          } else {
            // Still processing, check again
            setTimeout(checkCompletion, 500);
          }
        };

        // Start monitoring
        setTimeout(checkCompletion, 1000);
      } catch (error) {
        console.error("Processing error:", error);
        addLog(
          `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`
        );

        setTimeout(() => {
          setIsProcessing(false);
        }, 2000);
      }
    },
    [
      addFiles,
      processingStartTime,
      addLog,
      navigate,
      loadingImages.size,
      compressionStats,
    ]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) handleFiles(e.target.files);
    },
    [handleFiles]
  );

  const handleUploadClick = useCallback(
    () => fileInputRef.current?.click(),
    []
  );

  const handleBackToImages = useCallback(
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

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const hasImages = images.length > 0;
  const progressPercent =
    progress.total > 0 ? (progress.current / progress.total) * 100 : 0;

  // Processing view
  if (isProcessing) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <ComputerWindow size="xl">
          <ComputerWindowHeader>
            <div className="mb-4">
              <div className="w-12 h-12 border-4 border-sky-400 border-t-transparent rounded-full animate-spin" />
            </div>
            <ComputerWindowTitle
              title="ImageHorse Enhanced Processing"
              subtitle={`Core Web Vitals optimization for ${progress.total} images`}
            />
            <span className="flex gap-2 font-medium text-gray-400 mt-2">
              <span>
                {progress.current}/{progress.total}
              </span>
              <span>•</span>
              <span>{Math.round(progressPercent)}%</span>
              <span>•</span>
              <span>
                {loadingImages.size > 0 ? "Processing..." : "Complete"}
              </span>
            </span>
          </ComputerWindowHeader>

          <ComputerWindowProgress progress={progressPercent} />

          {/* Compression Statistics */}
          {compressionStats && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-green-400" />
                  <span className="text-white font-medium">
                    Compression Stats
                  </span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="text-gray-300">
                    Original: {formatBytes(compressionStats.totalOriginalSize)}
                  </div>
                  <div className="text-green-400">
                    Compressed:{" "}
                    {formatBytes(compressionStats.totalCompressedSize)}
                  </div>
                  <div className="text-sky-400">
                    Saved:{" "}
                    {formatBytes(
                      compressionStats.totalOriginalSize -
                        compressionStats.totalCompressedSize
                    )}
                    ({compressionStats.averageCompressionRatio}%)
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  {compressionStats.goodScorePercentage >= 80 ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : compressionStats.goodScorePercentage >= 60 ? (
                    <AlertCircle className="w-5 h-5 text-yellow-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  )}
                  <span className="text-white font-medium">
                    Core Web Vitals
                  </span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="text-green-400">
                    Excellent: {compressionStats.coreWebVitalsDistribution.good}
                  </div>
                  <div className="text-yellow-400">
                    Good:{" "}
                    {compressionStats.coreWebVitalsDistribution["almost-there"]}
                  </div>
                  <div className="text-sky-400 font-medium">
                    {compressionStats.goodScorePercentage}% Optimized
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Terminal Output */}
          <ComputerWindowTerminal maxHeight="max-h-64">
            <TerminalCommand>
              $ imagehorse --core-web-vitals --aggressive --verbose
            </TerminalCommand>
            <TerminalInfo>
              ImageHorse v2.0 - Core Web Vitals Optimizer
            </TerminalInfo>
            <TerminalInfo>
              Using AVIF/WebP with aggressive compression...
            </TerminalInfo>
            <TerminalInfo>{"─".repeat(40)}</TerminalInfo>

            {processingLogs.map((log, index) => {
              if (log.startsWith("🚀") || log.startsWith("🎉")) {
                return <TerminalSuccess key={index}>{log}</TerminalSuccess>;
              } else if (log.startsWith("⚠️") || log.startsWith("❌")) {
                return <TerminalWarning key={index}>{log}</TerminalWarning>;
              } else if (log.includes("✅") || log.includes("score")) {
                return (
                  <div key={index} className="text-green-400">
                    {log}
                  </div>
                );
              } else {
                return <TerminalInfo key={index}>{log}</TerminalInfo>;
              }
            })}

            {loadingImages.size === 0 && progress.total > 0 && (
              <>
                <TerminalInfo>{"─".repeat(40)}</TerminalInfo>
                <TerminalSuccess>
                  ✓ Core Web Vitals optimization complete
                </TerminalSuccess>
                <TerminalSuccess>
                  → Redirecting to image editor...
                </TerminalSuccess>
              </>
            )}
          </ComputerWindowTerminal>
        </ComputerWindow>
      </div>
    );
  }

  // Has images view
  if (hasImages) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <ComputerWindow>
          <ComputerWindowHeader>
            <ComputerWindowLogo
              src="/Image-Horse-Logo.svg"
              alt="ImageHorse Logo"
            />
            <ComputerWindowTitle
              title="ImageHorse"
              subtitle="Core Web Vitals Image Optimizer"
            />
          </ComputerWindowHeader>

          <div className="text-center mb-6">
            <p className="text-gray-300">
              Add more images for Core Web Vitals optimization
            </p>
          </div>

          {/* Upload Area */}
          <div
            className={`flex flex-col items-center justify-center p-8 border-2 border-dashed ${
              isDragging
                ? "border-sky-400 bg-sky-400/10"
                : "border-gray-600 bg-gray-800/50"
            } rounded-lg hover:bg-gray-800/70 transition-colors cursor-pointer mb-6`}
            onClick={handleUploadClick}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="h-10 w-10 text-sky-400 mb-4" />
            <p className="text-sm text-gray-300 text-center">
              Drag and drop more images or click to browse
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
            <button
              onClick={handleUploadClick}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-gray-200 dark:bg-white text-black hover:bg-gray-300 dark:hover:bg-gray-100 h-11 rounded-md px-8 flex-1"
            >
              Add More Images
            </button>
            <button
              onClick={handleBackToImages}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-gray-200 dark:bg-white text-black hover:bg-gray-300 dark:hover:bg-gray-100 h-11 rounded-md px-8 flex-1"
            >
              View Gallery ({images.length})
            </button>
          </div>
        </ComputerWindow>
      </div>
    );
  }

  // Initial upload view
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <ComputerWindow>
        <ComputerWindowHeader>
          <ComputerWindowLogo
            src="/Image-Horse-Logo.svg"
            alt="ImageHorse Logo"
          />
          <ComputerWindowTitle
            title="ImageHorse"
            subtitle="Core Web Vitals Image Optimizer"
          />
        </ComputerWindowHeader>

        <div className="text-center mb-6">
          <p className="text-gray-300">
            Upload images for aggressive Core Web Vitals optimization
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Automatically compressed to achieve excellent performance scores
          </p>
        </div>

        {/* Upload Area */}
        <div
          className={`flex flex-col items-center justify-center p-8 border-2 border-dashed ${
            isDragging
              ? "border-sky-400 bg-sky-400/10"
              : "border-gray-600 bg-gray-800/50"
          } rounded-lg hover:bg-gray-800/70 transition-colors cursor-pointer mb-6`}
          onClick={handleUploadClick}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="h-10 w-10 text-sky-400 mb-4" />
          <p className="text-sm text-gray-300 text-center">
            Drag and drop your images here or click to browse
          </p>
          <p className="text-xs text-gray-500 text-center mt-2">
            AVIF, WebP & JPEG • Automatic Core Web Vitals optimization
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

        {/* Button */}
        <button
          onClick={handleUploadClick}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-gray-200 dark:bg-white text-black hover:bg-gray-300 dark:hover:bg-gray-100 h-11 rounded-md px-8 w-full"
        >
          Select Images for Optimization
        </button>
      </ComputerWindow>
    </div>
  );
}
