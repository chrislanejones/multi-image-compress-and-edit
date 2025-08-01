import React from "react";
import { Lock, Crop, Droplets, Paintbrush, Type, Image } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NonGalleryHeaderProps {
  mode: "edit" | "crop" | "blur" | "paint" | "text";
  className?: string;
}

const modeConfig: Record<NonGalleryHeaderProps["mode"], {
  icon: LucideIcon;
  title: string;
  description: string;
}> = {
  edit: {
    icon: Lock,
    title: "Edit Image Mode",
    description: "The gallery is hidden. Use the toolbar below to edit your image.",
  },
  crop: {
    icon: Crop,
    title: "Crop Image Mode",
    description: "The gallery is hidden. Use the toolbar below to crop your image.",
  },
  blur: {
    icon: Droplets,
    title: "Blur Image Mode",
    description: "The gallery is hidden. Use the toolbar below to blur parts of your image.",
  },
  paint: {
    icon: Paintbrush,
    title: "Paint Image Mode",
    description: "The gallery is hidden. Use the toolbar below to paint on your image.",
  },
  text: {
    icon: Type,
    title: "Text Image Mode",
    description: "The gallery is hidden. Use the toolbar below to add text to your image.",
  },
};

export function NonGalleryHeader({ mode, className }: NonGalleryHeaderProps) {
  const config = modeConfig[mode];
  const Icon = config.icon;

  return (
    <div className={cn(
      "text-center p-8 bg-gray-800 rounded-lg mb-6 flex flex-col items-center justify-center min-h-[124px]",
      className
    )}>
      <div className="inline-flex items-center gap-2 justify-center px-4 py-2 rounded-full bg-gray-600 border border-gray-500">
        <Icon className="h-4 w-4 text-white" />
        <span className="font-medium text-white">{config.title}</span>
      </div>
      <p className="text-sm text-muted-foreground mt-2">
        {config.description}
      </p>
    </div>
  );
}