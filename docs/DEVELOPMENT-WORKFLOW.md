# Development Workflow Guide

## Overview

This guide provides detailed instructions for developing the Ijs Agroallied e-commerce platform. It covers daily development tasks, best practices, and common workflows for both frontend and backend development.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Daily Development Workflow](#daily-development-workflow)
3. [Frontend Development](#frontend-development)
4. [Backend Development](#backend-development)
5. [Full-Stack Development](#full-stack-development)
6. [Testing Workflow](#testing-workflow)
7. [Git Workflow](#git-workflow)
8. [Code Review Process](#code-review-process)
9. [Deployment Workflow](#deployment-workflow)
10. [Best Practices](#best-practices)

## Getting Started

### First-Time Setup

#### 1. Prerequisites Check

Ensure you have all required tools installed:

```bash
# Check Node.js (should be 18+)
node --version

# Check npm
npm --version

# Check PHP (should be 7.4+)
php --version

# Check PHP extensions
php -m | grep -E "pdo|pdo_mysql|json|mbstring"

# Check MySQL
mysql --version

# Check Composer
composer --version
```

If any tools are missing, install them:
- **Node.js:** https://nodejs.org/
- **PHP:** https://www.php.net/downloads
- **MySQL:** https://dev.mysql.com/downloads/
- **Composer:** https://getcomposer.org/

#### 2. Clone and Install

```bash
# Clone repository
git clone <repository-url>
cd ijsagroallied

# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install backend dependencies
cd backend
composer install
cd ..
```

#### 3. Environment Configuration

**Frontend Configuration:**

Create `frontend/.env.local`:
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Optional: Analytics, etc.
# NEXT_PUBLIC_GA_ID=your-ga-id
```

**Backend Configuration:**

Create `backend/config/.env` (copy from `.env.example`):
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ijsagroallied
DB_USER=your_username
DB_PASS=your_password

# API Configuration
API_SECRET_KEY=your-secret-key-here
JWT_SECRET=your-jwt-secret-here

# Environment
ENVIRONMENT=development
DEBUG=true
```

#### 4. Database Setup

```bash
# Create database
mysql -u root -p
CREATE DATABASE ijsagroallied;
EXIT;

# Import schema
npm run db:import

# Verify import
mysql -u root -p ijsagroallied
SHOW TABLES;
EXIT;
```

#### 5. Verify Setup

```bash
# Start both servers
npm run dev:all

# In another terminal, test frontend
curl http://localhost:3000

# Test backend
curl http://localhost:8000/api/categories/list.php

# Open browser
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000/api
```

## Daily Development Workflow

### Starting Your Day

```bash
# 1. Pull latest changes
git pull origin main

# 2. Check for dependency updates
npm install
cd frontend && npm install && cd ..
cd backend && composer install && cd ..

# 3. Start development servers
npm run dev:all

# 4. Open your IDE
code .  # VS Code
# or your preferred IDE
```

### During Development

```bash
# Frontend changes auto-reload (hot reload enabled)
# Backend changes require server restart

# To restart backend only:
# Stop with Ctrl+C, then:
npm run dev:backend

# Or restart both:
npm run dev:all
```

### Ending Your Day

```bash
# 1. Stop servers (Ctrl+C)

# 2. Commit your changes
git add .
git commit -m "Description of changes"

# 3. Push to your branch
git push origin your-branch-name

# 4. Create pull request if feature is complete
```

## Frontend Development

### Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth-related pages
│   ├── (dashboard)/       # Dashboard pages
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # Base UI components (shadcn/ui)
│   ├── forms/            # Form components
│   ├── layout/           # Layout components
│   └── [feature]/        # Feature-specific components
├── context/              # React Context providers
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and helpers
│   ├── api.ts           # API client
│   ├── utils.ts         # Utility functions
│   └── validations.ts   # Zod schemas
├── public/               # Static assets
└── styles/               # Global styles
```

### Creating a New Page

```bash
# 1. Create page file in app directory
# Example: app/products/page.tsx

# 2. Create page component
```

```typescript
// app/products/page.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Products | Ijs Agroallied',
  description: 'Browse our products',
}

export default function ProductsPage() {
  return (
    <div>
      <h1>Products</h1>
      {/* Your content */}
    </div>
  )
}
```

### Creating a New Component

```bash
# 1. Create component file
# Example: components/products/ProductCard.tsx
```

```typescript
// components/products/ProductCard.tsx
import { Card } from '@/components/ui/card'

interface ProductCardProps {
  id: string
  name: string
  price: number
  image: string
}

export function ProductCard({ id, name, price, image }: ProductCardProps) {
  return (
    <Card>
      <img src={image} alt={name} />
      <h3>{name}</h3>
      <p>${price}</p>
    </Card>
  )
}
```

### Adding API Integration

```typescript
// lib/api/products.ts
export async function getProducts() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/products/list.php`
  )
  
  if (!response.ok) {
    throw new Error('Failed to fetch products')
  }
  
  return response.json()
}

// Usage in component
import { useEffect, useState } from 'react'
import { getProducts } from '@/lib/api/products'

export function ProductList() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])
  
  if (loading) return <div>Loading...</div>
  
  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} {...product} />
      ))}
    </div>
  )
}
```

### Form Handling with Validation

```typescript
// lib/validations/product.ts
import { z } from 'zod'

export const productSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  price: z.number().positive('Price must be positive'),
  description: z.string().optional(),
})

export type ProductFormData = z.infer<typeof productSchema>

// components/forms/ProductForm.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { productSchema, ProductFormData } from '@/lib/validations/product'

export function ProductForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  })
  
  const onSubmit = async (data: ProductFormData) => {
    try {
      const response = await fetch('/api/products/create.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      if (response.ok) {
        // Handle success
      }
    } catch (error) {
      console.error(error)
    }
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}
      
      <input type="number" {...register('price', { valueAsNumber: true })} />
      {errors.price && <span>{errors.price.message}</span>}
      
      <button type="submit">Submit</button>
    </form>
  )
}
```

### Styling Components

```typescript
// Using Tailwind CSS
export function Button({ children, variant = 'primary' }) {
  const baseStyles = 'px-4 py-2 rounded font-medium'
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  }
  
  return (
    <button className={`${baseStyles} ${variants[variant]}`}>
      {children}
    </button>
  )
}
```

### Frontend Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint

# Run tests
npm test

# Type checking
npx tsc --noEmit
```

## Backend Development

### Project Structure

```
backend/
├── api/                   # API endpoints
│   ├── auth/             # Authentication
│   │   ├── login.php
│   │   └── register.php
│   ├── products/         # Products CRUD
│   │   ├── list.php
│   │   ├── create.php
│   │   ├── update.php
│   │   └── delete.php
│   ├── orders/           # Order management
│   ├── chicks/           # Day-old chicks
│   └── bookings/         # Booking system
├── config/               # Configuration
│   ├── database.php      # DB connection
│   ├── cors.php          # CORS headers
│   └── api.php           # API helpers
├── database/             # Database files
│   └── schema.sql        # Database schema
└── scripts/              # Utility scripts
```

### Creating a New API Endpoint

```bash
# 1. Create endpoint file
# Example: backend/api/api/products/list.php
```

```php
<?php
// backend/api/api/products/list.php

// Include required files
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../config/api.php';

// Set headers
header('Content-Type: application/json');

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

try {
    // Get database connection
    $database = new Database();
    $db = $database->getConnection();
    
    // Prepare query
    $query = "SELECT id, name, price, description, image_url, category_id 
              FROM products 
              WHERE active = 1 
              ORDER BY created_at DESC";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    // Fetch results
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Return response
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => $products,
        'count' => count($products)
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
```

### Creating a POST Endpoint

```php
<?php
// backend/api/api/products/create.php

require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../config/api.php';

header('Content-Type: application/json');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

try {
    // Get POST data
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Validate required fields
    if (empty($data['name']) || empty($data['price'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Name and price are required'
        ]);
        exit;
    }
    
    // Sanitize input
    $name = htmlspecialchars(strip_tags($data['name']));
    $price = floatval($data['price']);
    $description = htmlspecialchars(strip_tags($data['description'] ?? ''));
    $category_id = intval($data['category_id'] ?? 0);
    
    // Get database connection
    $database = new Database();
    $db = $database->getConnection();
    
    // Prepare insert query
    $query = "INSERT INTO products (name, price, description, category_id, created_at) 
              VALUES (:name, :price, :description, :category_id, NOW())";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':name', $name);
    $stmt->bindParam(':price', $price);
    $stmt->bindParam(':description', $description);
    $stmt->bindParam(':category_id', $category_id);
    
    // Execute query
    if ($stmt->execute()) {
        $product_id = $db->lastInsertId();
        
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Product created successfully',
            'data' => [
                'id' => $product_id,
                'name' => $name,
                'price' => $price
            ]
        ]);
    } else {
        throw new Exception('Failed to create product');
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
```

### Authentication Middleware

```php
<?php
// backend/config/auth.php

function verifyToken() {
    $headers = getallheaders();
    
    if (!isset($headers['Authorization'])) {
        http_response_code(401);
        echo json_encode(['error' => 'No token provided']);
        exit;
    }
    
    $token = str_replace('Bearer ', '', $headers['Authorization']);
    
    // Verify JWT token (simplified)
    // In production, use a proper JWT library
    $secret = getenv('JWT_SECRET') ?: 'your-secret-key';
    
    try {
        // Decode and verify token
        // Return user data if valid
        return ['user_id' => 1, 'email' => 'user@example.com'];
    } catch (Exception $e) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid token']);
        exit;
    }
}

// Usage in protected endpoint
require_once '../../config/auth.php';
$user = verifyToken();
// Now $user contains authenticated user data
?>
```

### Database Queries Best Practices

```php
<?php
// ✅ GOOD: Using prepared statements
$query = "SELECT * FROM products WHERE id = :id";
$stmt = $db->prepare($query);
$stmt->bindParam(':id', $id, PDO::PARAM_INT);
$stmt->execute();

// ❌ BAD: Direct string concatenation (SQL injection risk)
$query = "SELECT * FROM products WHERE id = " . $id;
$stmt = $db->query($query);

// ✅ GOOD: Sanitizing user input
$name = htmlspecialchars(strip_tags($data['name']));

// ❌ BAD: Using raw user input
$name = $data['name'];

// ✅ GOOD: Error handling
try {
    $stmt->execute();
} catch (PDOException $e) {
    error_log($e->getMessage());
    echo json_encode(['error' => 'Database error']);
}

// ❌ BAD: Exposing error details
catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
```

### Backend Development Commands

```bash
# Start PHP development server
cd backend
composer serve
# or
npm run serve

# Test API endpoints
npm run test:api

# Database operations
npm run db:import   # Import schema
npm run db:backup   # Backup database
npm run db:restore  # Restore database

# Check PHP syntax
find api -name "*.php" -exec php -l {} \;
```

## Full-Stack Development

### Typical Full-Stack Feature Workflow

#### 1. Plan the Feature

- Define requirements
- Design database schema changes (if needed)
- Plan API endpoints
- Design UI components

#### 2. Backend First Approach

```bash
# 1. Update database schema if needed
# Edit backend/database/schema.sql

# 2. Import updated schema
npm run db:import

# 3. Create API endpoint
# Create backend/api/api/[feature]/[endpoint].php

# 4. Test API endpoint
curl -X POST http://localhost:8000/api/[feature]/[endpoint].php \
  -H "Content-Type: application/json" \
  -d '{"key": "value"}'

# 5. Add to test script
# Edit backend/scripts/test-api.sh
```

#### 3. Frontend Integration

```bash
# 1. Create API client function
# Edit frontend/lib/api/[feature].ts

# 2. Create validation schema
# Edit frontend/lib/validations/[feature].ts

# 3. Create components
# Create frontend/components/[feature]/

# 4. Create page
# Create frontend/app/[feature]/page.tsx

# 5. Test in browser
# http://localhost:3000/[feature]
```

#### 4. End-to-End Testing

```bash
# 1. Start both servers
npm run dev:all

# 2. Test complete flow in browser
# - Navigate to feature
# - Test all interactions
# - Verify data persistence
# - Check error handling

# 3. Test API directly
npm run test:backend

# 4. Check console for errors
# Browser console and terminal
```

### Example: Adding a "Reviews" Feature

#### Step 1: Database Schema

```sql
-- backend/database/schema.sql
CREATE TABLE reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

```bash
# Import updated schema
npm run db:import
```

#### Step 2: Backend API

```php
<?php
// backend/api/api/reviews/create.php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../config/auth.php';

$user = verifyToken();
$data = json_decode(file_get_contents('php://input'), true);

// Validate
if (empty($data['product_id']) || empty($data['rating'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Product ID and rating required']);
    exit;
}

// Insert review
$database = new Database();
$db = $database->getConnection();

$query = "INSERT INTO reviews (product_id, user_id, rating, comment) 
          VALUES (:product_id, :user_id, :rating, :comment)";

$stmt = $db->prepare($query);
$stmt->execute([
    ':product_id' => $data['product_id'],
    ':user_id' => $user['user_id'],
    ':rating' => $data['rating'],
    ':comment' => $data['comment'] ?? ''
]);

echo json_encode(['success' => true, 'id' => $db->lastInsertId()]);
?>
```

#### Step 3: Frontend API Client

```typescript
// frontend/lib/api/reviews.ts
export async function createReview(data: {
  product_id: number
  rating: number
  comment?: string
}) {
  const token = localStorage.getItem('token')
  
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/reviews/create.php`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  )
  
  if (!response.ok) {
    throw new Error('Failed to create review')
  }
  
  return response.json()
}
```

#### Step 4: Frontend Component

```typescript
// frontend/components/reviews/ReviewForm.tsx
import { useForm } from 'react-hook-form'
import { createReview } from '@/lib/api/reviews'

export function ReviewForm({ productId }: { productId: number }) {
  const { register, handleSubmit } = useForm()
  
  const onSubmit = async (data) => {
    try {
      await createReview({
        product_id: productId,
        rating: data.rating,
        comment: data.comment,
      })
      alert('Review submitted!')
    } catch (error) {
      alert('Failed to submit review')
    }
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <select {...register('rating')} required>
        <option value="">Select rating</option>
        <option value="5">5 stars</option>
        <option value="4">4 stars</option>
        <option value="3">3 stars</option>
        <option value="2">2 stars</option>
        <option value="1">1 star</option>
      </select>
      
      <textarea {...register('comment')} placeholder="Your review" />
      
      <button type="submit">Submit Review</button>
    </form>
  )
}
```

## Testing Workflow

### Frontend Testing

```bash
# Run all tests
npm run test:frontend

# Run tests in watch mode
cd frontend
npm test -- --watch

# Run specific test file
npm test -- ProductCard.test.tsx

# Run with coverage
npm test -- --coverage
```

### Backend Testing

```bash
# Run API tests
npm run test:backend

# Test specific endpoint
curl -X GET http://localhost:8000/api/products/list.php

# Test with authentication
curl -X POST http://localhost:8000/api/orders/create.php \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"product_id": 1, "quantity": 2}'
```

### Manual Testing Checklist

- [ ] Frontend loads without errors
- [ ] All pages accessible
- [ ] Forms validate correctly
- [ ] API calls succeed
- [ ] Error messages display properly
- [ ] Loading states work
- [ ] Authentication flow works
- [ ] Data persists correctly
- [ ] Responsive design works
- [ ] Browser console has no errors

## Git Workflow

### Branch Strategy

```
main (production)
  └── develop (integration)
       ├── feature/user-authentication
       ├── feature/product-reviews
       ├── bugfix/cart-calculation
       └── hotfix/security-patch
```

### Creating a Feature Branch

```bash
# Update main branch
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "Add feature: description"

# Push to remote
git push origin feature/your-feature-name
```

### Commit Message Guidelines

```bash
# Good commit messages
git commit -m "Add product review form component"
git commit -m "Fix: Resolve cart calculation error"
git commit -m "Update: Improve API error handling"
git commit -m "Refactor: Simplify authentication logic"

# Bad commit messages
git commit -m "updates"
git commit -m "fix bug"
git commit -m "wip"
```

### Before Committing

```bash
# 1. Check what changed
git status
git diff

# 2. Run tests
npm test

# 3. Run linting
npm run lint

# 4. Stage changes
git add .

# 5. Commit with descriptive message
git commit -m "Descriptive message"

# 6. Push to remote
git push origin your-branch-name
```

## Code Review Process

### Creating a Pull Request

1. **Push your branch:**
   ```bash
   git push origin feature/your-feature
   ```

2. **Create PR on GitHub/GitLab:**
   - Go to repository
   - Click "New Pull Request"
   - Select your branch
   - Fill in description

3. **PR Description Template:**
   ```markdown
   ## Description
   Brief description of changes
   
   ## Changes Made
   - Added X feature
   - Fixed Y bug
   - Updated Z component
   
   ## Testing
   - [ ] Frontend tests pass
   - [ ] Backend tests pass
   - [ ] Manual testing completed
   
   ## Screenshots
   [If applicable]
   
   ## Related Issues
   Closes #123
   ```

### Reviewing Code

**As a Reviewer:**
- Check code quality and style
- Verify tests are included
- Test functionality locally
- Provide constructive feedback
- Approve or request changes

**As an Author:**
- Address all comments
- Make requested changes
- Re-request review
- Merge when approved

## Deployment Workflow

### Frontend Deployment

```bash
# 1. Build frontend
./scripts/deploy-frontend.sh production

# 2. Test build locally
cd frontend
npm run start

# 3. Deploy to hosting
# (Vercel, Netlify, etc.)
```

### Backend Deployment

```bash
# 1. Prepare backend
./scripts/deploy-backend.sh production

# 2. Upload to server
scp -r backend/ user@server:/var/www/

# 3. Configure server
# See backend/config/deployment.md

# 4. Test deployment
curl https://api.yourdomain.com/api/categories/list.php
```

## Best Practices

### General

- ✅ Write clean, readable code
- ✅ Use meaningful variable names
- ✅ Comment complex logic
- ✅ Keep functions small and focused
- ✅ Follow DRY principle (Don't Repeat Yourself)
- ✅ Handle errors gracefully
- ✅ Test your code
- ✅ Document your changes

### Frontend

- ✅ Use TypeScript for type safety
- ✅ Create reusable components
- ✅ Use proper React hooks
- ✅ Implement loading and error states
- ✅ Validate forms with Zod
- ✅ Use semantic HTML
- ✅ Make UI responsive
- ✅ Optimize images and assets

### Backend

- ✅ Use prepared statements (prevent SQL injection)
- ✅ Validate and sanitize input
- ✅ Use proper HTTP status codes
- ✅ Implement authentication/authorization
- ✅ Log errors properly
- ✅ Use environment variables for secrets
- ✅ Return consistent JSON responses
- ✅ Handle CORS correctly

### Security

- ✅ Never commit secrets or credentials
- ✅ Use environment variables
- ✅ Validate all user input
- ✅ Use HTTPS in production
- ✅ Implement rate limiting
- ✅ Hash passwords properly
- ✅ Use JWT for authentication
- ✅ Keep dependencies updated

### Performance

- ✅ Optimize database queries
- ✅ Use indexes on database tables
- ✅ Implement caching where appropriate
- ✅ Minimize API calls
- ✅ Optimize images
- ✅ Use lazy loading
- ✅ Minimize bundle size
- ✅ Use CDN for static assets

## Troubleshooting Common Issues

### "Cannot find module" Error

```bash
# Clean and reinstall
npm run clean
npm run install:all
```

### API Returns 404

```bash
# Check backend is running
npm run dev:backend

# Verify API URL in frontend/.env.local
echo $NEXT_PUBLIC_API_URL

# Test API directly
curl http://localhost:8000/api/categories/list.php
```

### Database Connection Failed

```bash
# Check MySQL is running
mysql -u root -p

# Verify credentials in backend/config/.env
cat backend/config/.env

# Test connection
php -r "new PDO('mysql:host=localhost;dbname=ijsagroallied', 'user', 'pass');"
```

### Hot Reload Not Working

```bash
# Restart frontend server
# Ctrl+C to stop
npm run dev:frontend

# Clear Next.js cache
cd frontend
rm -rf .next
npm run dev
```

## Additional Resources

### Documentation
- [Main README](../README.md)
- [Migration Guide](MIGRATION-GUIDE.md)
- [Package Structure](PACKAGE-STRUCTURE.md)
- [Backend API Reference](../backend/README.md)
- [Scripts Guide](../scripts/README.md)

### External Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [PHP Documentation](https://www.php.net/docs.php)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Tailwind CSS](https://tailwindcss.com/docs)

## Getting Help

If you encounter issues:

1. Check this guide
2. Review error messages
3. Check documentation
4. Search existing issues
5. Ask team members
6. Create new issue with details

---

**Last Updated:** January 2026  
**Maintained By:** Development Team
