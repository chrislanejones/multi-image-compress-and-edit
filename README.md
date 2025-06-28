# ImageHorse - TanStack Start Edition 🐎

A powerful image editing and compression tool built with TanStack Start and supercharged by Bun.

## Features

- 🖼️ Multiple image upload support
- ✂️ Advanced cropping tools
- 🎨 Paint and drawing tools
- 📝 Text overlay functionality
- 🌫️ Blur effects
- 📦 Bulk editing capabilities
- 💾 Image compression and optimization
- 🎯 Modern responsive UI
- ⚡ Lightning-fast development with Bun

## Getting Started

### Prerequisites

Make sure you have [Bun](https://bun.sh) installed:

```bash
curl -fsSL https://bun.sh/install | bash
```

### Installation

```bash
# Install dependencies with Bun (ultra-fast!)
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Start production server
bun run start
```

### Bun Commands

```bash
bun run dev      # Start development server with hot reload
bun run build    # Build optimized production bundle
bun run start    # Start production server
bun run lint     # Run ESLint checks
bun run clean    # Clean all build artifacts
bun run fresh    # Clean install (removes node_modules and reinstalls)
```

### Development

The app uses TanStack Start for routing and React for the UI, powered by Bun's ultra-fast runtime. Key directories:

- `app/` - Main application directory (pages, components, utils, types)
  - `app/components/` - Reusable UI components
  - `app/lib/` - Utility functions
  - `app/types/` - TypeScript type definitions
  - `app/context/` - React context providers
- `public/` - Static assets
- `bunfig.toml` - Bun configuration

### Key Components

- **ImageContext** - Global state management for images
- **ImageEditor** - Main editing interface
- **BulkImageEditor** - Bulk operations
- **Tools** - Individual editing tools (crop, paint, text, blur)

## Architecture

This app follows a modern React architecture with:

- TanStack Start for full-stack React framework
- Bun for ultra-fast package management and runtime
- Context API for state management
- TypeScript for type safety
- Tailwind CSS for styling
- Radix UI for accessible components

## Why Bun?

- 🚀 **3x faster** package installs
- ⚡ **Hot reload** that actually feels instant
- 🔧 **Built-in bundler** optimized for modern JS
- 💾 **Lower memory usage** during development
- 🎯 **Native TypeScript** support out of the box

## Migration Status

✅ Basic structure and routing
✅ Image upload and gallery
✅ Context-based state management
✅ Bun optimization and configuration
🚧 Individual editing tools (in progress)
🚧 Bulk editing features (planned)
🚧 Advanced image processing (planned)

## Performance

With Bun, you can expect:
- Package installs: `~2-5 seconds` (vs 30-60s with npm)
- Dev server startup: `~500ms` (vs 3-5s)
- Hot reload: `~50ms` (vs 500ms+)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `bun run lint` and `bun run build`
5. Submit a pull request

## Troubleshooting

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
# Clear all caches
bun run clean

# Reinstall dependencies
bun install --force
```

## License

MIT License - see LICENSE file for details

---

*Powered by Bun 🔥 - The fast all-in-one JavaScript runtime*
