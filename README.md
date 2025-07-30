# ImageHorse - TanStack Start Edition 🐎

A powerful image editing and compression tool built with [TanStack Start](https://tanstack.com/start) and supercharged by [Bun](https://bun.sh) — no Next.js, no nonsense.

## ✨ Features

- 🖼️ **Multiple image upload** with drag & drop, paste, and file browser
- 📦 **Smart compression** using web workers for smooth performance
- 🎨 **Advanced editing tools** – crop, paint, blur, add text
- 📊 **Bulk operations** – apply actions across multiple images
- 🎨 **Modern UI** – responsive with light, dark, and system theme support
- ⚡ **Lightning-fast dev experience** thanks to Bun
- 🧠 **Memory-efficient** – cleanups and previews done right
- 🌈 **AI Editor** interface (coming soon!)

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

- React Image Cropper
- Canvas overlay for painting & blur
- Zustand + Context for hybrid state management
- Zoom, Flip, Rotate, and upcoming text tools

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
- **Tailwind CSS** – Utility-based styling
- **Radix UI** – Accessible, unstyled component primitives
- **Bun** – Fast runtime, bundler, and package manager

## 📦 Status

✅ **Stable & Working**

- Upload & image preview
- Image resize + compression
- Full editing toolbars (Crop, Blur, Paint)
- Zustand state, theme system, and routing

🧪 **In Progress**

- Toolbar refinements
- History + undo/redo stack
- Better keyboard controls

🔮 **Coming Soon**

- AI-assisted editing tools
- Bulk crop preview & sync
- Cloud storage & export options

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/awesome-tool`
3. Install deps: `bun install`
4. Run `bun run dev` and code away
5. Test & push: `bun run lint && git push`
6. Open a pull request

## 📄 License

MIT License

---

_Powered by **Bun** + **TanStack**. No Next.js. No regrets._

**⭐ Star this repo if ImageHorse saved you time!**
