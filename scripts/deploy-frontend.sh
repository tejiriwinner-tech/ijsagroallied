#!/bin/bash
#
# Frontend Deployment Script
# 
# Builds and prepares the frontend for deployment
# 
# Usage: ./deploy-frontend.sh [environment]
#

# Configuration
ENVIRONMENT="${1:-production}"
BUILD_DIR="frontend/.next"
OUT_DIR="frontend/out"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  Frontend Deployment${NC}"
echo -e "${YELLOW}========================================${NC}"
echo -e "Environment: ${BLUE}$ENVIRONMENT${NC}"
echo ""

# Navigate to frontend directory
cd frontend || exit 1

# Install dependencies
echo -e "${BLUE}Installing dependencies...${NC}"
npm ci
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Dependency installation failed!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Run linting
echo -e "${BLUE}Running linter...${NC}"
npm run lint
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠ Linting warnings detected${NC}"
fi
echo ""

# Build the application
echo -e "${BLUE}Building application...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Build failed!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Build completed successfully${NC}"
echo ""

# Get build size
if [ -d "../$BUILD_DIR" ]; then
    BUILD_SIZE=$(du -sh "../$BUILD_DIR" | cut -f1)
    echo -e "Build size: ${BLUE}$BUILD_SIZE${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Frontend Ready for Deployment!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Next steps:"
echo -e "  1. Test the build locally: ${BLUE}npm run start${NC}"
echo -e "  2. Deploy to your hosting platform"
echo -e "  3. Verify deployment at your production URL"
echo ""

exit 0
