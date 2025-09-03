"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import { Settings, Database, Trash2, Info } from "lucide-react";
import { useImageStore } from "../stores";

export default function ImageCacheSettings() {
  const {
    enableImageCache,
    enableOfflineMode,
    setEnableImageCache,
    setEnableOfflineMode,
    clearImageCache,
    getImageStats
  } = useImageStore();

  const stats = getImageStats();

  const handleClearCache = async () => {
    if (confirm("Are you sure you want to clear the image cache? This will remove all cached images.")) {
      await clearImageCache();
    }
  };

  return (
    <Card className="rounded-lg bg-card text-card-foreground shadow-lg">
      <CardHeader className="p-3 pb-0">
        <CardTitle className="flex items-center text-base font-semibold">
          <Settings className="h-4 w-4 mr-2" />
          Cache Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Image Cache Setting */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4" />
              <label className="text-sm font-medium">Image Cache</label>
            </div>
            <p className="text-xs text-muted-foreground">
              Cache images in browser storage for faster loading
            </p>
          </div>
          <Switch
            checked={enableImageCache}
            onCheckedChange={setEnableImageCache}
          />
        </div>

        {/* Offline Mode Setting */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2">
              <Info className="h-4 w-4" />
              <label className="text-sm font-medium">Offline Mode</label>
            </div>
            <p className="text-xs text-muted-foreground">
              Keep images available when offline
            </p>
          </div>
          <Switch
            checked={enableOfflineMode}
            onCheckedChange={setEnableOfflineMode}
            disabled={!enableImageCache}
          />
        </div>

        {/* Cache Statistics */}
        {enableImageCache && (
          <div className="pt-3 border-t border-border">
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Images in memory: {stats.imageCount}</p>
              <p>Total size: {Math.round(stats.totalOriginalSize / 1024)} KB</p>
            </div>
          </div>
        )}

        {/* Clear Cache Button */}
        {enableImageCache && (
          <Button
            onClick={handleClearCache}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Cache
          </Button>
        )}

        {/* Info */}
        <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
          <p className="font-medium mb-1">About Image Cache:</p>
          <ul className="space-y-1 ml-2">
            <li>• Stores images in browser's IndexedDB</li>
            <li>• Survives browser restarts</li>
            <li>• Uses additional storage space</li>
            <li>• May slow down on large images</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}