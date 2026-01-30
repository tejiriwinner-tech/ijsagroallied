# Backend Utility Scripts

This directory contains utility scripts for managing the Ijs Agroallied backend API.

## Available Scripts

### backup-database.sh

Backs up the MySQL database with automatic compression and retention management.

**Usage:**
```bash
./backup-database.sh [backup_directory]
```

**Features:**
- Creates compressed SQL dumps
- Automatic timestamping
- Retention policy (keeps last 7 days by default)
- Color-coded output

**Example:**
```bash
# Backup to default directory (../backups)
./backup-database.sh

# Backup to custom directory
./backup-database.sh /var/backups/ijs-api
```

**Configuration:**
Edit the script to change:
- `DB_NAME` - Database name
- `DB_USER` - Database user
- `DB_PASS` - Database password
- `RETENTION_DAYS` - How many days to keep backups

### restore-database.sh

Restores the database from a backup file.

**Usage:**
```bash
./restore-database.sh <backup_file>
```

**Features:**
- Supports compressed (.gz) and uncompressed backups
- Safety confirmation prompt
- Automatic decompression

**Example:**
```bash
./restore-database.sh ../backups/ijs_db_backup_20260115_120000.sql.gz
```

**⚠️ Warning:** This will replace all data in the database!

### test-api.sh

Tests API endpoints to verify they're working correctly.

**Usage:**
```bash
./test-api.sh [base_url]
```

**Features:**
- Tests all major endpoints
- Color-coded pass/fail results
- Summary report
- Configurable base URL

**Example:**
```bash
# Test local development server
./test-api.sh http://localhost:8000

# Test production server
./test-api.sh https://api.ijsagroallied.com
```

**Tests Included:**
- Product listing and filtering
- Single product retrieval
- Category listing
- Chick batches
- Authentication (login)
- Error handling (404s, 401s)

### create-admin.php

Production-ready utility for creating and managing admin users.

**Usage:**
```bash
# Interactive mode
php scripts/create-admin.php

# Command-line mode - Create admin
php scripts/create-admin.php --email=admin@example.com --password=SecurePass123 --name="Admin User" --role=admin

# Command-line mode - Create regular user
php scripts/create-admin.php --email=user@example.com --password=UserPass123 --name="Regular User" --role=user

# Update existing user password
php scripts/create-admin.php --email=admin@example.com --password=NewPass123 --update
```

**Features:**
- Interactive prompts when no arguments provided
- Command-line mode for automation
- Password strength validation (min 8 chars, uppercase, lowercase, number)
- Email validation
- Update existing user passwords
- Support for both admin and regular user roles
- Color-coded output

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

**Example:**
```bash
# Create first admin user interactively
php scripts/create-admin.php

# Automated admin creation in deployment script
php scripts/create-admin.php --email=admin@ijs.com --password=Admin123! --name="System Admin" --role=admin

# Reset admin password
php scripts/create-admin.php --email=admin@ijs.com --password=NewSecurePass123 --update
```

### api-tester.php

Unified API testing utility for all backend endpoints.

**Usage:**
```bash
# Test all endpoints
php scripts/api-tester.php --all

# Test specific modules
php scripts/api-tester.php --module=auth
php scripts/api-tester.php --module=categories
php scripts/api-tester.php --module=subcategories
php scripts/api-tester.php --module=products

# Custom base URL
php scripts/api-tester.php --all --url=http://localhost:8080
```

**Features:**
- Automatic admin authentication
- Comprehensive endpoint coverage
- Color-coded pass/fail results
- Detailed test summary with pass rate
- Modular testing (test specific modules)
- Configurable base URL
- Exit codes for CI/CD integration

**Modules Tested:**
- **auth** - Login, invalid credentials, missing fields
- **categories** - List, create, update, delete, check products
- **subcategories** - Create, update, delete, validation
- **products** - List, filter by category

**Example:**
```bash
# Run all tests before deployment
php scripts/api-tester.php --all

# Test only authentication after auth changes
php scripts/api-tester.php --module=auth

# Test against staging server
php scripts/api-tester.php --all --url=https://staging.ijsagroallied.com
```

**CI/CD Integration:**
```bash
# In deployment script
php scripts/api-tester.php --all
if [ $? -ne 0 ]; then
    echo "API tests failed! Aborting deployment."
    exit 1
fi
```

### create-test-admin.php

**⚠️ For Testing Only** - Creates test admin user for automated testing.

**Usage:**
```bash
php scripts/create-test-admin.php
```

**Features:**
- Creates admin@test.com with password admin123
- Idempotent (safe to run multiple times)
- Used by integration tests

**Note:** This is for test environments only. For production admin creation, use `create-admin.php`.


## Setup

### Make Scripts Executable

```bash
chmod +x backup-database.sh
chmod +x restore-database.sh
chmod +x test-api.sh
```

### Windows Users

If you're on Windows, you can run these scripts using:
- Git Bash
- WSL (Windows Subsystem for Linux)
- Cygwin

Or create equivalent PowerShell scripts.

## Automation

### Automated Backups with Cron

Add to crontab for daily backups at 2 AM:

```bash
crontab -e
```

Add this line:
```
0 2 * * * /path/to/backend/scripts/backup-database.sh /var/backups/ijs-api
```

### Automated Testing

Run tests after deployment:

```bash
# In your deployment script
./backend/scripts/test-api.sh https://api.ijsagroallied.com
if [ $? -ne 0 ]; then
    echo "API tests failed! Rolling back..."
    # Rollback logic here
fi
```

## Troubleshooting

### Permission Denied

```bash
chmod +x *.sh
```

### MySQL Access Denied

Update the database credentials in the scripts:
```bash
DB_USER="your_username"
DB_PASS="your_password"
```

### curl Command Not Found

Install curl:
```bash
# Ubuntu/Debian
sudo apt install curl

# CentOS/RHEL
sudo yum install curl

# macOS
brew install curl
```

## Creating Custom Scripts

When creating new scripts:

1. **Add shebang:** `#!/bin/bash`
2. **Add description:** Comment block at the top
3. **Make executable:** `chmod +x script.sh`
4. **Use colors:** For better readability
5. **Add error handling:** Check exit codes
6. **Document usage:** Include usage examples

**Template:**
```bash
#!/bin/bash
#
# Script Name
# 
# Description of what the script does
# 
# Usage: ./script.sh [arguments]
#

# Configuration
VARIABLE="value"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

# Script logic here
echo -e "${GREEN}Success!${NC}"
```

## Additional Scripts (Future)

Planned utility scripts:
- `migrate-database.sh` - Run database migrations
- `seed-database.sh` - Populate with test data
- `check-health.sh` - Health check for API
- `deploy.sh` - Automated deployment
- `rollback.sh` - Rollback to previous version
- `clear-cache.sh` - Clear application cache
- `generate-docs.sh` - Generate API documentation

## Support

For issues with scripts:
1. Check script permissions
2. Verify database credentials
3. Check MySQL/curl installation
4. Review error messages
5. Consult main backend README
