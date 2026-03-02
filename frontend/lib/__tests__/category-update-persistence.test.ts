/**
 * Property-Based Test: Category Update Persistence
 * 
 * Feature: admin-dashboard-features, Property 2: Category update persistence
 * 
 * Property Statement:
 * For any existing category and any valid update data, updating the category 
 * should result in the database reflecting the changes and the returned category 
 * should match the updated data.
 * 
 * **Validates: Requirements 1.2**
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
 * npm test -- --testPathIgnorePatterns=category-update-persistence
 */

import fc from 'fast-check'
import { AdminAPI } from '../api'
import type { Category, CategoryInput } from '../admin-types'

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

/**
 * Create a category for testing updates
 */
async function createTestCategory(api: AdminAPI, data: CategoryInput): Promise<Category> {
    const uniqueData = {
        ...data,
        slug: makeUniqueSlug(data.slug),
        // Normalize empty string to null for image_url
        image_url: data.image_url === '' ? null : data.image_url,
    }

    return await api.createCategory(uniqueData)
}

// Conditional test suite - only runs when integration tests are enabled
const describeIntegration = INTEGRATION_TESTS_ENABLED ? describe : describe.skip

describeIntegration('Category Update Persistence Property Test', () => {
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
     * Property 2: Category update persistence
     * 
     * For any existing category and any valid update data, updating the category 
     * should result in the database reflecting the changes and the returned category 
     * should match the updated data.
     * 
     * **Validates: Requirements 1.2**
     */
    it('should persist any valid category update data to database and return matching data', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.tuple(categoryDataArb, categoryDataArb),
                async ([initialData, updateData]) => {
                    // Create initial category
                    const initialCategory = await createTestCategory(api, initialData)

                    // Prepare update data with unique slug to avoid conflicts
                    const uniqueUpdateData = {
                        ...updateData,
                        slug: makeUniqueSlug(updateData.slug),
                        // Normalize empty string to null for image_url
                        image_url: updateData.image_url === '' ? null : updateData.image_url,
                    }

                    // Update the category via API
                    const updatedCategory = await api.updateCategory(initialCategory.id, uniqueUpdateData)

                    // Verify the response contains the updated category
                    expect(updatedCategory).toBeDefined()
                    expect(updatedCategory.id).toBe(initialCategory.id)

                    // Verify the returned data matches the update data
                    expect(updatedCategory.name).toBe(uniqueUpdateData.name)
                    expect(updatedCategory.slug).toBe(uniqueUpdateData.slug)
                    expect(updatedCategory.description).toBe(uniqueUpdateData.description)
                    expect(updatedCategory.image_url).toBe(uniqueUpdateData.image_url)

                    // Verify the category was persisted by fetching it from the database
                    const allCategories = await api.getCategories()
                    const persistedCategory = allCategories.find(c => c.id === updatedCategory.id)

                    // Category should exist in database
                    expect(persistedCategory).toBeDefined()

                    if (persistedCategory) {
                        // Persisted data should match the update data
                        expect(persistedCategory.name).toBe(uniqueUpdateData.name)
                        expect(persistedCategory.slug).toBe(uniqueUpdateData.slug)
                        expect(persistedCategory.description).toBe(uniqueUpdateData.description)
                        expect(persistedCategory.image_url).toBe(uniqueUpdateData.image_url)

                        // Persisted data should match the returned data
                        expect(persistedCategory.id).toBe(updatedCategory.id)
                        expect(persistedCategory.name).toBe(updatedCategory.name)
                        expect(persistedCategory.slug).toBe(updatedCategory.slug)
                        expect(persistedCategory.description).toBe(updatedCategory.description)
                        expect(persistedCategory.image_url).toBe(updatedCategory.image_url)

                        // Verify the data actually changed from initial values
                        expect(persistedCategory.name).not.toBe(initialData.name)
                        expect(persistedCategory.slug).not.toBe(initialData.slug)
                        // Description and image_url might be the same, so we don't assert they changed
                    }

                    // Clean up this specific category
                    await api.deleteCategory(updatedCategory.id)
                }
            ),
            { numRuns: 1 }
        )
    }, 60000) // 1 minute timeout for property test

    /**
     * Edge case: Update with same data (no changes)
     * Updating a category with the same data should succeed and return unchanged data
     */
    it('should handle updates with identical data (no actual changes)', async () => {
        const originalData = {
            name: 'Unchanged Category',
            slug: `unchanged-category-${Date.now()}`,
            description: 'This category will not change',
            image_url: '/images/unchanged.jpg',
        }

        // Create category
        const created = await api.createCategory(originalData)

        // Update with same data
        const updated = await api.updateCategory(created.id, originalData)

        // Should return the same data
        expect(updated.id).toBe(created.id)
        expect(updated.name).toBe(originalData.name)
        expect(updated.slug).toBe(originalData.slug)
        expect(updated.description).toBe(originalData.description)
        expect(updated.image_url).toBe(originalData.image_url)

        // Verify persistence
        const categories = await api.getCategories()
        const found = categories.find(c => c.id === created.id)

        expect(found).toBeDefined()
        expect(found?.name).toBe(originalData.name)
        expect(found?.slug).toBe(originalData.slug)
        expect(found?.description).toBe(originalData.description)
        expect(found?.image_url).toBe(originalData.image_url)
    })

    /**
     * Edge case: Partial updates
     * Updating only some fields should preserve other fields
     */
    it('should handle partial updates correctly', async () => {
        const originalData = {
            name: 'Original Category',
            slug: `original-category-${Date.now()}`,
            description: 'Original description',
            image_url: '/images/original.jpg',
        }

        // Create category
        const created = await api.createCategory(originalData)

        // Update only name and description
        const partialUpdate = {
            name: 'Updated Category Name',
            slug: created.slug, // Keep same slug
            description: 'Updated description',
            image_url: created.image_url, // Keep same image_url
        }

        const updated = await api.updateCategory(created.id, partialUpdate)

        // Should have updated fields
        expect(updated.name).toBe(partialUpdate.name)
        expect(updated.description).toBe(partialUpdate.description)

        // Should preserve unchanged fields
        expect(updated.slug).toBe(originalData.slug)
        expect(updated.image_url).toBe(originalData.image_url)

        // Verify persistence
        const categories = await api.getCategories()
        const found = categories.find(c => c.id === created.id)

        expect(found?.name).toBe(partialUpdate.name)
        expect(found?.description).toBe(partialUpdate.description)
        expect(found?.slug).toBe(originalData.slug)
        expect(found?.image_url).toBe(originalData.image_url)
    })

    /**
     * Edge case: Update to null image_url
     * Updating image_url to null should persist null value
     */
    it('should handle updating image_url to null', async () => {
        const originalData = {
            name: 'Category With Image',
            slug: `category-with-image-${Date.now()}`,
            description: 'Has an image initially',
            image_url: '/images/original.jpg',
        }

        // Create category with image
        const created = await api.createCategory(originalData)
        expect(created.image_url).toBe(originalData.image_url)

        // Update to remove image
        const updateData = {
            name: created.name,
            slug: created.slug,
            description: created.description,
            image_url: null,
        }

        const updated = await api.updateCategory(created.id, updateData)

        // Should have null image_url
        expect(updated.image_url).toBeNull()

        // Verify persistence
        const categories = await api.getCategories()
        const found = categories.find(c => c.id === created.id)

        expect(found?.image_url).toBeNull()
    })

    /**
     * Edge case: Update from null to valid image_url
     * Updating image_url from null to a valid URL should persist the new value
     */
    it('should handle updating image_url from null to valid URL', async () => {
        const originalData = {
            name: 'Category Without Image',
            slug: `category-without-image-${Date.now()}`,
            description: 'No image initially',
            image_url: null,
        }

        // Create category without image
        const created = await api.createCategory(originalData)
        expect(created.image_url).toBeNull()

        // Update to add image
        const updateData = {
            name: created.name,
            slug: created.slug,
            description: created.description,
            image_url: '/images/new-image.jpg',
        }

        const updated = await api.updateCategory(created.id, updateData)

        // Should have new image_url
        expect(updated.image_url).toBe(updateData.image_url)

        // Verify persistence
        const categories = await api.getCategories()
        const found = categories.find(c => c.id === created.id)

        expect(found?.image_url).toBe(updateData.image_url)
    })

    /**
     * Edge case: Maximum length fields update
     * Updating to maximum length values should work correctly
     */
    it('should handle updates with maximum length fields', async () => {
        const originalData = {
            name: 'Short Name',
            slug: `short-slug-${Date.now()}`,
            description: 'Short description',
            image_url: '/short.jpg',
        }

        // Create category with short values
        const created = await api.createCategory(originalData)

        // Update to maximum length values
        const maxUpdateData = {
            name: 'A'.repeat(255),
            slug: 'a'.repeat(255),
            description: 'D'.repeat(5000),
            image_url: 'https://example.com/' + 'x'.repeat(470), // Total 500 chars
        }

        const updated = await api.updateCategory(created.id, maxUpdateData)

        // Should have maximum length values
        expect(updated.name).toBe(maxUpdateData.name)
        expect(updated.slug).toBe(maxUpdateData.slug)
        expect(updated.description).toBe(maxUpdateData.description)
        expect(updated.image_url).toBe(maxUpdateData.image_url)

        // Verify persistence
        const categories = await api.getCategories()
        const found = categories.find(c => c.id === created.id)

        expect(found?.name).toBe(maxUpdateData.name)
        expect(found?.slug).toBe(maxUpdateData.slug)
        expect(found?.description).toBe(maxUpdateData.description)
        expect(found?.image_url).toBe(maxUpdateData.image_url)
    })

    /**
     * Edge case: Special characters in updated description
     * Updating description with special characters should preserve them
     */
    it('should handle updates with special characters in description', async () => {
        const originalData = {
            name: 'Plain Category',
            slug: `plain-category-${Date.now()}`,
            description: 'Plain description',
            image_url: null,
        }

        // Create category with plain description
        const created = await api.createCategory(originalData)

        // Update with special characters
        const updateData = {
            name: created.name,
            slug: created.slug,
            description: 'Updated with special chars: !@#$%^&*()_+{}[]|\\:";\'<>?,./\nNewline\tTab\r\nCRLF\n\nDouble newline\n\n\nTriple\n🎉 Emoji 🚀',
            image_url: created.image_url,
        }

        const updated = await api.updateCategory(created.id, updateData)

        // Should preserve special characters
        expect(updated.description).toBe(updateData.description)

        // Verify persistence
        const categories = await api.getCategories()
        const found = categories.find(c => c.id === created.id)

        expect(found?.description).toBe(updateData.description)
    })

    /**
     * Edge case: Whitespace trimming in name
     * Updating name with leading/trailing whitespace should trim it
     */
    it('should trim whitespace from updated category name', async () => {
        const originalData = {
            name: 'Original Name',
            slug: `original-name-${Date.now()}`,
            description: 'Original description',
            image_url: null,
        }

        // Create category
        const created = await api.createCategory(originalData)

        // Update with whitespace in name
        const updateData = {
            name: '  Updated Name With Whitespace  ',
            slug: created.slug,
            description: created.description,
            image_url: created.image_url,
        }

        const updated = await api.updateCategory(created.id, updateData)

        // Name should be trimmed
        expect(updated.name).toBe('Updated Name With Whitespace')

        // Verify persistence
        const categories = await api.getCategories()
        const found = categories.find(c => c.id === created.id)

        expect(found?.name).toBe('Updated Name With Whitespace')
    })

    /**
     * Edge case: Empty description update
     * Updating description to empty string should persist empty string
     */
    it('should handle updating description to empty string', async () => {
        const originalData = {
            name: 'Category With Description',
            slug: `category-with-desc-${Date.now()}`,
            description: 'Original description that will be removed',
            image_url: null,
        }

        // Create category with description
        const created = await api.createCategory(originalData)
        expect(created.description).toBe(originalData.description)

        // Update to empty description
        const updateData = {
            name: created.name,
            slug: created.slug,
            description: '',
            image_url: created.image_url,
        }

        const updated = await api.updateCategory(created.id, updateData)

        // Should have empty description
        expect(updated.description).toBe('')

        // Verify persistence
        const categories = await api.getCategories()
        const found = categories.find(c => c.id === created.id)

        expect(found?.description).toBe('')
    })
})