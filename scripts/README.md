# Project Scripts

This directory contains utility scripts for development, testing, and deployment of the Ijs Agroallied e-commerce platform.

## Quick Start

### Development

**Start both frontend and backend:**
```bash
# Linux/Mac
./scripts/dev-all.sh

# Windows PowerShell
.\scripts\dev-all.ps1

# Or use npm script from root
npm run dev:all
```

**Start individually:**
```bash
# Frontend only (Next.js on port 3000)
npm run dev:frontend

# Backend only (PHP API on port 8000)
npm run dev:backend
```

### Building

**Build frontend for production:**
```bash
npm run build:frontend
```

### Testing

**Run all tests:**
```bash
npm test
```

**Test individually:**
```bash
# Frontend tests
npm run test:frontend

# Backend API tests
npm run test:backend
```

## Available Scripts

### Development Scripts

#### dev-all.sh / dev-all.ps1
Starts both frontend and backend development servers concurrently.

**Features:**
- Starts Next.js dev server on port 3000
- Starts PHP API server on port 8000
- Graceful shutdown with CTRL+C
- Color-coded output

**Usage:**
```bash
# Linux/Mac
./scripts/dev-all.sh

# Windows
.\scripts\dev-all.ps1
```

**Requirements:**
- Node.js and npm installed
- PHP installed
- All dependencies installed (`npm run install:all`)

### Deployment Scripts

#### deploy-frontend.sh
Builds and prepares the frontend for deployment.

**Features:**
- Installs production dependencies
- Runs linting checks
- Builds Next.js application
- Reports build size
- Provides deployment checklist

**Usage:**
```bash
./scripts/deploy-frontend.sh [environment]

# Examples
./scripts/deploy-frontend.sh production
./scripts/deploy-frontend.sh staging
```

**What it does:**
1. Installs dependencies with `npm ci`
2. Runs ESLint
3. Builds Next.js app
4. Reports build statistics
5. Provides next steps

#### deploy-backend.sh
Prepares and validates the backend API for deployment.

**Features:**
- Validates PHP installation
- Checks API structure
- Runs API tests
- Creates database backup
- Provides deployment checklist

**Usage:**
```bash
./scripts/deploy-backend.sh [environment]

# Examples
./scripts/deploy-backend.sh production
./scripts/deploy-backend.sh staging
```

**What it does:**
1. Checks PHP and MySQL installation
2. Validates API directory structure
3. Runs API endpoint tests
4. Creates database backup
5. Provides deployment instructions

## NPM Scripts Reference

All scripts can be run from the project root using npm:

### Development
- `npm run dev` - Start frontend dev server (default)
- `npm run dev:frontend` - Start frontend dev server
- `npm run dev:backend` - Start backend API server
- `npm run dev:all` - Start both servers concurrently

### Building
- `npm run build` - Build frontend (default)
- `npm run build:frontend` - Build Next.js application

### Starting Production
- `npm run start` - Start frontend production server (default)
- `npm run start:frontend` - Start Next.js production server

### Testing
- `npm test` - Run all tests
- `npm run test:frontend` - Run frontend tests
- `npm run test:backend` - Run backend API tests

### Linting
- `npm run lint` - Lint frontend code (default)
- `npm run lint:frontend` - Lint Next.js application

### Database Management
- `npm run db:import` - Import database schema
- `npm run db:backup` - Backup database
- `npm run db:restore` - Restore database from backup

### Maintenance
- `npm run clean` - Clean all build artifacts and node_modules
- `npm run clean:frontend` - Clean frontend build artifacts
- `npm run clean:backend` - Clean backend artifacts
- `npm run install:all` - Install dependencies for all workspaces

## Project Structure

The scripts work with the following project structure:

```
project-root/
├── frontend/              # Next.js application
│   ├── app/              # Next.js app router
│   ├── components/       # React components
│   ├── public/           # Static assets
│   └── package.json      # Frontend dependencies
├── backend/              # PHP API
│   ├── api/             # API endpoints
│   ├── database/        # Database schemas
│   ├── scripts/         # Backend-specific scripts
│   └── package.json     # Backend scripts
├── scripts/             # Project-wide scripts (this directory)
│   ├── dev-all.sh       # Concurrent dev script (Linux/Mac)
│   ├── dev-all.ps1      # Concurrent dev script (Windows)
│   ├── deploy-frontend.sh
│   ├── deploy-backend.sh
│   └── README.md        # This file
└── package.json         # Root workspace configuration
```

## Setup Instructions

### First Time Setup

1. **Install dependencies:**
   ```bash
   npm run install:all
   ```

2. **Make scripts executable (Linux/Mac):**
   ```bash
   chmod +x scripts/*.sh
   chmod +x backend/scripts/*.sh
   ```

3. **Configure database:**
   ```bash
   # Import database schema
   npm run db:import
   ```

4. **Start development:**
   ```bash
   npm run dev:all
   ```

### Environment Configuration

#### Frontend (.env.local)
Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

#### Backend (config/database.php)
Update `backend/api/config/database.php` with your database credentials.

## Platform-Specific Notes

### Linux/Mac
- Use `.sh` scripts
- Make scripts executable: `chmod +x scripts/*.sh`
- Scripts use bash shell

### Windows
- Use `.ps1` PowerShell scripts
- May need to enable script execution: `Set-ExecutionPolicy RemoteSigned`
- Or use Git Bash to run `.sh` scripts

### Cross-Platform
- All npm scripts work on all platforms
- Use npm scripts for maximum compatibility
- Scripts handle path separators automatically

## Troubleshooting

### Scripts Won't Execute (Linux/Mac)
```bash
# Make scripts executable
chmod +x scripts/*.sh
chmod +x backend/scripts/*.sh
```

### PowerShell Script Blocked (Windows)
```powershell
# Allow script execution
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Port Already in Use
```bash
# Frontend (port 3000)
# Kill process using port 3000
lsof -ti:3000 | xargs kill -9  # Mac/Linux
netstat -ano | findstr :3000   # Windows (find PID, then kill)

# Backend (port 8000)
lsof -ti:8000 | xargs kill -9  # Mac/Linux
netstat -ano | findstr :8000   # Windows
```

### Dependencies Not Found
```bash
# Reinstall all dependencies
npm run clean
npm run install:all
```

### Database Connection Failed
1. Check MySQL is running
2. Verify credentials in `backend/api/config/database.php`
3. Import schema: `npm run db:import`

### Build Failures
```bash
# Clean and rebuild
npm run clean:frontend
cd frontend && npm install && npm run build
```

## CI/CD Integration

These scripts can be integrated into CI/CD pipelines:

### GitHub Actions Example
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: ./scripts/deploy-frontend.sh production
      
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: ./scripts/deploy-backend.sh production
```

## Adding New Scripts

When creating new scripts:

1. **Add shebang:** `#!/bin/bash`
2. **Add description:** Comment block at top
3. **Make executable:** `chmod +x script.sh`
4. **Use colors:** For better readability
5. **Add error handling:** Check exit codes
6. **Document usage:** Include examples
7. **Update this README:** Document the new script

## Support

For issues with scripts:
1. Check script permissions
2. Verify dependencies are installed
3. Check environment configuration
4. Review error messages
5. Consult main project README

## Related Documentation

- [Backend Scripts](../backend/scripts/README.md) - Backend-specific utilities
- [Frontend README](../frontend/README.md) - Frontend documentation
- [Backend README](../backend/README.md) - Backend documentation
- [Main README](../README.md) - Project overview
