#!/bin/bash

echo "🔧 Fixing package.json - removing invalid shadui dependency"

# Create corrected package.json without shadui
cat > package.json << 'EOF'
{
  "name": "imagehorse",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  },
  "dependencies": {
    "@radix-ui/react-slot": "^1.1.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.263.1",
    "next": "15.0.3",
    "next-themes": "^0.4.4",
    "react": "19.0.0-rc-66855b96-20241106",
    "react-dom": "19.0.0-rc-66855b96-20241106",
    "tailwind-merge": "^2.5.5",
    "tailwindcss-animate": "^1.0.7"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^19.1.8",
    "@types/react-dom": "^19.1.6",
    "@typescript-eslint/eslint-plugin": "^8.15.0",
    "@typescript-eslint/parser": "^8.15.0",
    "autoprefixer": "^10.4.20",
    "eslint": "^8.57.1",
    "eslint-config-next": "15.0.3",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-prettier": "^5.2.1",
    "postcss": "^8.4.49",
    "prettier": "^3.3.3",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.8.3"
  }
}
EOF

echo "✅ Fixed package.json - removed invalid 'shadui' dependency"
echo ""
echo "📦 Now run:"
echo "1. bun install"
echo "2. bun run dev"
echo ""
echo "Note: shadcn/ui components are already created in components/ui/ directory"
echo "They don't need to be installed as a package."
EOF