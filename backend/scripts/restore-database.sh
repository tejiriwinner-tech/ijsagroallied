#!/bin/bash
#
# Database Restore Script for Ijs Agroallied API
# 
# Usage: ./restore-database.sh <backup_file>
#

# Configuration
DB_NAME="ijs_agroallied"
DB_USER="root"
DB_PASS=""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if backup file is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: No backup file specified${NC}"
    echo "Usage: ./restore-database.sh <backup_file>"
    echo "Example: ./restore-database.sh ../backups/ijs_db_backup_20260115_120000.sql.gz"
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}Error: Backup file not found: $BACKUP_FILE${NC}"
    exit 1
fi

echo -e "${YELLOW}WARNING: This will replace all data in the '$DB_NAME' database!${NC}"
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo -e "${YELLOW}Restore cancelled.${NC}"
    exit 0
fi

echo -e "${YELLOW}Starting database restore...${NC}"

# Check if file is compressed
if [[ "$BACKUP_FILE" == *.gz ]]; then
    echo "Decompressing backup file..."
    if [ -z "$DB_PASS" ]; then
        gunzip < "$BACKUP_FILE" | mysql -u "$DB_USER" "$DB_NAME" 2>&1
    else
        gunzip < "$BACKUP_FILE" | mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" 2>&1
    fi
else
    if [ -z "$DB_PASS" ]; then
        mysql -u "$DB_USER" "$DB_NAME" < "$BACKUP_FILE" 2>&1
    else
        mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$BACKUP_FILE" 2>&1
    fi
fi

# Check if restore was successful
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database restored successfully${NC}"
    echo -e "  Database: $DB_NAME"
    echo -e "  From: $BACKUP_FILE"
else
    echo -e "${RED}✗ Restore failed!${NC}"
    exit 1
fi

exit 0
