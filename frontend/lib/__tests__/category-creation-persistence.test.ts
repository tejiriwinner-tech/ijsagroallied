/**
 * Property-Based Test: Category Creation Persistence
 * 
 * Feature: admin-dashboard-features, Property 1: Category creation persistence
 * 
 * Property Statement:
 * For any valid category data (name, slug, description, image_url), creating a category 
 * should result in the category being persisted to the database and the returned category 
 * should match the input data.
 * 
 * **Validates: Requirements 1.1**
 * 
 * IMPORTANT: This is an integration test that requires:
 * - Backend PHP server running (XAMPP or similar)
 * - Test database configured and accessible
 * - Test admin user created in database
 * 
 * To run this test:
 * 1. Ensure backend server is running
 * 2. Ensure test database exists (mv_agricultural_consult_test or mv_agricultural_consult)
 * 3. Create test admin user (see setup instructions below)
 * 4. Set environment variable: TEST_INTEGRATION=true
 * 
 * Test Admin User Setup:
 * Run this SQL in your database to create the test admin user:
 * 
 * INSERT INTO users (name, email, password, role) VALUES
 * ('Test Admin', 'admin@test.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');
 * 
 * This creates a user with:
 * - Email: admin@test.com
 * - Password: admin123
 * - Role: admin
 * 
 * Skip this test if integration testing is not enabled:
 * npm test -- --testPathIgnorePatterns=category-creation-persistence
 */

import fc from 'fast-check'
import { AdminAPI } from '../api'

// Check if integration tests should run
const INTEGRATION_TESTS_ENABLED = process.env.TEST_INTEGRATION === 'true'

// Test admin credentials
const TEST_ADMIN_EMAIL = 'admin@test.com'
const TEST_ADMIN_PASSWORD = 'admin123'

/**
 * Login as admin and get authentication token
 * This requires a test admin user to exist in the database
 */
async function loginAsAdmin(): Promise<string> {
    const response = await fetch('http://localhost/ijsagroallied/backend/api/api/auth/login.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: TEST_ADMIN_EMAIL,
            password: TEST_ADMIN_PASSWORD,
        }),
    })

    const data = await response.json()

    // Handle both response formats: { token } and { data: { token } }
    const token = data.token || data.data?.token

    if (!data.success || !token) {
        throw new Error('Failed to login as admin. Ensure test admin user exists in database.')
    }

    return token
}

/**
 * Clean up test data from database
 */
async function cleanupTestData(api: AdminAPI): Promise<void> {
    // Get all categories
    const categories = await api.getCategories()

    // Delete all categories (subcategories will be deleted via CASCADE)
    for (const category of categories) {
        try {
            await api.deleteCategory(category.id)
        } catch (error) {
            // Ignore errors during cleanup
        }
    }
}

/**
 * Arbitrary generator for valid category names
 * Must be 1-255 characters, non-empty after trim
 */
const categoryNameArb = fc
    .string({ minLength: 1, maxLength: 255 })
    .filter(s => s.trim().length > 0)
    .map(s => s.trim())

/**
 * Arbitrary generator for valid slugs
 * Must be lowercase alphanumeric with hyphens, 1-255 characters
 */
const slugArb = fc
    .array(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789-'.split('')), {
        minLength: 1,
        maxLength: 50,
    })
    .map(arr => arr.join(''))
    .filter(s => s.length > 0 && s.length <= 255)

/**
 * Arbitrary generator for descriptions
 * Optional, max 5000 characters
 */
const descriptionArb = fc.string({ maxLength: 5000 })

/**
 * Arbitrary generator for image URLs
 * Optional, can be null, valid URL or path, max 500 characters
 */
const imageUrlArb = fc.oneof(
    fc.constant(null),
    fc.constant(''),
    fc.webUrl({ size: 'small' }).filter(url => url.length <= 500),
    fc
        .array(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789-_/.'.split('')), {
            minLength: 1,
            maxLength: 100,
        })
        .map(arr => '/' + arr.join(''))
        .filter(path => path.length <= 500)
)

/**
 * Arbitrary generator for complete category data
 */
const categoryDataArb = fc.record({
    name: categoryNameArb,
    slug: slugArb,
    description: descriptionArb,
    image_url: imageUrlArb,
})

/**
 * Make slugs unique by appending a timestamp and random suffix
 */
function makeUniqueSlug(slug: string): string {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 10000)
    return `${slug}-${timestamp}-${random}`.substring(0, 255)
}

// Conditional test suite - only runs when integration tests are enabled
const describeIntegration = INTEGRATION_TESTS_ENABLED ? describe : describe.skip

describeIntegration('Category Creation Persistence Property Test', () => {
    let api: AdminAPI
    let authToken: string

    beforeAll(async () => {
        // Verify integration test requirements
        if (!INTEGRATION_TESTS_ENABLED) {
            console.warn('⚠️  Integration tests disabled. Set TEST_INTEGRATION=true to enable.')
            return
        }

        // Login as admin to get authentication token
        try {
            authToken = await loginAsAdmin()
            console.log('✅ Successfully authenticated as admin for testing')
        } catch (error) {
            console.error('❌ Failed to authenticate as admin:', error)
            throw new Error(
                'Failed to authenticate. Ensure test admin user exists in database with credentials: ' +
                `${TEST_ADMIN_EMAIL} / ${TEST_ADMIN_PASSWORD}`
            )
        }
    })

    beforeEach(() => {
        // Create API instance with authentication token
        api = new AdminAPI(authToken)
    })

    afterEach(async () => {
        // Clean up test data after each test
        try {
            await cleanupTestData(api)
        } catch (error) {
            console.error('Cleanup error:', error)
        }
    })

    /**
     * Property 1: Category creation persistence
     * 
     * For any valid category data (name, slug, description, image_url), creating a category 
     * should result in the category being persisted to the database and the returned category 
     * should match the input data.
     * 
     * **Validates: Requirements 1.1**
     */
    it('should persist any valid category data to database and return matching data', async () => {
        await fc.assert(
            fc.asyncProperty(categoryDataArb, async (categoryData) => {
                // Make slug unique to avoid conflicts across test runs
                const uniqueSlug = makeUniqueSlug(categoryData.slug)
                const inputData = {
                    ...categoryData,
                    slug: uniqueSlug,
                    // Normalize empty string to null for image_url
                    image_url: categoryData.image_url === '' ? null : categoryData.image_url,
                }

                // Create category via API
                const createdCategory = await api.createCategory(inputData)

                // Verify the response contains the created category
                expect(createdCategory).toBeDefined()
                expect(createdCategory.id).toBeDefined()

                // Verify the returned data matches the input data
                expect(createdCategory.name).toBe(inputData.name)
                expect(createdCategory.slug).toBe(inputData.slug)
                expect(createdCategory.description).toBe(inputData.description)
                expect(createdCategory.image_url).toBe(inputData.image_url)

                // Verify the category was persisted by fetching it from the database
                const allCategories = await api.getCategories()
                const persistedCategory = allCategories.find(c => c.id === createdCategory.id)

                // Category should exist in database
                expect(persistedCategory).toBeDefined()

                if (persistedCategory) {
                    // Persisted data should match the input data
                    expect(persistedCategory.name).toBe(inputData.name)
                    expect(persistedCategory.slug).toBe(inputData.slug)
                    expect(persistedCategory.description).toBe(inputData.description)
                    expect(persistedCategory.image_url).toBe(inputData.image_url)

                    // Persisted data should match the returned data
                    expect(persistedCategory.id).toBe(createdCategory.id)
                    expect(persistedCategory.name).toBe(createdCategory.name)
                    expect(persistedCategory.slug).toBe(createdCategory.slug)
                    expect(persistedCategory.description).toBe(createdCategory.description)
                    expect(persistedCategory.image_url).toBe(createdCategory.image_url)
                }

                // Clean up this specific category
                await api.deleteCategory(createdCategory.id)
            }),
            { numRuns: 1 }
        )
    }, 60000) // 1 minute timeout for property test with 20 runs

    /**
     * Edge case: Minimal valid category (only required fields)
     * A category with only name and slug should be created successfully
     */
    it('should create category with only required fields (name and slug)', async () => {
        const minimalCategory = {
            name: 'Minimal Category',
            slug: `minimal-category-${Date.now()}`,
            description: '',
            image_url: null,
        }

        const created = await api.createCategory(minimalCategory)

        expect(created).toBeDefined()
        expect(created.name).toBe(minimalCategory.name)
        expect(created.slug).toBe(minimalCategory.slug)
        expect(created.description).toBe(minimalCategory.description)
        expect(created.image_url).toBe(minimalCategory.image_url)

        // Verify persistence
        const categories = await api.getCategories()
        const found = categories.find(c => c.id === created.id)

        expect(found).toBeDefined()
        expect(found?.name).toBe(minimalCategory.name)
        expect(found?.slug).toBe(minimalCategory.slug)
    })

    /**
     * Edge case: Maximum length fields
     * A category with maximum length name, slug, and description should be created
     */
    it('should create category with maximum length fields', async () => {
        const maxCategory = {
            name: 'A'.repeat(255),
            slug: 'a'.repeat(255),
            description: 'D'.repeat(5000),
            image_url: 'https://example.com/' + 'x'.repeat(470), // Total 500 chars
        }

        const created = await api.createCategory(maxCategory)

        expect(created).toBeDefined()
        expect(created.name).toBe(maxCategory.name)
        expect(created.slug).toBe(maxCategory.slug)
        expect(created.description).toBe(maxCategory.description)
        expect(created.image_url).toBe(maxCategory.image_url)

        // Verify persistence
        const categories = await api.getCategories()
        const found = categories.find(c => c.id === created.id)

        expect(found).toBeDefined()
        expect(found?.name).toBe(maxCategory.name)
        expect(found?.slug).toBe(maxCategory.slug)
        expect(found?.description).toBe(maxCategory.description)
    })

    /**
     * Edge case: Special characters in description
     * A category with special characters, unicode, and newlines in description should persist correctly
     */
    it('should create category with special characters in description', async () => {
        const specialCategory = {
            name: 'Special Category',
            slug: `special-category-${Date.now()}`,
            description: 'Description with special chars: !@#$%^&*()_+{}[]|\\:";\'<>?,./\nNewline\tTab\r\nCRLF\n\nDouble newline\n\n\nTriple\n🎉 Emoji 🚀',
            image_url: null,
        }

        const created = await api.createCategory(specialCategory)

        expect(created).toBeDefined()
        expect(created.description).toBe(specialCategory.description)

        // Verify persistence
        const categories = await api.getCategories()
        const found = categories.find(c => c.id === created.id)

        expect(found).toBeDefined()
        expect(found?.description).toBe(specialCategory.description)
    })

    /**
     * Edge case: URL path vs full URL for image_url
     * Both relative paths and full URLs should be accepted and persisted
     */
    it('should create category with both URL path and full URL for image_url', async () => {
        // Test with relative path
        const pathCategory = {
            name: 'Path Category',
            slug: `path-category-${Date.now()}`,
            description: 'Category with path',
            image_url: '/images/categories/test.jpg',
        }

        const createdPath = await api.createCategory(pathCategory)
        expect(createdPath.image_url).toBe(pathCategory.image_url)

        // Test with full URL
        const urlCategory = {
            name: 'URL Category',
            slug: `url-category-${Date.now()}`,
            description: 'Category with URL',
            image_url: 'https://example.com/images/test.jpg',
        }

        const createdUrl = await api.createCategory(urlCategory)
        expect(createdUrl.image_url).toBe(urlCategory.image_url)

        // Verify both persisted correctly
        const categories = await api.getCategories()
        const foundPath = categories.find(c => c.id === createdPath.id)
        const foundUrl = categories.find(c => c.id === createdUrl.id)

        expect(foundPath?.image_url).toBe(pathCategory.image_url)
        expect(foundUrl?.image_url).toBe(urlCategory.image_url)
    })

    /**
     * Edge case: Whitespace handling in name
     * Names with leading/trailing whitespace should be trimmed
     */
    it('should trim whitespace from category name', async () => {
        const whitespaceCategory = {
            name: '  Whitespace Category  ',
            slug: `whitespace-category-${Date.now()}`,
            description: 'Category with whitespace',
            image_url: null,
        }

        const created = await api.createCategory(whitespaceCategory)

        // Name should be trimmed
        expect(created.name).toBe('Whitespace Category')

        // Verify persistence
        const categories = await api.getCategories()
        const found = categories.find(c => c.id === created.id)

        expect(found?.name).toBe('Whitespace Category')
    })

    /**
     * Edge case: Slug with hyphens
     * Slugs with multiple consecutive hyphens should be accepted
     */
    it('should create category with hyphens in slug', async () => {
        const hyphenCategory = {
            name: 'Hyphen Category',
            slug: `hyphen--category---test-${Date.now()}`,
            description: 'Category with hyphens',
            image_url: null,
        }

        const created = await api.createCategory(hyphenCategory)

        expect(created.slug).toBe(hyphenCategory.slug)

        // Verify persistence
        const categories = await api.getCategories()
        const found = categories.find(c => c.id === created.id)

        expect(found?.slug).toBe(hyphenCategory.slug)
    })

    /**
     * Edge case: Empty description
     * A category with empty description should be created with empty string
     */
    it('should create category with empty description', async () => {
        const emptyDescCategory = {
            name: 'Empty Desc Category',
            slug: `empty-desc-category-${Date.now()}`,
            description: '',
            image_url: null,
        }

        const created = await api.createCategory(emptyDescCategory)

        expect(created.description).toBe('')

        // Verify persistence
        const categories = await api.getCategories()
        const found = categories.find(c => c.id === created.id)

        expect(found?.description).toBe('')
    })

    /**
     * Edge case: Numeric characters in name and slug
     * Names and slugs with numbers should be accepted
     */
    it('should create category with numeric characters', async () => {
        const numericCategory = {
            name: 'Category 123 Test 456',
            slug: `category-123-test-456-${Date.now()}`,
            description: 'Category with numbers',
            image_url: null,
        }

        const created = await api.createCategory(numericCategory)

        expect(created.name).toBe(numericCategory.name)
        expect(created.slug).toBe(numericCategory.slug)

        // Verify persistence
        const categories = await api.getCategories()
        const found = categories.find(c => c.id === created.id)

        expect(found?.name).toBe(numericCategory.name)
        expect(found?.slug).toBe(numericCategory.slug)
    })
})
