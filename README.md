![Image Horse Banner](public/Image-Horse-App.webp)

# ImageHorse - TanStack Start Edition 🐎

![Image of Photo App](/public/multi-image-compress-and-edit-app.webp)

A powerful image editing and compression tool built with [TanStack Start](https://tanstack.com/start) and supercharged by [Bun](https://bun.sh) — no Next.js, no nonsense.

## ✨ Features

- 🖼️ **Multiple image upload** with drag & drop, paste, and file browser
- ⚡ **Auto Core Web Vitals compression** – aggressive optimization on image selection
- 🔄 **Reset Compression** – restore original quality with Zustand persistence
- 🟢 **Smart status indicators** – green ball shows "good" CWV performance
- 📦 **Advanced compression** with AVIF/WebP/JPEG codec selection
- 🎨 **Full editing suite** – crop, paint, blur, text, emoji, arrows
- 📊 **Bulk operations** – ZIP download with compressed images
- 🖥️ **Receipt-style terminal** – persistent output with auto-scroll
- 🎨 **Modern UI** – responsive with ShadCN/UI components and Twaakcn color system
- 🏈 **Jacksonville Jaguars theme** – OKLCH color space with teal, gold, and black palette
- ⚡ **Lightning-fast dev experience** thanks to Bun
- 🧠 **Memory-efficient** – cleanups and previews done right

## 🚀 Quick Start

### Prerequisites

Make sure you have [Bun](https://bun.sh) installed:

```bash
curl -fsSL https://bun.sh/install | bash
```

### Installation

```bash
# Clone the repo
git clone https://github.com/chrislanejones/multi-image-compress-and-edit.git
cd multi-image-compress-and-edit

# Install dependencies (blazing fast)
bun install

# Start dev server
bun run dev
```

## 📋 Available Scripts

```bash
bun run dev      # Start dev server with hot reload
bun run build    # Build for production
bun run start    # Serve built app
bun run lint     # Lint code
bun run clean    # Delete build artifacts
bun run fresh    # Clean install (deletes node_modules, reinstalls)
```

## 🏗️ Project Structure

```
imagehorse/
├── app/
│   ├── components/         # Reusable UI components
│   │   ├── ui/             # Base UI (Button, Card, etc.)
│   │   └── toolbars/       # Image editing toolbars
│   ├── constants/          # Constants for the app
│   ├── context/            # React Contexts
│   ├── hooks/              # Custom hooks
│   ├── routes/             # TanStack Router pages
│   ├── store/              # Zustand stores
│   ├── types/              # TypeScript definitions
│   └── utils/              # Utility functions
├── public/                 # Static assets
├── bunfig.toml             # Bun config
└── tailwind.config.js      # Tailwind config
```

## 🎨 Editing Pipeline

### Key Pages

- `/` – Upload images
- `/resize-and-optimize` – Gallery view + resize/compress sidebar
- `/resize-and-optimize/edit-image` – Full editing mode

### Tools & Features

- **Core Web Vitals Compression** - Automatic aggressive compression on image selection
- **Reset Compression** - Restore original images with Zustand persistence
- **React Image Cropper** - Precise crop tool with percentage/pixel units
- **Canvas overlay painting** - Brush, eraser, emoji, and arrow tools
- **Selective blur** - Paint-on blur effects with variable intensity
- **Text tool** - Add text with custom fonts, colors, and positioning
- **Bulk operations** - Download all images as compressed ZIP
- **Zustand + Context** - Hybrid state management with localStorage persistence
- **Receipt terminal** - Persistent processing output with auto-scroll

## 🔥 Why Bun + TanStack Start?

- ✅ No Next.js bloat
- ⚡ Instant dev startup
- 🧠 Fewer configs
- ✨ Everything’s TypeScript-first
- 🧹 Clean SSR-friendly routing & rendering
- 🚀 Bundled with modern JS and native performance

## 🛠️ Development Tips

### Add UI or Logic

- Add UI components → `app/components/ui/`
- Add image logic → `app/utils/image-processing.ts`
- Add new routes → `app/routes/` (TanStack file-based routing)

### Check Code Quality

```bash
bun run lint        # Lint checks
bun run type-check  # Type safety
```

## 🧱 Architecture

- **TanStack Start** – React app framework w/ routing
- **TanStack Router** – Search param + route-based layouting
- **Zustand + Context** – Hybrid state architecture
- **Tailwind CSS** – Utility-based styling with OKLCH color space
- **ShadCN/UI + Twaakcn** – Accessible components with Jacksonville Jaguars color palette
- **Radix UI** – Accessible, unstyled component primitives
- **Bun** – Fast runtime, bundler, and package manager

## 📦 Status

✅ **Stable & Working**

- Upload & image preview with receipt-style terminal
- **Automatic Core Web Vitals compression** on image selection
- **Reset Compression** functionality with Zustand persistence
- Image resize + advanced compression with codec selection
- Full editing toolbars (Crop, Blur, Paint, Text, Emoji, Arrows)
- **Bulk ZIP download** for all processed images
- Smart status indicators and CWV performance scoring
- Zustand state, theme system, and routing
- **ShadCN/UI + Twaakcn theming** with Jacksonville Jaguars color palette
- **OKLCH color space** for perceptually uniform colors across light/dark themes

#### Cache Settings

Users can control image caching through the settings:

- **Image Cache**: Toggle IndexedDB caching on/off
- **Offline Mode**: Keep images available when offline (requires cache)
- **Clear Cache**: Manual cache cleanup
- **Cache Stats**: View stored image count and size

🧪 **Recently Added**

- **Complete Twaakcn migration** with Jacksonville Jaguars color system
- **OKLCH color space** implementation for superior color accuracy
- **Fixed Core Web Vitals scoring** - images now start in "good" territory
- **Enhanced border visibility** with theme-appropriate contrast
- **Improved color consistency** across all components and themes
- Core Web Vitals compression with AVIF/WebP/JPEG support
- Persistent compression state with reset capability
- Enhanced terminal output with auto-scroll
- Bulk operations and ZIP export functionality

🔮 **Coming Soon**

- AI-assisted editing tools
- History + undo/redo stack for editing operations
- Enhanced keyboard shortcuts and controls
- Cloud storage & export options

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/awesome-tool`
3. Install deps: `bun install`
4. Run `bun run dev` and code away
5. Test & push: `bun run lint && git push`
6. Open a pull request

## 📄 License

Coming soon

---

_Powered by **Bun** + **TanStack**. No Next.js. No regrets._

**⭐ Star this repo if ImageHorse saved you time!**
