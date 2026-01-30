#!/bin/bash
#
# Backend Deployment Script
# 
# Prepares and deploys the backend API
# 
# Usage: ./deploy-backend.sh [environment]
#

# Configuration
ENVIRONMENT="${1:-production}"
API_DIR="backend/api"
DB_DIR="backend/database"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  Backend Deployment${NC}"
echo -e "${YELLOW}========================================${NC}"
echo -e "Environment: ${BLUE}$ENVIRONMENT${NC}"
echo ""

# Check if API directory exists
if [ ! -d "$API_DIR" ]; then
    echo -e "${RED}✗ API directory not found: $API_DIR${NC}"
    exit 1
fi

# Check PHP installation
echo -e "${BLUE}Checking PHP installation...${NC}"
if ! command -v php &> /dev/null; then
    echo -e "${RED}✗ PHP is not installed!${NC}"
    exit 1
fi
PHP_VERSION=$(php -v | head -n 1)
echo -e "${GREEN}✓ $PHP_VERSION${NC}"
echo ""

# Check MySQL installation
echo -e "${BLUE}Checking MySQL installation...${NC}"
if ! command -v mysql &> /dev/null; then
    echo -e "${YELLOW}⚠ MySQL client not found (may not be needed for deployment)${NC}"
else
    MYSQL_VERSION=$(mysql --version)
    echo -e "${GREEN}✓ $MYSQL_VERSION${NC}"
fi
echo ""

# Validate API structure
echo -e "${BLUE}Validating API structure...${NC}"
REQUIRED_DIRS=("products" "categories" "chicks" "bookings" "auth" "orders" "users")
MISSING_DIRS=()

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ ! -d "$API_DIR/$dir" ]; then
        MISSING_DIRS+=("$dir")
    fi
done

if [ ${#MISSING_DIRS[@]} -gt 0 ]; then
    echo -e "${YELLOW}⚠ Missing API directories: ${MISSING_DIRS[*]}${NC}"
else
    echo -e "${GREEN}✓ All API directories present${NC}"
fi
echo ""

# Check database schema
echo -e "${BLUE}Checking database schema...${NC}"
if [ -f "$DB_DIR/schema.sql" ]; then
    echo -e "${GREEN}✓ Database schema found${NC}"
    SCHEMA_SIZE=$(wc -l < "$DB_DIR/schema.sql")
    echo -e "  Schema lines: ${BLUE}$SCHEMA_SIZE${NC}"
else
    echo -e "${YELLOW}⚠ Database schema not found${NC}"
fi
echo ""

# Run API tests
echo -e "${BLUE}Running API tests...${NC}"
cd backend || exit 1
if [ -f "scripts/test-api.sh" ]; then
    bash scripts/test-api.sh http://localhost:8000
    if [ $? -ne 0 ]; then
        echo -e "${YELLOW}⚠ Some API tests failed${NC}"
        echo -e "${YELLOW}  Review test results before deploying${NC}"
    fi
else
    echo -e "${YELLOW}⚠ API test script not found${NC}"
fi
cd ..
echo ""

# Create backup before deployment
echo -e "${BLUE}Creating database backup...${NC}"
if [ -f "backend/scripts/backup-database.sh" ]; then
    bash backend/scripts/backup-database.sh
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Backup created${NC}"
    else
        echo -e "${YELLOW}⚠ Backup failed (continuing anyway)${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Backup script not found${NC}"
fi
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Backend Ready for Deployment!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Next steps:"
echo -e "  1. Upload ${BLUE}backend/api/${NC} to your web server"
echo -e "  2. Upload ${BLUE}backend/database/${NC} for reference"
echo -e "  3. Configure web server (Apache/Nginx) to serve API"
echo -e "  4. Import database schema if needed"
echo -e "  5. Update API configuration with production credentials"
echo -e "  6. Test API endpoints at production URL"
echo ""
echo -e "Configuration files to update:"
echo -e "  - ${BLUE}backend/api/config/database.php${NC}"
echo -e "  - ${BLUE}backend/api/config/cors.php${NC}"
echo ""

exit 0
