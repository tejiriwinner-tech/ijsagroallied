#!/bin/bash
#
# Database Backup Script for Ijs Agroallied API
# 
# Usage: ./backup-database.sh [backup_directory]
#

# Configuration
DB_NAME="ijs_agroallied"
DB_USER="root"
DB_PASS=""
BACKUP_DIR="${1:-../backups}"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/ijs_db_backup_$DATE.sql"
RETENTION_DAYS=7

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo -e "${YELLOW}Starting database backup...${NC}"

# Perform backup
if [ -z "$DB_PASS" ]; then
    mysqldump -u "$DB_USER" "$DB_NAME" > "$BACKUP_FILE" 2>&1
else
    mysqldump -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" > "$BACKUP_FILE" 2>&1
fi

# Check if backup was successful
if [ $? -eq 0 ]; then
    # Compress the backup
    gzip "$BACKUP_FILE"
    BACKUP_FILE="$BACKUP_FILE.gz"
    
    # Get file size
    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    
    echo -e "${GREEN}✓ Backup completed successfully${NC}"
    echo -e "  File: $BACKUP_FILE"
    echo -e "  Size: $SIZE"
    
    # Clean up old backups
    echo -e "${YELLOW}Cleaning up old backups (older than $RETENTION_DAYS days)...${NC}"
    find "$BACKUP_DIR" -name "ijs_db_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
    
    REMAINING=$(find "$BACKUP_DIR" -name "ijs_db_backup_*.sql.gz" | wc -l)
    echo -e "${GREEN}✓ Cleanup complete. $REMAINING backup(s) remaining.${NC}"
else
    echo -e "${RED}✗ Backup failed!${NC}"
    rm -f "$BACKUP_FILE"
    exit 1
fi

exit 0
