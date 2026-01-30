# Package Structure Documentation

## Overview

This project follows a monorepo structure with separate package management for frontend and backend domains. This ensures clean dependency isolation and prevents conflicts between client-side and server-side code.

## Package Files

### Root Package.json (`/package.json`)

The root package.json serves as the monorepo orchestrator and contains:
- **Workspace configuration** for frontend and backend
- **Convenience scripts** to run frontend and backend commands from root
- **Shared development dependencies** (TypeScript, Jest, etc.)
- **No production dependencies** (all production deps are domain-specific)

**Key Scripts:**
```bash
npm run dev:frontend      # Start Next.js development server
npm run dev:backend       # Start PHP development server
npm run build:frontend    # Build frontend for production
npm run lint:frontend     # Run ESLint on frontend code
npm run test:frontend     # Run frontend tests
npm run test:backend      # Run backend API tests
```

### Frontend Package.json (`/frontend/package.json`)

Contains **only UI-related dependencies**:
- **Framework:** Next.js, React
- **UI Components:** Radix UI, shadcn/ui components
- **Styling:** Tailwind CSS, class-variance-authority
- **Forms:** React Hook Form, Zod validation
- **Charts:** Recharts
- **Date Handling:** date-fns, react-day-picker
- **Development Tools:** TypeScript, ESLint

**Key Scripts:**
```bash
cd frontend
npm run dev      # Start development server (localhost:3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

**Dependencies Validation:**
✅ All dependencies are frontend/UI-related
✅ No backend or server-side dependencies
✅ No database drivers or PHP-related packages

### Backend Composer.json (`/backend/composer.json`)

Contains **only server-related PHP dependencies**:
- **PHP Version:** >= 7.4
- **Required Extensions:**
  - `ext-pdo` - Database abstraction layer
  - `ext-pdo_mysql` - MySQL driver for PDO
  - `ext-json` - JSON encoding/decoding
  - `ext-mbstring` - Multibyte string handling
- **Development Dependencies:**
  - PHPUnit for testing

**Key Scripts:**
```bash
cd backend
composer install          # Install dependencies
composer serve           # Start PHP development server
composer test            # Run PHPUnit tests
composer db:import       # Import database schema
```

### Backend Package.json (`/backend/package.json`)

Contains **convenience scripts** for backend development:
- **Server Management:** Start PHP development server
- **Database Operations:** Import, backup, restore
- **Testing:** API endpoint testing

**Key Scripts:**
```bash
cd backend
npm run serve        # Start PHP server (localhost:8000)
npm run db:import    # Import database schema
npm run db:backup    # Backup database
npm run db:restore   # Restore database
npm run test:api     # Test API endpoints
```

**Note:** This file contains no dependencies - it's purely for script convenience.

## Dependency Isolation

### Frontend Dependencies (UI-Only)

| Package | Purpose | Category |
|---------|---------|----------|
| next | React framework | Framework |
| react, react-dom | UI library | Framework |
| @radix-ui/* | Accessible UI primitives | UI Components |
| tailwindcss | Utility-first CSS | Styling |
| react-hook-form | Form management | Forms |
| zod | Schema validation | Validation |
| recharts | Data visualization | Charts |
| date-fns | Date utilities | Utilities |

### Backend Dependencies (Server-Only)

| Package | Purpose | Category |
|---------|---------|----------|
| php >= 7.4 | Server runtime | Runtime |
| ext-pdo | Database abstraction | Database |
| ext-pdo_mysql | MySQL driver | Database |
| ext-json | JSON handling | Data |
| ext-mbstring | String handling | Utilities |
| phpunit/phpunit | Testing framework | Testing |

## Validation Checklist

### ✅ Requirements Met

- [x] **Requirement 1.5:** Package.json files consolidated to avoid dependency conflicts
- [x] **Requirement 2.6:** Frontend folder contains its own package.json with only frontend dependencies
- [x] **Requirement 2.6:** Backend folder contains its own package management files

### ✅ Design Properties

- [x] **Property 4: Dependency Isolation** - Each package.json contains only dependencies relevant to its domain
- [x] No conflicting versions across domains
- [x] Clear separation between client and server dependencies

## Installation Instructions

### First-Time Setup

1. **Install Root Dependencies:**
   ```bash
   npm install
   ```

2. **Install Frontend Dependencies:**
   ```bash
   cd frontend
   npm install
   ```

3. **Install Backend Dependencies:**
   ```bash
   cd backend
   composer install
   ```

### Development Workflow

**Option 1: Run from Root**
```bash
# Terminal 1 - Frontend
npm run dev:frontend

# Terminal 2 - Backend
npm run dev:backend
```

**Option 2: Run from Domain Directories**
```bash
# Terminal 1 - Frontend
cd frontend && npm run dev

# Terminal 2 - Backend
cd backend && composer serve
```

## Troubleshooting

### Issue: "Cannot find module" errors in frontend

**Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Issue: PHP extensions not found

**Solution:**
Check PHP extensions are enabled:
```bash
php -m | grep -E "pdo|json|mbstring"
```

If missing, install them:
```bash
# Ubuntu/Debian
sudo apt-get install php-pdo php-mysql php-json php-mbstring

# macOS (Homebrew)
brew install php
```

### Issue: Composer not found

**Solution:**
Install Composer:
```bash
# Download and install
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
```

## Migration Notes

### Changes from Previous Structure

1. **Root package.json updated:**
   - Changed from "project-structure-analyzer" to "ijsagroallied-monorepo"
   - Added workspace configuration
   - Added convenience scripts for both domains
   - Kept shared dev dependencies (TypeScript, Jest)

2. **Frontend package.json:**
   - Already existed with correct UI-only dependencies
   - No changes needed - already compliant

3. **Backend package management created:**
   - Added `composer.json` for PHP dependencies
   - Added `package.json` for convenience scripts
   - No dependencies in backend package.json (PHP uses Composer)

### Backward Compatibility

All existing scripts continue to work:
- `cd frontend && npm run dev` - Still works
- `cd backend && php -S localhost:8000 -t api` - Still works
- New convenience scripts added at root level

## Best Practices

### Adding New Dependencies

**Frontend Dependency:**
```bash
cd frontend
npm install <package-name>
```

**Backend Dependency:**
```bash
cd backend
composer require <package-name>
```

**Shared Dev Tool (Root):**
```bash
npm install -D <package-name>
```

### Dependency Guidelines

**Frontend (package.json):**
- ✅ React components and libraries
- ✅ CSS frameworks and styling tools
- ✅ Client-side utilities
- ✅ Build tools (Next.js, Webpack, etc.)
- ❌ Database drivers
- ❌ Server frameworks
- ❌ PHP packages

**Backend (composer.json):**
- ✅ PHP libraries and frameworks
- ✅ Database drivers
- ✅ Server utilities
- ✅ API tools
- ❌ React or UI libraries
- ❌ Frontend build tools
- ❌ Node.js packages

## Future Enhancements

### Potential Additions

1. **Backend Testing:**
   - Add PHPUnit configuration
   - Create test suite for API endpoints
   - Add code coverage reporting

2. **Frontend Testing:**
   - Add Jest configuration
   - Create component tests
   - Add E2E testing with Playwright

3. **CI/CD Integration:**
   - Add GitHub Actions workflows
   - Separate build pipelines for frontend/backend
   - Automated dependency updates

4. **Monorepo Tools:**
   - Consider adding Turborepo or Nx for better monorepo management
   - Add shared TypeScript configurations
   - Create shared utility packages

## References

- [npm Workspaces Documentation](https://docs.npmjs.com/cli/v7/using-npm/workspaces)
- [Composer Documentation](https://getcomposer.org/doc/)
- [Monorepo Best Practices](https://monorepo.tools/)
- [Next.js Documentation](https://nextjs.org/docs)
- [PHP Best Practices](https://www.php-fig.org/psr/)
