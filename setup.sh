#!/bin/bash

# ImageHorse - Image Editor Recreation Script with Bun & TanStack
# This script recreates the entire project structure with shell commands

set -e  # Exit on any error

echo "🐴 Creating ImageHorse with Bun & TanStack..."

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}📦 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if bun is installed
if ! command -v bun &> /dev/null; then
    print_warning "Bun is not installed. Installing..."
    curl -fsSL https://bun.sh/install | bash
    export PATH="$HOME/.bun/bin:$PATH"
fi

# Project setup
PROJECT_NAME="imagehorse-tanstack"
print_step "Creating project directory: $PROJECT_NAME"

# Remove existing directory if it exists
rm -rf $PROJECT_NAME
mkdir $PROJECT_NAME
cd $PROJECT_NAME

# Initialize project with Bun
print_step "Initializing project with Bun"
bun init -y

# Install dependencies
print_step "Installing dependencies with Bun"
bun add vite@latest react@latest react-dom@latest typescript @types/react @types/react-dom @types/node
bun add @tanstack/react-query @tanstack/react-router @tanstack/react-table @tanstack/react-virtual
bun add @tanstack/router-devtools @tanstack/router-vite-plugin
bun add tailwindcss postcss autoprefixer @tailwindcss/typography
bun add class-variance-authority clsx tailwind-merge
bun add @radix-ui/react-slot @radix-ui/react-toast @radix-ui/react-dialog @radix-ui/react-dropdown-menu
bun add @radix-ui/react-select @radix-ui/react-slider @radix-ui/react-separator @radix-ui/react-aspect-ratio
bun add lucide-react
bun add react-image-crop react-easy-crop
bun add emoji-picker-react recharts
bun add jszip papaparse mathjs lodash
bun add @types/lodash vite-tsconfig-paths

# Development dependencies
bun add -d eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser

# Initialize Tailwind CSS
print_step "Setting up Tailwind CSS"
bunx tailwindcss init -p

# Create directory structure
print_step "Creating directory structure"
mkdir -p {src,components,lib,hooks,types,styles,public}
mkdir -p src/{routes,components,utils,constants,hooks}
mkdir -p components/ui

# Create package.json scripts
print_step "Updating package.json"
cat > package.json << 'EOF'
{
  "name": "imagehorse-tanstack",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@radix-ui/react-aspect-ratio": "^1.1.0",
    "@radix-ui/react-dialog": "^1.1.1",
    "@radix-ui/react-dropdown-menu": "^2.1.1",
    "@radix-ui/react-select": "^2.1.1",
    "@radix-ui/react-separator": "^1.1.0",
    "@radix-ui/react-slider": "^1.2.0",
    "@radix-ui/react-slot": "^1.1.0",
    "@radix-ui/react-toast": "^1.2.1",
    "@tanstack/react-query": "^5.0.0",
    "@tanstack/react-router": "^1.0.0",
    "@tanstack/react-table": "^8.0.0",
    "@tanstack/react-virtual": "^3.0.0",
    "@tanstack/router-devtools": "^1.0.0",
    "@tanstack/router-vite-plugin": "^1.0.0",
    "@types/lodash": "^4.17.7",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "emoji-picker-react": "^4.11.1",
    "jszip": "^3.10.1",
    "lodash": "^4.17.21",
    "lucide-react": "^0.445.0",
    "mathjs": "^12.4.3",
    "papaparse": "^5.4.1",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "react-easy-crop": "^5.0.8",
    "react-image-crop": "^11.0.7",
    "recharts": "^2.12.7",
    "tailwind-merge": "^2.5.2",
    "tailwindcss": "^3.4.13",
    "typescript": "^5.0.0",
    "vite": "^5.0.0",
    "vite-tsconfig-paths": "^4.3.2"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "autoprefixer": "^10.4.20",
    "eslint": "^8.0.0",
    "postcss": "^8.4.47"
  }
}
EOF

# Create TypeScript config
print_step "Creating TypeScript configuration"
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "allowSyntheticDefaultImports": true,
    
    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    
    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    
    /* Paths */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "~/*": ["./src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "vite.config.ts"],
  "exclude": ["node_modules", "dist"]
}
EOF

# Create Vite config
print_step "Creating Vite configuration"
cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-vite-plugin'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    react(),
    TanStackRouterVite({
      routesDirectory: './src/routes',
      generatedRouteTree: './src/routeTree.gen.ts',
    }),
    tsconfigPaths(),
  ],
  resolve: {
    alias: {
      '@': '/src',
      '~/': '/src/',
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
EOF

# Create Tailwind config
print_step "Creating Tailwind configuration"
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
}
EOF

# Create PostCSS config
print_step "Creating PostCSS configuration"
cat > postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# Create lib/utils.ts
print_step "Creating utility functions"
cat > lib/utils.ts << 'EOF'
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
EOF

# Create types directory and main types file
print_step "Creating type definitions"
cat > types/index.ts << 'EOF'
export type CoreWebVitalsScore = "poor" | "needs-improvement" | "almost-there" | "good";

export type EditorState =
  | "resizeAndOptimize" 
  | "editImage" 
  | "bulkImageEdit" 
  | "crop" 
  | "blur" 
  | "paint" 
  | "text" 
  | "bulkCrop";

export type ImageFormat = "jpeg" | "png" | "webp";

export type NavigationDirection = "next" | "prev" | "next10" | "prev10";

export interface ImageFile {
  id: string;
  file: File;
  url: string;
  width?: number;
  height?: number;
  metadata?: Record<string, any>;
}

export interface ImageStats {
  width: number;
  height: number;
  size: number;
  format: string;
}

export interface PaintStroke {
  points: { x: number; y: number }[];
  color: string;
  width: number;
}

export interface TextOverlay {
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  bold?: boolean;
  italic?: boolean;
}
EOF

# Create styles
print_step "Creating styles"
cat > src/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: Arial, Helvetica, sans-serif;
}

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 3.9%;
    --primary: 0 0% 9%;
    --primary-foreground: 0 0% 98%;
    --secondary: 0 0% 96.1%;
    --secondary-foreground: 0 0% 9%;
    --muted: 0 0% 96.1%;
    --muted-foreground: 0 0% 45.1%;
    --accent: 0 0% 96.1%;
    --accent-foreground: 0 0% 9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 89.8%;
    --input: 0 0% 89.8%;
    --ring: 0 0% 3.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
    --card: 0 0% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 0 0% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 0 0% 9%;
    --secondary: 0 0% 14.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 0 0% 14.9%;
    --muted-foreground: 0 0% 63.9%;
    --accent: 0 0% 14.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 14.9%;
    --input: 0 0% 14.9%;
    --ring: 0 0% 83.1%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

/* Custom animations */
@keyframes fade-scale-in {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fade-scale-in {
  animation: fade-scale-in 0.4s ease-out forwards;
}
EOF

# Create components/ui path fix
cat > src/components/ui/button.tsx << 'EOF'
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
EOF

cat > src/components/ui/card.tsx << 'EOF'
import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}
      {...props}
    />
  )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  )
)
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("text-2xl font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  )
)
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
)
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
)
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  )
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
EOF

# Create TanStack Query provider and router setup
print_step "Creating TanStack providers and router"
cat > src/main.tsx << 'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
})

const router = createRouter({ 
  routeTree,
  context: {
    queryClient,
  },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
)
EOF

# Create root route
cat > src/routes/__root.tsx << 'EOF'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <div className="min-h-screen bg-background text-foreground">
        <Outlet />
      </div>
      <TanStackRouterDevtools />
    </>
  ),
})
EOF

# Create index route
cat > src/routes/index.tsx << 'EOF'
import { createFileRoute } from '@tanstack/react-router'
import { ImageUploader } from '@/components/ImageUploader'

export const Route = createFileRoute('/')({
  component: ImageUploader,
})
EOF

# Create main page component
print_step "Creating main components"
cat > src/components/ImageUploader.tsx << 'EOF'
import { useState, useRef, type ChangeEvent, type DragEvent } from 'react'
import { X, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import type { ImageFile } from '@/types'

export function ImageUploader() {
  const [images, setImages] = useState<ImageFile[]>([])
  const [uploadComplete, setUploadComplete] = useState(false)
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const addFiles = (files: FileList) => {
    const newImages: ImageFile[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file.type.startsWith('image/')) {
        newImages.push({
          id: crypto.randomUUID(),
          file,
          url: URL.createObjectURL(file),
        })
      }
    }

    setImages(prev => [...prev, ...newImages])
    if (newImages.length > 0) {
      setUploadComplete(true)
      if (!selectedImage) {
        setSelectedImage(newImages[0])
      }
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    addFiles(files)
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files)
    }
  }

  const removeImage = (id: string) => {
    const updatedImages = images.filter(image => image.id !== id)
    setImages(updatedImages)
    
    if (selectedImage?.id === id) {
      if (updatedImages.length > 0) {
        setSelectedImage(updatedImages[0])
      } else {
        setSelectedImage(null)
        setUploadComplete(false)
      }
    }
  }

  if (!uploadComplete) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col items-center justify-center">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/50 p-4 rounded-full w-50 h-50 flex items-center justify-center mb-2">
              <div className="text-6xl">🐴</div>
            </div>
            <CardTitle className="text-2xl">ImageHorse</CardTitle>
            <CardDescription>
              Upload Multiple Images for Editing and Compression
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg hover:bg-primary/10 transition-colors cursor-pointer ${
                isDragging 
                  ? 'border-primary bg-primary/10' 
                  : 'border-primary/20 bg-primary/5'
              }`}
              onClick={handleUploadClick}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="h-10 w-10 text-primary/60 mb-4" />
              <p className="text-sm text-muted-foreground text-center">
                Drag and drop your images here, click to browse, or paste from clipboard
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
          </CardContent>
          <CardFooter>
            <Button onClick={handleUploadClick} className="w-full" size="lg">
              Select Images
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col">
      <div className="grid grid-cols-5 md:grid-cols-10 gap-2 p-2 bg-gray-800 rounded-lg mb-6">
        {images.map((image, index) => (
          <div
            key={image.id}
            className={`relative group aspect-square animate-fade-scale-in cursor-pointer ${
              selectedImage?.id === image.id ? 'ring-2 ring-blue-500' : ''
            }`}
            style={{ animationDelay: `${index * 0.05}s` }}
            onClick={() => setSelectedImage(image)}
          >
            <img
              src={image.url}
              alt="Uploaded image"
              className="w-full h-full object-cover rounded-md"
            />
            <button
              onClick={(e) => {
                e.stopPropagation()
                removeImage(image.id)
              }}
              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Remove image"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      {selectedImage && (
        <div className="flex-1 flex items-center justify-center">
          <div className="relative max-w-4xl max-h-[70vh]">
            <img
              src={selectedImage.url}
              alt="Selected image"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  )
}
EOF

# Create image processing utilities
print_step "Creating image processing utilities"
mkdir -p src/utils
cat > src/utils/image-processing.ts << 'EOF'
import type { ImageFormat } from '@/types'

export const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = url
  })
}

export const getMimeType = (format: string): string => {
  switch (format.toLowerCase()) {
    case 'webp':
      return 'image/webp'
    case 'png':
      return 'image/png'
    case 'jpeg':
    case 'jpg':
      return 'image/jpeg'
    default:
      return 'image/jpeg'
  }
}

export const canvasToBlob = (
  canvas: HTMLCanvasElement,
  format: ImageFormat | string = 'jpeg',
  quality = 0.9
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const normalizedQuality = quality > 1 ? quality / 100 : quality
    
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas to Blob conversion failed'))
          return
        }
        resolve(blob)
      },
      getMimeType(format),
      normalizedQuality
    )
  })
}

export const compressImage = async (
  imageUrl: string,
  maxWidth = 1200,
  format: ImageFormat | string = 'webp',
  quality = 0.85
): Promise<{ url: string; blob: Blob; width: number; height: number }> => {
  const img = await loadImage(imageUrl)
  
  let width = img.naturalWidth
  let height = img.naturalHeight
  
  if (width > maxWidth) {
    const ratio = maxWidth / width
    width = maxWidth
    height = Math.round(height * ratio)
  }
  
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Failed to get canvas context')
  
  canvas.width = width
  canvas.height = height
  
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, 0, 0, width, height)
  
  const blob = await canvasToBlob(canvas, format, quality)
  const url = URL.createObjectURL(blob)
  
  return { url, blob, width, height }
}
EOF

# Create constants
print_step "Creating constants"
mkdir -p src/constants
cat > src/constants/editor.ts << 'EOF'
export const COMPRESSION_LEVELS = [
  { value: 'low', label: 'Low (Better quality)', quality: 95 },
  { value: 'medium', label: 'Medium (Balanced)', quality: 85 },
  { value: 'high', label: 'High (Smaller file)', quality: 75 },
  { value: 'extreme', label: 'Extreme (Smallest)', quality: 60 },
] as const

export const IMAGE_FORMATS = [
  { value: 'jpeg', label: 'JPEG', description: 'Best for photos' },
  { value: 'png', label: 'PNG', description: 'Best for transparency' },
  { value: 'webp', label: 'WebP', description: 'Modern format' },
] as const

export const TOOL_CONFIG = {
  blur: { minAmount: 1, maxAmount: 20, minRadius: 5, maxRadius: 50 },
  brush: { minSize: 1, maxSize: 50 },
  text: { minSize: 8, maxSize: 72, defaultFont: 'Arial' },
  zoom: { min: 0.5, max: 3, step: 0.1 },
} as const
EOF

# Create HTML entry point
print_step "Creating HTML entry point"
cat > index.html << 'EOF'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ImageHorse - Advanced Image Editor</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOFIndex])
  
  return {
    editorState,
    setEditorState,
    zoom,
    handleZoomIn,
    handleZoomOut,
    history,
    historyIndex,
    addToHistory,
    handleUndo,
    handleRedo,
  }
}
EOF

# Create public assets
print_step "Creating public assets"
echo '🐴' > public/horse-icon.txt

# Create .gitignore
print_step "Creating .gitignore"
cat > .gitignore << 'EOF'
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# bun
.bun
EOF

# Create README
print_step "Creating README"
cat > README.md << 'EOF'
# ImageHorse 🐴

A powerful, modern image editor built with Bun, Next.js, and TanStack libraries.

## Features

- ✨ Multiple image upload with drag & drop
- 🎨 Advanced editing tools (crop, blur, paint, text)
- 📊 Bulk operations for multiple images
- 🚀 Built with modern technologies (Bun, TanStack)
- 🎯 TypeScript for type safety
- 🎨 Beautiful UI with Tailwind CSS and Radix UI

## Tech Stack

- **Runtime**: Bun
- **Framework**: Next.js 15
- **State Management**: TanStack Query
- **Routing**: TanStack Router
- **UI**: Tailwind CSS + Radix UI
- **Styling**: CSS-in-JS with Tailwind
- **Language**: TypeScript

## Getting Started

1. **Install dependencies:**
   ```bash
   bun install
   ```

2. **Run the development server:**
   ```bash
   bun dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Development

- `bun dev` - Start development server
- `bun build` - Build for production
- `bun start` - Start production server
- `bun lint` - Run ESLint
- `bun type-check` - Run TypeScript checker

## Project Structure

```
imagehorse-tanstack/
├── app/                 # Next.js App Router
├── components/          # Reusable UI components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── styles/             # Global styles
├── types/              # TypeScript type definitions
└── public/             # Static assets
```

## Performance

Built with Bun for lightning-fast:
- ⚡ Package installation
- 🚄 Development server startup
- 📦 Bundle optimization
- 🔄 Hot reload

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see the [LICENSE](LICENSE) file for details.
EOF

# Install dependencies
print_step "Installing all dependencies"
bun install

# Build the project to check for errors
print_step "Building project to verify setup"
bun run build

print_success "🎉 ImageHorse project created successfully!"
print_success "📁 Project location: $(pwd)"
print_success "🚀 To start development:"
echo -e "   ${BLUE}cd $PROJECT_NAME${NC}"
echo -e "   ${BLUE}bun dev${NC}"
print_success "🌐 Then open http://localhost:3000"

echo ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "1. Add more UI components (slider, select, dialog)"
echo "2. Implement image editing tools (crop, blur, paint)"
echo "3. Add bulk operations"
echo "4. Integrate TanStack Router for navigation"
echo "5. Add image compression and export features"
EOF