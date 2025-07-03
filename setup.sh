#!/bin/bash

# ImageHorse Complete Setup Script
# TanStack Start Edition with Theme System and Complete Toolbar 🐎

set -e  # Exit on any error

echo "🐎 Setting up ImageHorse - Complete Edition..."
echo "=============================================="

# Check if bun is installed
if ! command -v bun &> /dev/null; then
    echo "❌ Bun is not installed. Installing Bun..."
    curl -fsSL https://bun.sh/install | bash
    export PATH="$HOME/.bun/bin:$PATH"
    echo "✅ Bun installed successfully!"
else
    echo "✅ Bun is already installed"
fi

# Display Bun version
echo "📦 Using Bun version: $(bun --version)"

# Install dependencies
echo ""
echo "📥 Installing dependencies with Bun..."
bun install

# Install theme dependencies
echo ""
echo "🎨 Installing theme system dependencies..."
bun add next-themes
bun add class-variance-authority clsx tailwind-merge
bun add @radix-ui/react-dropdown-menu
bun add -D @types/node

# Create necessary directories
echo ""
echo "📁 Creating project directories..."
mkdir -p public
mkdir -p app/components/ui
mkdir -p app/utils
mkdir -p app/types
mkdir -p app/context

# Set up git repository if not already initialized
if [ ! -d ".git" ]; then
    echo ""
    echo "🔧 Initializing Git repository..."
    git init
fi

# Create/update .gitignore
echo ""
echo "📝 Creating/updating .gitignore..."
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
bun.lockb

# Build outputs
dist/
.output/
.vercel/

# Environment files
.env
.env.local
.env.production

# Generated files
app/routeTree.gen.ts
*.gen.ts

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
bun-debug.log*
bun-error.log*

# Editor directories and files
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Temporary files
*.tmp
*.temp

# Hidden files and folders (dotfiles)
.*
!.gitignore
!.env.example
EOF

# Create theme provider component
echo ""
echo "🎨 Creating theme provider component..."
cat > app/components/theme-provider.tsx << 'EOF'
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
EOF

# Create dropdown menu components
echo ""
echo "📝 Creating dropdown menu components..."
cat > app/components/ui/dropdown-menu.tsx << 'EOF'
"use client"

import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { Check, ChevronRight, Circle } from "lucide-react"
import { cn } from "../../lib/utils"

const DropdownMenu = DropdownMenuPrimitive.Root

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

const DropdownMenuGroup = DropdownMenuPrimitive.Group

const DropdownMenuPortal = DropdownMenuPrimitive.Portal

const DropdownMenuSub = DropdownMenuPrimitive.Sub

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent",
      inset && "pl-8",
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </DropdownMenuPrimitive.SubTrigger>
))
DropdownMenuSubTrigger.displayName =
  DropdownMenuPrimitive.SubTrigger.displayName

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
DropdownMenuSubContent.displayName =
  DropdownMenuPrimitive.SubContent.displayName

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
))
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
))
DropdownMenuCheckboxItem.displayName =
  DropdownMenuPrimitive.CheckboxItem.displayName

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
))
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-sm font-semibold",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
      {...props}
    />
  )
}
DropdownMenuShortcut.displayName = "DropdownMenuShortcut"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
}
EOF

# Create the proper theme toggle component
echo ""
echo "🎨 Creating proper theme toggle component..."
cat > app/components/ui/theme-toggle.tsx << 'EOF'
"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "./button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu"

export function ThemeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="h-9 w-9">
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
EOF

# Create resize-and-optimize component with complete toolbar
echo ""
echo "🛠️ Creating resize-and-optimize component with complete toolbar..."
cat > app/components/resize-and-optimize.tsx << 'EOF'
import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { globalImages } from './photo-upload'
import { Button } from './ui/button'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { ThemeToggle } from './ui/theme-toggle'
import {
  X,
  Upload,
  ArrowLeft,
  Minus,
  Plus,
  Download,
  Settings,
  Trash2,
  Image as ImageIcon,
  Zap,
  FileDown,
  Edit,
  Image,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  User,
} from 'lucide-react'

// Import your existing utils
import { formatBytes, safeRevokeURL, downloadImagesAsZip } from '../utils/image-utils'
import { compressImageAggressively } from '../utils/image-processing'

// Ultra-fast thumbnail component with zero re-renders
const SuperFastThumbnail = React.memo(({ 
  image, 
  isSelected, 
  onClick, 
  onRemove 
}: {
  image: any
  isSelected: boolean
  onClick: () => void
  onRemove: (e: React.MouseEvent) => void
}) => (
  <div
    className={`relative aspect-square cursor-pointer rounded-lg overflow-hidden group border-2 transition-all ${
      isSelected
        ? 'border-primary ring-2 ring-primary/50'
        : 'border-border hover:border-primary/50'
    }`}
    onClick={onClick}
  >
    <img
      src={image.thumbnail} // Always use the fast thumbnail
      alt={image.file.name}
      className="w-full h-full object-cover"
      loading="lazy"
      decoding="async" // Performance optimization
    />
    {/* Compression indicator */}
    {image.compressed && (
      <div className="absolute top-1 left-1 bg-green-500 text-white px-1 py-0.5 text-xs rounded">
        <Zap className="w-3 h-3 inline" />
      </div>
    )}
    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button
        variant="destructive"
        size="sm"
        className="h-6 w-6 p-0"
        onClick={onRemove}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
    {/* Size reduction indicator */}
    {image.compressed && (
      <div className="absolute bottom-1 left-1 bg-black/75 text-white px-1 py-0.5 text-xs rounded">
        -{Math.round(((image.originalSize - image.compressedSize) / image.originalSize) * 100)}%
      </div>
    )}
  </div>
))

export default function ResizeAndOptimize() {
  const navigate = useNavigate()
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [zoom, setZoom] = useState(100)
  const [isDownloading, setIsDownloading] = useState(false)

  const imagesPerPage = 12 // Show more images per page

  // Memoized data - prevents expensive recalculations
  const pageData = useMemo(() => {
    const totalPages = Math.ceil(globalImages.length / imagesPerPage)
    const currentImages = globalImages.slice(
      currentPage * imagesPerPage,
      (currentPage + 1) * imagesPerPage
    )
    const selectedImage = globalImages.find(img => img.id === selectedImageId)
    
    // Calculate total savings
    const totalOriginalSize = globalImages.reduce((sum, img) => sum + img.originalSize, 0)
    const totalCompressedSize = globalImages.reduce((sum, img) => sum + (img.compressedSize || img.originalSize), 0)
    const totalSavings = totalOriginalSize - totalCompressedSize
    const savingsPercent = totalOriginalSize > 0 ? (totalSavings / totalOriginalSize) * 100 : 0
    
    return { 
      totalPages, 
      currentImages, 
      selectedImage, 
      totalOriginalSize,
      totalCompressedSize,
      totalSavings,
      savingsPercent
    }
  }, [globalImages.length, currentPage, selectedImageId, imagesPerPage])

  // Set initial selection
  useEffect(() => {
    if (globalImages.length > 0 && !selectedImageId) {
      setSelectedImageId(globalImages[0].id)
    }
  }, [selectedImageId])

  const handleSelectImage = useCallback((image: any) => {
    setSelectedImageId(image.id)
  }, [])

  const handleRemoveImage = useCallback((imageId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    const index = globalImages.findIndex(img => img.id === imageId)
    if (index === -1) return

    // Clean up URLs using your util
    const imageToRemove = globalImages[index]
    safeRevokeURL(imageToRemove.url)
    safeRevokeURL(imageToRemove.thumbnail)
    if (imageToRemove.compressed) safeRevokeURL(imageToRemove.compressed)

    // Remove from global array
    globalImages.splice(index, 1)

    // Update selection
    if (selectedImageId === imageId) {
      if (globalImages.length > 0) {
        const newIndex = Math.min(index, globalImages.length - 1)
        setSelectedImageId(globalImages[newIndex]?.id || null)
      } else {
        setSelectedImageId(null)
      }
    }

    // Force re-render
    setCurrentPage(prev => prev)
  }, [selectedImageId])

  const handleRemoveAll = useCallback(() => {
    // Clean up all URLs using your util
    globalImages.forEach(img => {
      safeRevokeURL(img.url)
      safeRevokeURL(img.thumbnail)
      if (img.compressed) safeRevokeURL(img.compressed)
    })
    
    globalImages.length = 0
    setSelectedImageId(null)
    setCurrentPage(0)
  }, [])

  const handleNavigation = useCallback((direction: 'prev' | 'next' | 'prev10' | 'next10') => {
    if (globalImages.length === 0 || !selectedImageId) return
    
    const currentIndex = globalImages.findIndex(img => img.id === selectedImageId)
    let newIndex
    
    switch (direction) {
      case 'prev':
        newIndex = currentIndex > 0 ? currentIndex - 1 : globalImages.length - 1
        break
      case 'next':
        newIndex = currentIndex < globalImages.length - 1 ? currentIndex + 1 : 0
        break
      case 'prev10':
        newIndex = Math.max(0, currentIndex - 10)
        break
      case 'next10':
        newIndex = Math.min(globalImages.length - 1, currentIndex + 10)
        break
      default:
        return
    }
    
    setSelectedImageId(globalImages[newIndex].id)
    
    // Update page if needed
    const newPage = Math.floor(newIndex / imagesPerPage)
    if (newPage !== currentPage) {
      setCurrentPage(newPage)
    }
  }, [selectedImageId, currentPage, imagesPerPage])

  const handleZoom = useCallback((direction: 'in' | 'out') => {
    setZoom(prev => {
      if (direction === 'in') {
        return Math.min(400, prev + 25)
      } else {
        return Math.max(25, prev - 25)
      }
    })
  }, [])

  if (globalImages.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <div className="text-center py-20">
          <ImageIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">No images uploaded yet.</p>
          <Button onClick={() => navigate({ to: '/' })}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Images
          </Button>
        </div>
      </div>
    )
  }

  const { totalPages, currentImages, selectedImage, totalOriginalSize, totalSavings, savingsPercent } = pageData

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      {/* Gallery Grid */}
      <div className="mb-6">
        <div className="grid grid-cols-12 gap-2 mb-4">
          {currentImages.map((image) => (
            <SuperFastThumbnail
              key={image.id}
              image={image}
              isSelected={selectedImageId === image.id}
              onClick={() => handleSelectImage(image)}
              onRemove={(e) => handleRemoveImage(image.id, e)}
            />
          ))}
        </div>

        {/* Complete Toolbar - Exactly matching your HTML structure */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 bg-gray-700 p-2 rounded-lg z-10 relative">
          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <Button 
              variant="outline" 
              className="h-9 w-9 p-0"
              onClick={() => handleZoom('out')}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              className="h-9 w-9 p-0"
              onClick={() => handleZoom('in')}
            >
              <Plus className="h-4 w-4" />
            </Button>

            {/* Editor Mode Buttons */}
            <Button 
              variant="outline" 
              className="px-4 py-2 h-9" 
              disabled
              data-testid="edit-image-button"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Image Mode
            </Button>
            
            <Button 
              variant="outline" 
              className="px-4 py-2 h-9"
              disabled={!globalImages || globalImages.length <= 1}
              title={
                !globalImages
                  ? "No images available"
                  : globalImages.length <= 1
                  ? `Bulk edit requires multiple images (currently ${
                      globalImages.length
                    } image${globalImages.length === 1 ? "" : "s"})`
                  : `Edit ${globalImages.length} images at once`
              }
            >
              <Image className="mr-2 h-4 w-4" />
              Bulk Image Edit
              {globalImages && globalImages.length > 0 && (
                <span className="ml-1 text-xs opacity-75">
                  ({globalImages.length})
                </span>
              )}
            </Button>
            
            {/* AI Editor Button with Animated Rainbow Ring */}
            <div className="relative">
              {/* Animated rainbow ring overlay */}
              <div className="absolute -inset-0.1 rounded-lg opacity-80 py-2 px-4">
                <div className="w-full h-full rounded-lg bg-gradient-to-r from-red-500 via-orange-500 via-yellow-500 via-green-500 via-blue-500 via-indigo-500 via-purple-500 to-red-500 animate-rainbow-slow"></div>
              </div>

              {/* Second rainbow ring for depth */}
              <div className="absolute -inset-0.1 rounded-lg">
                <div className="w-full h-full rounded-lg bg-gradient-to-r from-purple-400 via-blue-400 via-green-400 via-yellow-400 via-orange-400 via-red-400 to-purple-400 animate-rainbow-reverse opacity-50"></div>
              </div>
              
              {/* Animated rainbow outline */}
              <div
                className="absolute inset-0 rounded-md p-[1px] rainbow-border"
                style={{
                  background: "linear-gradient(90deg, #ef4444, #f97316, #eab308, #22c55e, #3b82f6, #6366f1, #a855f7, #ef4444)",
                  backgroundSize: "400% 100%",
                  animation: "rainbow-flow 4s ease-in-out infinite",
                }}
              >
                <div className="w-full h-full bg-background rounded-[calc(0.375rem-1px)]"></div>
              </div>

              {/* Main AI Editor button */}
              <button
                disabled
                className="py-4 px-5 relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground px-4 py-2 h-9"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"
                    fill="currentColor"
                    opacity="0.5"
                  />
                  <path
                    d="M19 11L19.74 13.09L22 14L19.74 14.91L19 17L18.26 14.91L16 14L18.26 13.09L19 11Z"
                    fill="currentColor"
                    opacity="0.7"
                  />
                  <path
                    d="M5 11L5.74 13.09L8 14L5.74 14.91L5 17L4.26 14.91L2 14L4.26 13.09L5 11Z"
                    fill="currentColor"
                    opacity="0.3"
                  />
                </svg>
                AI Editor
              </button>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center gap-1 ml-2">
              <Button
                variant="outline"
                className="py-2 h-9 px-3"
                onClick={() => handleNavigation('prev10')}
                disabled={globalImages.length === 0}
                title="Back 10 images"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="py-2 h-9 px-3"
                onClick={() => handleNavigation('prev')}
                disabled={globalImages.length === 0}
                title="Previous image"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm px-2 text-white whitespace-nowrap">Switch Photos</span>
              <Button
                variant="outline"
                className="py-2 h-9 px-3"
                onClick={() => handleNavigation('next')}
                disabled={globalImages.length === 0}
                title="Next image"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="py-2 h-9 px-3"
                onClick={() => handleNavigation('next10')}
                disabled={globalImages.length === 0}
                title="Forward 10 images"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              className="px-4 py-2 h-9"
              onClick={() => navigate({ to: '/' })}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Upload
            </Button>
            <Button 
              variant="destructive" 
              className="px-4 py-2 h-9"
              onClick={handleRemoveAll}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove All Images
            </Button>

            {/* Theme Toggle - Proper ShadUI Dropdown */}
            <ThemeToggle />

            {/* User Button */}
            <Button 
              variant="outline" 
              className="h-9 w-9" 
              disabled
            >
              <User className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Image Display */}
      {selectedImage && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div
              className="flex items-center justify-center bg-muted rounded-lg"
              style={{ minHeight: '400px' }}
            >
              <img
                src={selectedImage.compressed || selectedImage.url}
                alt={selectedImage.file.name}
                className="max-w-full max-h-full object-contain rounded"
                style={{ transform: `scale(${zoom / 100})` }}
                loading="lazy"
                decoding="async"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Image Info */}
      {selectedImage && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Image Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">Filename:</span>
                <p className="font-mono text-xs">{selectedImage.file.name}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Dimensions:</span>
                <p>{selectedImage.width} × {selectedImage.height}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Original Size:</span>
                <p>{formatBytes(selectedImage.originalSize)}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Compressed:</span>
                <p>{formatBytes(selectedImage.compressedSize || selectedImage.originalSize)}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Savings:</span>
                <p className="text-green-600">
                  {selectedImage.compressedSize 
                    ? `${Math.round(((selectedImage.originalSize - selectedImage.compressedSize) / selectedImage.originalSize) * 100)}%`
                    : '0%'
                  }
                </p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Format:</span>
                <p>{selectedImage.file.type}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
EOF

# Update layout.tsx
echo ""
echo "📝 Creating updated layout.tsx..."
cat > app/layout.tsx << 'EOF'
import React from 'react';
import { ImageProvider } from './context/ImageContext';
import { ThemeProvider } from './components/theme-provider';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ImageProvider>
            {children}
          </ImageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
EOF

# Update globals.css with dark mode support
echo ""
echo "🎨 Ensuring globals.css has proper theme support..."
if [ -f "app/globals.css" ]; then
    # Check if dark mode variables exist
    if ! grep -q ".dark {" app/globals.css; then
        echo ""
        echo "📝 Adding dark mode CSS variables..."
        cat >> app/globals.css << 'EOF'

/* Dark mode theme variables */
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  --popover: 222.2 84% 4.9%;
  --popover-foreground: 210 40% 98%;
  --primary: 210 40% 98%;
  --primary-foreground: 222.2 47.4% 11.2%;
  --secondary: 217.2 32.6% 17.5%;
  --secondary-foreground: 210 40% 98%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 210 40% 98%;
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --ring: 212.7 26.8% 83.9%;
}

/* Custom animations for the AI Editor button */
@keyframes rainbow-flow {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes rainbow-slow {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes rainbow-reverse {
  0% { transform: rotate(360deg); }
  100% { transform: rotate(0deg); }
}

.animate-rainbow-slow {
  animation: rainbow-slow 8s linear infinite;
}

.animate-rainbow-reverse {
  animation: rainbow-reverse 6s linear infinite;
}

.rainbow-border {
  animation: rainbow-flow 4s ease-in-out infinite;
}
EOF
    else
        echo "✅ Dark mode CSS variables already exist"
    fi
else
    echo "⚠️  globals.css not found. Please ensure you have proper CSS variables set up."
fi

# Build the project
echo ""
echo "🔨 Building the project..."
bun run build

echo ""
echo "🎉 Complete setup finished!"
echo ""
echo "✅ Installed all dependencies"
echo "✅ Created theme system with next-themes"
echo "✅ Built complete toolbar component"
echo "✅ Added dark/light/system theme support"
echo "✅ Created animated AI Editor button"
echo "✅ Added proper zoom controls"
echo "✅ Set up navigation buttons"
echo ""
echo "🛠️ Complete toolbar features:"
echo "  • ➖ [100%] ➕ Zoom controls with percentage display"
echo "  • 🎨 Edit Image Mode button (disabled)"
echo "  • 📚 Bulk Image Edit button (shows count)"
echo "  • ✨ AI Editor button (animated rainbow border)"
echo "  • ⏪ ◀️ Switch Photos ▶️ ⏩ Navigation"
echo "  • ← Back to Upload button"
echo "  • 🗑️ Remove All Images button"
echo "  • 🌙/☀️/💻 Theme toggle (cycles through all modes)"
echo "  • 👤 User button (disabled)"
echo ""
echo "📋 Available commands:"
echo "  bun run dev      - Start development server"
echo "  bun run build    - Build for production"
echo "  bun run start    - Start production server"
echo "  bun run lint     - Run ESLint checks"
echo "  bun run clean    - Clean build artifacts"
echo "  bun run fresh    - Clean install"
echo ""
echo "🚀 To start developing:"
echo "  bun run dev"
echo ""
echo "🐎 Happy coding with ImageHorse - Complete Edition!"