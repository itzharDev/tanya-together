#!/bin/bash

# Exit on error
set -e

echo "🚀 Building Docker image for multiple platforms..."

# Ensure buildx is available
docker buildx version || {
    echo "❌ Docker buildx is not available. Please enable it."
    exit 1
}

# Create builder if it doesn't exist
if ! docker buildx ls | grep -q multiplatform; then
    echo "📦 Creating multiplatform builder..."
    docker buildx create --name multiplatform --use
fi

# Use the multiplatform builder
docker buildx use multiplatform

# Build and push for multiple platforms
echo "🔨 Building and pushing image..."
docker buildx build \
    --platform linux/amd64,linux/arm64 \
    -t itzhardev/tanya-together:latest \
    --push \
    .

echo "✅ Build complete!"
echo "📦 Image: itzhardev/tanya-together:latest"
echo "🌐 Platforms: linux/amd64, linux/arm64"
