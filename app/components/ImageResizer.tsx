"use client";

import React, { useState, useEffect } from "react";
import { useImageContext } from "../context/image-context";
import { useEditorStore } from "../store/editor-store";
import { Slider } from "./ui/slider";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Maximize2, Download, Image as ImgIcon, RefreshCw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { COMPRESSION_LEVELS } from "../constants/editorConstants";
import type { ImageFormat } from "../types";

export default function ImageResizer() {
  const { selectedImage, resizeDraft, setResizeDraft, handleApplyResize, onDownload, handleReset } = useImageContext();
  const { quality, format, compressionLevel, setQuality, setFormat, setCompressionLevel, handleReset: resetEditorUI } = useEditorStore();
  const [aspectRatio, setAspectRatio] = useState(true);

  const initialWidth = selectedImage?.width || 0;
  const initialHeight = selectedImage?.height || 0;

  const handleDimensionChange = (newVal: number, dimension: "width" | "height") => {
    if (!resizeDraft || newVal <= 0 || initialWidth === 0 || initialHeight === 0) return;
    let newW = dimension === 'width' ? newVal : resizeDraft.width;
    let newH = dimension === 'height' ? newVal : resizeDraft.height;
    if (aspectRatio) {
      if (dimension === 'width') newH = Math.round(newW / (initialWidth / initialHeight));
      else newW = Math.round(newH * (initialWidth / initialHeight));
    }
    setResizeDraft({ width: newW, height: newH });
  };

  const handleLevelChange = (levelValue: string) => {
    setCompressionLevel(levelValue as any);
    const level = COMPRESSION_LEVELS.find(l => l.value === levelValue);
    if (level) setQuality(level.quality);
  };

  const handleFullReset = () => {
    resetEditorUI();
    handleReset();
  };

  if (!selectedImage || !resizeDraft) return (
    <Card className="rounded-lg border shadow-sm bg-gray-800 text-white border-gray-700 flex items-center justify-center p-6 min-h-[400px]">
      <p className="text-muted-foreground text-center">Select an image to see resize options.</p>
    </Card>
  );

  return (
    <Card className="rounded-lg border shadow-sm bg-gray-800 text-white border-gray-700">
      <CardHeader className="p-3 pb-0">
        <CardTitle className="flex items-center text-base font-semibold">
          <ImgIcon className="h-4 w-4 mr-2" /> Resize & Optimize
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div>
          <label className="text-sm font-medium">Width: {resizeDraft.width}px</label>
          <Slider min={10} max={initialWidth} value={[resizeDraft.width]} onValueChange={(v) => handleDimensionChange(v[0], 'width')} />
        </div>
        <div>
          <label className="text-sm font-medium">Height: {resizeDraft.height}px</label>
          <Slider min={10} max={initialHeight} value={[resizeDraft.height]} onValueChange={(v) => handleDimensionChange(v[0], 'height')} />
        </div>
        <div className="flex items-center justify-between">
          <label className="text-sm">Maintain aspect ratio</label>
          <button onClick={() => setAspectRatio(p => !p)} className={`w-10 h-6 p-1 rounded-full flex items-center transition-colors ${aspectRatio ? "bg-blue-600 justify-end" : "bg-gray-600 justify-start"}`}>
            <span className="w-4 h-4 rounded-full bg-white" />
          </button>
        </div>
        <div>
          <label className="text-sm font-medium">Compression Level</label>
          <Select value={compressionLevel} onValueChange={handleLevelChange}>
            <SelectTrigger className="bg-gray-700 border-gray-600"><SelectValue /></SelectTrigger>
            <SelectContent>{COMPRESSION_LEVELS.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <Select value={format} onValueChange={(v) => setFormat(v as ImageFormat)}>
          <SelectTrigger className="w-full bg-gray-700 border-gray-600"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="jpeg">JPEG</SelectItem>
            <SelectItem value="png">PNG</SelectItem>
            <SelectItem value="webp">WebP</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleApplyResize} className="w-full bg-primary hover:bg-primary/90"><Maximize2 className="h-4 w-4 mr-2" /> Convert</Button>
        <Button onClick={handleFullReset} variant="outline" className="w-full"><RefreshCw className="h-4 w-4 mr-2" /> Reset</Button>
        <Button onClick={onDownload} variant="outline" className="w-full"><Download className="h-4 w-4 mr-2" /> Download</Button>
      </CardContent>
    </Card>
  );
}
