# Integration Tests for Admin Dashboard Features

This directory contains integration tests that verify the admin dashboard features work correctly with the backend API and database.

## Property-Based Integration Tests

### Category List Hierarchical Structure Test

**File:** `category-list-hierarchy.test.ts`

**Property:** For any set of categories with subcategories, fetching the category list should return all categories with their subcategories properly nested in a hierarchical structure.

**Validates:** Requirements 1.6

## Prerequisites

Before running integration tests, ensure the following:

### 1. Backend Server Running

The PHP backend server must be running and accessible. If using XAMPP:

1. Start Apache and MySQL in XAMPP Control Panel
2. Ensure the project is in `htdocs/ijsagroallied`
3. Backend API should be accessible at: `http://localhost/ijsagroallied/backend/api/api`

### 2. Test Database Setup

Create and configure the test database:

```sql
CREATE DATABASE mv_agricultural_consult_test;
```

Apply the schema:

```bash
mysql -u root -p mv_agricultural_consult_test < backend/database/schema.sql
```

### 3. Admin User Authentication

The integration tests require admin authentication. You have two options:

#### Option A: Use Existing Admin User

If you have an admin user in your test database, the tests will use the API's authentication mechanism.

#### Option B: Mock Authentication (Development)

For development, you can temporarily disable authentication in the backend endpoints by commenting out the `requireAdmin()` call. **Note: This should only be done in the test environment!**

### 4. Environment Variables

Set the following environment variables:

```bash
# Enable integration tests
export TEST_INTEGRATION=true

# Optional: Configure test database (if different from defaults)
export TEST_DB_HOST=localhost
export TEST_DB_NAME=mv_agricultural_consult_test
export TEST_DB_USER=root
export TEST_DB_PASS=
```

## Running Integration Tests

### Run All Integration Tests

```bash
cd frontend
TEST_INTEGRATION=true npm test
```

### Run Specific Integration Test

```bash
cd frontend
TEST_INTEGRATION=true npm test -- category-list-hierarchy.test.ts
```

### Run with Verbose Output

```bash
cd frontend
TEST_INTEGRATION=true npm test -- --verbose category-list-hierarchy.test.ts
```

## Test Structure

### Property-Based Test

The main test uses `fast-check` to generate random category and subcategory data:

- **Iterations:** 100 runs with different random data
- **Timeout:** 120 seconds (2 minutes) to allow for API calls
- **Cleanup:** Automatically cleans up test data after each run

### Edge Case Tests

Additional tests verify specific edge cases:

1. **Empty subcategories:** Categories without subcategories should have an empty array
2. **Single-level hierarchy:** Subcategories should not be nested further
3. **Many subcategories:** Categories with 20+ subcategories should work correctly

## Troubleshooting

### Tests are Skipped

If tests show as "skipped", ensure `TEST_INTEGRATION=true` is set:

```bash
TEST_INTEGRATION=true npm test
```

### Connection Errors

If you see connection errors:

1. Verify backend server is running
2. Check API_BASE_URL in `frontend/lib/api.ts`
3. Ensure test database exists and is accessible

### Authentication Errors (401/403)

If you see authentication errors:

1. Verify admin user exists in test database
2. Check authentication token is being sent correctly
3. Consider temporarily disabling auth for testing (development only)

### Database Errors

If you see database errors:

1. Verify test database schema is up to date
2. Check database credentials in environment variables
3. Ensure database user has proper permissions

### Cleanup Errors

If cleanup fails between test runs:

1. Manually clean the test database:
   ```sql
   USE mv_agricultural_consult_test;
   DELETE FROM subcategories;
   DELETE FROM categories;
   ```

2. Reset auto-increment:
   ```sql
   ALTER TABLE categories AUTO_INCREMENT = 1;
   ALTER TABLE subcategories AUTO_INCREMENT = 1;
   ```

## Test Data

The tests generate random data with the following constraints:

### Categories
- **Name:** 1-50 characters, non-empty after trim
- **Slug:** 1-30 characters, lowercase alphanumeric only
- **Description:** 0-200 characters
- **Subcategories:** 0-5 per category

### Subcategories
- **Name:** 1-50 characters, non-empty after trim
- **Slug:** 1-30 characters, lowercase alphanumeric only
- **Description:** 0-200 characters

All slugs are made unique to avoid conflicts during testing.

## Best Practices

1. **Always run integration tests in isolation** - Don't run them alongside unit tests
2. **Use a dedicated test database** - Never run integration tests against production
3. **Clean up after tests** - The tests automatically clean up, but verify manually if needed
4. **Monitor test duration** - Property tests with 100 runs may take 1-2 minutes
5. **Check for flaky tests** - If tests fail intermittently, check network/database stability

## Continuous Integration

To run integration tests in CI/CD:

1. Set up test database in CI environment
2. Start backend server (or use Docker)
3. Set `TEST_INTEGRATION=true` in CI environment variables
4. Run tests with appropriate timeout settings

Example GitHub Actions:

```yaml
- name: Run Integration Tests
  env:
    TEST_INTEGRATION: true
    TEST_DB_HOST: localhost
    TEST_DB_NAME: mv_agricultural_consult_test
  run: |
    cd frontend
    npm test -- --testTimeout=180000
```

## Additional Resources

- [fast-check Documentation](https://github.com/dubzzz/fast-check)
- [Jest Documentation](https://jestjs.io/)
- [Property-Based Testing Guide](https://github.com/dubzzz/fast-check/blob/main/documentation/Guides.md)

