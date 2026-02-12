#!/bin/bash

# DeadDrop - Docker Build & Test Script

set -e  # Exit on error

echo "🚀 DeadDrop - Docker Deployment Helper"
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    echo "Please install Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

echo -e "${GREEN}✅ Docker is installed${NC}"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo -e "${YELLOW}Please edit .env with your actual values${NC}"
    echo ""
fi

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo -e "${GREEN}✅ Environment variables loaded${NC}"
else
    echo -e "${RED}❌ Could not load .env file${NC}"
    exit 1
fi

echo ""
echo "🔨 Building Docker image..."
echo "========================================"
docker build -t deaddrop-frontend:latest .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Docker image built successfully${NC}"
else
    echo -e "${RED}❌ Docker build failed${NC}"
    exit 1
fi

echo ""
echo "🐳 Starting Docker container..."
echo "========================================"

# Stop any existing container
docker stop deaddrop-frontend 2>/dev/null || true
docker rm deaddrop-frontend 2>/dev/null || true

# Run the container
docker run -d \
  --name deaddrop-frontend \
  -p 8080:80 \
  -e VITE_GEMINI_API_KEY="$VITE_GEMINI_API_KEY" \
  -e VITE_DEAD_DROP_REGISTRY_ADDRESS="$VITE_DEAD_DROP_REGISTRY_ADDRESS" \
  -e VITE_DEAD_DROP_NFT_ADDRESS="$VITE_DEAD_DROP_NFT_ADDRESS" \
  -e VITE_SUPABASE_URL="$VITE_SUPABASE_URL" \
  -e VITE_SUPABASE_ANON_KEY="$VITE_SUPABASE_ANON_KEY" \
  deaddrop-frontend:latest

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Container started successfully${NC}"
    echo ""
    echo "=========================================="
    echo -e "${GREEN}🎉 DeadDrop is running!${NC}"
    echo "=========================================="
    echo ""
    echo "🌐 Visit: http://localhost:8080"
    echo ""
    echo "Useful commands:"
    echo "  • View logs:    docker logs -f deaddrop-frontend"
    echo "  • Stop server:  docker stop deaddrop-frontend"
    echo "  • Remove:       docker rm deaddrop-frontend"
    echo "  • Rebuild:      docker build -t deaddrop-frontend ."
    echo ""
else
    echo -e "${RED}❌ Failed to start container${NC}"
    exit 1
fi

