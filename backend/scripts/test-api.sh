#!/bin/bash
#
# API Testing Script for Ijs Agroallied API
# 
# Usage: ./test-api.sh [base_url]
#

# Configuration
BASE_URL="${1:-http://localhost:8000}"
API_URL="$BASE_URL/api"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local expected_status=$4
    local data=$5
    
    echo -e "${BLUE}Testing: $description${NC}"
    echo -e "  ${method} ${API_URL}${endpoint}"
    
    if [ "$method" == "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" -X GET "${API_URL}${endpoint}")
    elif [ "$method" == "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST "${API_URL}${endpoint}" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    # Extract status code (last line)
    status_code=$(echo "$response" | tail -n1)
    # Extract body (all but last line)
    body=$(echo "$response" | sed '$d')
    
    if [ "$status_code" == "$expected_status" ]; then
        echo -e "${GREEN}  ✓ PASS${NC} (Status: $status_code)"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}  ✗ FAIL${NC} (Expected: $expected_status, Got: $status_code)"
        echo -e "  Response: $body"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    echo ""
}

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  Ijs Agroallied API Test Suite${NC}"
echo -e "${YELLOW}========================================${NC}"
echo -e "Base URL: $BASE_URL"
echo ""

# Test Products Endpoints
echo -e "${YELLOW}--- Products Endpoints ---${NC}"
test_endpoint "GET" "/products/index.php" "Get all products" "200"
test_endpoint "GET" "/products/index.php?category=chicken-feeds" "Get products by category" "200"
test_endpoint "GET" "/products/single.php?id=chikun-starter" "Get single product" "200"
test_endpoint "GET" "/products/single.php?id=nonexistent" "Get non-existent product" "404"

# Test Categories Endpoints
echo -e "${YELLOW}--- Categories Endpoints ---${NC}"
test_endpoint "GET" "/categories/index.php" "Get all categories" "200"

# Test Chicks Endpoints
echo -e "${YELLOW}--- Day-Old Chicks Endpoints ---${NC}"
test_endpoint "GET" "/chicks/batches.php" "Get chick batches" "200"
test_endpoint "GET" "/bookings/index.php" "Get bookings" "200"

# Test Authentication Endpoints
echo -e "${YELLOW}--- Authentication Endpoints ---${NC}"
test_endpoint "POST" "/auth/login.php" "Login with valid credentials" "200" \
    '{"email":"admin@ijs.com","password":"admin123"}'
test_endpoint "POST" "/auth/login.php" "Login with invalid credentials" "401" \
    '{"email":"admin@ijs.com","password":"wrongpassword"}'

# Summary
echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  Test Summary${NC}"
echo -e "${YELLOW}========================================${NC}"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo -e "Total: $((TESTS_PASSED + TESTS_FAILED))"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed.${NC}"
    exit 1
fi
