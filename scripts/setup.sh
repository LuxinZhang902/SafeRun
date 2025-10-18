#!/bin/bash

# Initium Setup Script
# This script sets up the development environment

set -e

echo "🚀 Setting up Initium..."

# Check for required tools
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed. Aborting." >&2; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo "❌ pnpm is required but not installed. Run: npm install -g pnpm" >&2; exit 1; }

echo "✅ Node.js and pnpm found"

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js 20+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version check passed"

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit .env and add your API keys"
else
    echo "✅ .env file already exists"
fi

# Create web .env.local if it doesn't exist
if [ ! -f apps/web/.env.local ]; then
    echo "📝 Creating web .env.local file..."
    cp apps/web/.env.local.example apps/web/.env.local
else
    echo "✅ apps/web/.env.local file already exists"
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env and add your API keys:"
echo "   - ANTHROPIC_API_KEY"
echo "   - DAYTONA_BASE_URL"
echo ""
echo "2. Start the development servers:"
echo "   pnpm dev"
echo ""
echo "3. Open http://localhost:3001 in your browser"
echo ""
echo "4. Run tests:"
echo "   pnpm test"
echo ""
