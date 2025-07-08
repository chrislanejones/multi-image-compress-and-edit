# ImageHorse - TanStack Start Edition 🐎

A powerful image editing and compression tool built with TanStack Start and supercharged by Bun.

## ✨ Features

- 🖼️ **Multiple image upload** with drag & drop, paste, and file browser
- 📦 **Smart compression** with web worker support for non-blocking processing
- 🎨 **Advanced editing tools** - crop, paint, blur, text overlay
- 📊 **Bulk operations** for processing multiple images at once
- 🎯 **Modern responsive UI** with dark/light/system theme support
- ⚡ **Lightning-fast performance** optimized with Bun runtime
- 💾 **Memory-efficient** with proper cleanup and thumbnail generation
- 🌈 **Premium AI Editor** interface (coming soon)

## 🚀 Quick Start

### Prerequisites

Make sure you have [Bun](https://bun.sh) installed:

\`\`\`bash
curl -fsSL https://bun.sh/install | bash
\`\`\`

### Installation

\`\`\`bash
# Clone the repository
git clone https://github.com/chrislanejones/multi-image-compress-and-edit.git
cd multi-image-compress-and-edit

# Install dependencies with Bun (ultra-fast!)
bun install

# Start development server
bun run dev
\`\`\`

## 📋 Available Scripts

\`\`\`bash
bun run dev      # Start development server with hot reload
bun run build    # Build optimized production bundle
bun run start    # Start production server (after build)
bun run lint     # Run ESLint checks
bun run clean    # Clean all build artifacts
bun run fresh    # Clean install (removes node_modules and reinstalls)
\`\`\`

## 🏗️ Project Structure

\`\`\`
imagehorse/
├── app/                    # Main application directory
│   ├── components/         # Reusable UI components
│   │   ├── ui/             # Base UI components (Button, Card, etc.)
│   │   └── toolbars/       # Toolbar components
│   ├── constants/          # App-wide constants
│   ├── context/            # React context providers
│   ├── hooks/              # Custom React hooks
│   ├── routes/             # TanStack Router pages
│   ├── store/              # Zustand global state stores
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Image processing utilities
├── public/                 # Static assets
└── bunfig.toml             # Bun configuration
\`\`\`

## 🎨 Key Components

### Image Processing Pipeline

- **PhotoUpload** (`/`) - Multi-format upload with initial compression.
- **Gallery & Resizer** (`/resize-and-optimize`) - Main gallery with smart thumbnails and the optimization sidebar.
- **Edit Mode** (`/resize-and-optimize/edit-image`) - Focused editing interface.

### Performance Features

- **Web Worker Compression** - Non-blocking image processing.
- **Smart Thumbnails** - Fast preview generation.
- **Memory Management** - Automatic cleanup of blob URLs.
- **Centralized State** - Zustand and React Context for efficient state updates.

## 🔥 Why Bun?

ImageHorse leverages Bun for superior performance:

- 🚀 **3x faster** package installs compared to npm
- ⚡ **Hot reload** that feels instant (< 50ms)
- 🔧 **Built-in bundler** optimized for modern JavaScript
- 💾 **Lower memory usage** during development
- 🎯 **Native TypeScript** support out of the box

## 🛠️ Development

### Adding New Features

1. **UI Components**: Extend base components in `app/components/ui/`
2. **Image Processing**: Add utilities in `app/utils/image-processing.ts`
3. **Routes**: Add new pages in `app/routes/` following TanStack Router conventions.

### Code Quality

\`\`\`bash
# Run linting
bun run lint

# Type checking
bun run type-check
\`\`\`

## 🎯 Architecture

- **TanStack Start** - Full-stack React framework with file-based routing
- **TanStack Router** - Type-safe routing with search params
- **Zustand & Context API** - Hybrid global state management
- **TypeScript** - Full type safety across the application
- **Tailwind CSS** - Utility-first styling with design system
- **Radix UI** - Accessible component primitives
- **Bun** - JavaScript runtime and package manager

## 📈 Migration Status

✅ **Completed**

- Core structure and type-safe routing
- Image upload and gallery view
- Centralized state management (Zustand/Context)
- Bun optimization and configuration
- Theme system (light/dark)
- Resize & Optimize sidebar integration

🚧 **In Progress**

- Individual editing tools refinement (Crop, Blur, etc.)
- Advanced image processing features

🔮 **Planned**

- Bulk editing features
- AI-powered image enhancement
- Cloud storage integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: \`git checkout -b feature/amazing-feature\`
3. Install dependencies: \`bun install\`
4. Make your changes
5. Test with: \`bun run lint\` and \`bun run build\`
6. Commit: \`git commit -m 'Add amazing feature'\`
7. Push: \`git push origin feature/amazing-feature\`
8. Submit a pull request

## 📄 License

MIT License

---

_Powered by Bun 🔥 - The fast all-in-one JavaScript runtime_

**⭐ Star this repo if ImageHorse helped you process images faster!**
