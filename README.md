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

### One-Command Setup

```bash
curl -fsSL https://raw.githubusercontent.com/your-repo/imagehorse/main/setup.sh | bash
```

Or manual setup:

### Prerequisites

Make sure you have [Bun](https://bun.sh) installed:

```bash
curl -fsSL https://bun.sh/install | bash
```

### Installation

```bash
# Clone the repository
git clone https://github.com/your-repo/imagehorse.git
cd imagehorse

# Install dependencies with Bun (ultra-fast!)
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Start production server
bun run start
```

## 📋 Available Scripts

```bash
bun run dev      # Start development server with hot reload
bun run build    # Build optimized production bundle
bun run start    # Start production server
bun run lint     # Run ESLint checks
bun run clean    # Clean all build artifacts
bun run fresh    # Clean install (removes node_modules and reinstalls)
```

## 🏗️ Project Structure

```
imagehorse/
├── app/                    # Main application directory
│   ├── components/         # Reusable UI components
│   │   ├── ui/            # Base UI components (Button, Card, etc.)
│   │   ├── tools/         # Image editing tools
│   │   └── editor/        # Main editor components
│   ├── context/           # React context providers
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions
│   ├── routes/            # TanStack Router pages
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Image processing utilities
│   └── globals.css        # Global styles
├── public/                # Static assets
├── backup/                # Legacy component backups
└── bunfig.toml           # Bun configuration
```

## 🎨 Key Components

### Image Processing Pipeline

- **PhotoUpload** - Multi-format upload with compression
- **ResizeAndOptimize** - Main gallery with smart thumbnails
- **ImageEditor** - Advanced editing interface
- **BulkImageEditor** - Batch operations (planned)

### Editing Tools

- **CroppingTool** - Precise image cropping
- **BlurTool** - Selective blur effects
- **PaintTool** - Drawing and annotations
- **TextTool** - Text overlays and typography

### Performance Features

- **Web Worker Compression** - Non-blocking image processing
- **Smart Thumbnails** - Fast preview generation
- **Memory Management** - Automatic cleanup of blob URLs
- **Optimized Rendering** - React.memo and memoized calculations

## 🔥 Why Bun?

ImageHorse leverages Bun for superior performance:

- 🚀 **3x faster** package installs compared to npm
- ⚡ **Hot reload** that feels instant (< 50ms)
- 🔧 **Built-in bundler** optimized for modern JavaScript
- 💾 **Lower memory usage** during development
- 🎯 **Native TypeScript** support out of the box

## 📊 Performance Benchmarks

With Bun, you can expect:

- Package installs: `~2-5 seconds` (vs 30-60s with npm)
- Dev server startup: `~500ms` (vs 3-5s with traditional tools)
- Hot reload: `~50ms` (vs 500ms+ with webpack)
- Build time: `~2-3 seconds` for full production build

## 🛠️ Development

### Adding New Features

1. **Image Tools**: Add new tools in `app/components/tools/`
2. **UI Components**: Extend base components in `app/components/ui/`
3. **Image Processing**: Add utilities in `app/utils/image-processing.ts`
4. **Routes**: Add new pages in `app/routes/`

### Code Quality

```bash
# Run linting
bun run lint

# Format code (if prettier is configured)
bun run format

# Type checking
bun run type-check
```

## 🎯 Architecture

ImageHorse follows a modern React architecture:

- **TanStack Start** - Full-stack React framework with file-based routing
- **TanStack Router** - Type-safe routing with search params
- **Context API** - Global state management for images
- **TypeScript** - Full type safety across the application
- **Tailwind CSS** - Utility-first styling with design system
- **Radix UI** - Accessible component primitives
- **Bun** - JavaScript runtime and package manager

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```env
# Optional: Analytics or tracking IDs
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id

# Optional: Feature flags
NEXT_PUBLIC_ENABLE_AI_EDITOR=false
```

### Customization

- **Themes**: Modify CSS variables in `app/globals.css`
- **Components**: Customize UI components in `app/components/ui/`
- **Image Processing**: Adjust compression settings in `utils/image-processing.ts`

## 📈 Migration Status

✅ **Completed**

- Basic structure and routing
- Image upload and gallery
- Context-based state management
- Bun optimization and configuration
- Theme system (light/dark/system)
- Smart compression with web workers

🚧 **In Progress**

- Individual editing tools refinement
- Advanced image processing features

🔮 **Planned**

- Bulk editing features
- AI-powered image enhancement
- Cloud storage integration
- Plugin system for custom tools

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Install dependencies: `bun install`
4. Make your changes
5. Test with: `bun run lint` and `bun run build`
6. Commit: `git commit -m 'Add amazing feature'`
7. Push: `git push origin feature/amazing-feature`
8. Submit a pull request

## 🐛 Troubleshooting

### Bun Issues

```bash
# Reset everything
bun run fresh

# Check Bun version
bun --version

# Update Bun
bun upgrade
```

### Development Issues

```bash
# Clear all caches and reinstall
bun run clean && bun install

# Force reinstall dependencies
rm -rf node_modules bun.lockb && bun install
```

### Common Problems

**Hot reload not working?**

```bash
# Restart dev server
bun run dev
```

**Build failing?**

```bash
# Check for TypeScript errors
bun run type-check

# Clean build and retry
bun run clean && bun run build
```

**Memory issues?**

```bash
# Check if running out of memory
bun --max-old-space-size=4096 run build
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- [Bun](https://bun.sh) - The fast all-in-one JavaScript runtime
- [TanStack](https://tanstack.com) - Powerful React tools
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework
- [Radix UI](https://radix-ui.com) - Accessible component primitives
- [Lucide](https://lucide.dev) - Beautiful icon library

---

_Powered by Bun 🔥 - The fast all-in-one JavaScript runtime_

**⭐ Star this repo if ImageHorse helped you process images faster!**
