#!/usr/bin/env bash
# Build script for Render deployment

set -e

echo "📦 Installing dependencies..."
npm ci

echo "🔧 Generating Prisma Client..."
npm run db:generate

echo "🗄️  Running database migrations..."
npm run db:migrate:deploy

echo "🏗️  Building TypeScript..."
npm run build

echo "✅ Build completed successfully!"
