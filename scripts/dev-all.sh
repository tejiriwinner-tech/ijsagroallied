#!/bin/bash
#
# Concurrent Development Script
# 
# Starts both frontend and backend development servers concurrently
# 
# Usage: ./dev-all.sh
#

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  Starting Development Servers${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down servers...${NC}"
    kill 0
    exit 0
}

# Trap CTRL+C and cleanup
trap cleanup SIGINT SIGTERM

# Start backend server
echo -e "${BLUE}Starting backend server on http://localhost:8000${NC}"
cd backend && npm run serve &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start frontend server
echo -e "${BLUE}Starting frontend server on http://localhost:3000${NC}"
cd frontend && npm run dev &
FRONTEND_PID=$!

echo ""
echo -e "${GREEN}✓ Both servers started successfully!${NC}"
echo ""
echo -e "${YELLOW}Frontend:${NC} http://localhost:3000"
echo -e "${YELLOW}Backend:${NC}  http://localhost:8000"
echo ""
echo -e "${YELLOW}Press CTRL+C to stop both servers${NC}"
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
