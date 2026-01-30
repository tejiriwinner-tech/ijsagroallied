# Frontend API Configuration

## Overview

The frontend communicates with the PHP backend API through a centralized configuration in `lib/api.ts`. This document explains how API endpoints are configured and how to update them for different environments.

## API Base URL Configuration

### Default Configuration

The API base URL is configured in `frontend/lib/api.ts`:

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_PHP_API_URL || "http://localhost/backend/api/api"
```

### Environment Variable

You can override the default API URL by setting the `NEXT_PUBLIC_PHP_API_URL` environment variable:

1. **Create a `.env.local` file** in the `frontend/` directory (this file is gitignored)
2. **Add the environment variable**:
   ```env
   NEXT_PUBLIC_PHP_API_URL=http://localhost/backend/api/api
   ```

### Environment-Specific URLs

#### Development (Local)
```env
NEXT_PUBLIC_PHP_API_URL=http://localhost/backend/api/api
```

#### Production
```env
NEXT_PUBLIC_PHP_API_URL=https://api.ijsagroallied.com/api
```

#### Custom Port (e.g., PHP built-in server on port 8000)
```env
NEXT_PUBLIC_PHP_API_URL=http://localhost:8000/api
```

## Backend API Structure

The backend API endpoints are organized in the following structure:

```
backend/
└── api/
    └── api/              # API endpoints directory
        ├── auth/         # Authentication endpoints
        │   ├── login.php
        │   └── register.php
        ├── products/     # Product management
        │   ├── index.php
        │   └── single.php
        ├── categories/   # Category management
        │   └── index.php
        ├── orders/       # Order management
        │   ├── index.php
        │   └── update-status.php
        ├── chicks/       # Day-old chicks
        │   └── batches.php
        └── bookings/     # Chick bookings
            └── index.php
```

## API Endpoint Paths

All API endpoints in `lib/api.ts` use relative paths that are appended to the `API_BASE_URL`:

### Products API
- `GET /products/index.php` - Get all products
- `GET /products/single.php?id={id}` - Get single product
- `POST /products/index.php` - Create product
- `PUT /products/single.php?id={id}` - Update product
- `DELETE /products/single.php?id={id}` - Delete product

### Authentication API
- `POST /auth/login.php` - User login
- `POST /auth/register.php` - User registration

### Orders API
- `GET /orders/index.php` - Get all orders
- `POST /orders/index.php` - Create order
- `PUT /orders/update-status.php` - Update order status

### Categories API
- `GET /categories/index.php` - Get all categories

### Chicks API
- `GET /chicks/batches.php` - Get available chick batches
- `POST /bookings/index.php` - Create chick booking
- `GET /bookings/index.php` - Get chick bookings

## Full URL Examples

With the default configuration (`http://localhost/backend/api/api`), the full URLs are:

- Products: `http://localhost/backend/api/api/products/index.php`
- Auth: `http://localhost/backend/api/api/auth/login.php`
- Orders: `http://localhost/backend/api/api/orders/index.php`
- Categories: `http://localhost/backend/api/api/categories/index.php`
- Chicks: `http://localhost/backend/api/api/chicks/batches.php`
- Bookings: `http://localhost/backend/api/api/bookings/index.php`

## Migration Notes

### Previous Configuration

Before the project structure cleanup, the API was located at:
- Old path: `frontend/php-api/api/`
- Old URL: `http://localhost/php-api/api`

### Current Configuration

After the migration (Task 4.1 - Move PHP API to backend structure):
- New path: `backend/api/api/`
- New URL: `http://localhost/backend/api/api`

### What Changed

1. **API Base URL**: Updated from `http://localhost/php-api/api` to `http://localhost/backend/api/api`
2. **Physical Location**: API files moved from `frontend/php-api/` to `backend/api/`
3. **Endpoint Paths**: All endpoint paths remain the same (relative paths)

## Testing API Configuration

### 1. Check Environment Variable

```bash
# In frontend directory
echo $NEXT_PUBLIC_PHP_API_URL
```

### 2. Test API Endpoints

You can test the API endpoints directly:

```bash
# Test products endpoint
curl http://localhost/backend/api/api/products/index.php

# Test categories endpoint
curl http://localhost/backend/api/api/categories/index.php
```

### 3. Check Frontend Console

Open the browser console and check for API errors. The `fetchApi` function logs errors with the prefix "API Error:".

## Troubleshooting

### Issue: API calls return 404 Not Found

**Solution**: Verify the API base URL is correct:
1. Check the `.env.local` file (if it exists)
2. Verify the backend API files exist at `backend/api/api/`
3. Ensure your web server is configured to serve the backend directory

### Issue: CORS errors

**Solution**: Update the CORS configuration in `backend/config/cors.php`:
```php
header("Access-Control-Allow-Origin: http://localhost:3000");
```

### Issue: Environment variable not working

**Solution**: 
1. Ensure the variable name starts with `NEXT_PUBLIC_` (required for Next.js)
2. Restart the Next.js development server after changing `.env.local`
3. Clear the `.next` cache: `rm -rf .next`

## Best Practices

1. **Never commit `.env.local`** - It contains environment-specific configuration
2. **Use `.env.example`** - Document all required environment variables
3. **Centralize API calls** - All API calls should go through `lib/api.ts`
4. **Use relative paths** - Endpoint paths should be relative to `API_BASE_URL`
5. **Handle errors gracefully** - The `fetchApi` wrapper handles network errors

## Related Documentation

- [Backend API Documentation](../backend/README.md)
- [Backend Structure](../backend/STRUCTURE.md)
- [Backend Deployment Guide](../backend/config/deployment.md)

## Support

For API configuration issues:
1. Check this documentation
2. Review the backend API documentation
3. Verify the backend API is running
4. Check browser console for errors
5. Contact the development team
