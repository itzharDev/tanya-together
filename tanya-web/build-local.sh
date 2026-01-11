#!/bin/bash

# Build and test Docker image locally
# Usage: ./build-local.sh

set -e

# Configuration
IMAGE_NAME="tanya-web"
TAG="latest"
CONTAINER_NAME="tanya-web-test"
PORT=8080

echo "🔨 Building Docker image: ${IMAGE_NAME}:${TAG}"
docker build -t ${IMAGE_NAME}:${TAG} .

echo ""
echo "🧹 Cleaning up any existing container..."
docker rm -f ${CONTAINER_NAME} 2>/dev/null || true

echo ""
echo "🚀 Running container: ${CONTAINER_NAME}"
docker run -d \
  --name ${CONTAINER_NAME} \
  -p ${PORT}:80 \
  ${IMAGE_NAME}:${TAG}

echo ""
echo "✅ Container started successfully!"
echo "📍 Access the app at: http://localhost:${PORT}"
echo ""
echo "Useful commands:"
echo "  View logs:    docker logs -f ${CONTAINER_NAME}"
echo "  Stop:         docker stop ${CONTAINER_NAME}"
echo "  Remove:       docker rm -f ${CONTAINER_NAME}"
echo "  Shell access: docker exec -it ${CONTAINER_NAME} sh"
