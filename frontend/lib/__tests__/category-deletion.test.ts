/**
 * Property-Based Test: Category Deletion
 * 
 * Feature: admin-dashboard-features, Property 3: Category deletion removes from database
 * 
 * Property Statement:
 * For any existing category, deleting the category should result in the category 
 * no longer existing in the database.
 * 
 * **Validates: Requirements 1.4**
 * 
 * IMPORTANT: This is an integration test that requires:
 * - Backend PHP server running (XAMPP or similar)
 * - Test database configured and accessible
 * - Test admin user created in database
 * 
 * To run this test:
 * 1. Ensure backend server is running
 * 2. Ensure test database exists (ijs_agroallied_test or ijs_agroallied)
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
 * npm test -- --testPathIgnorePatterns=category-deletion
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
 * Only delete categories that were created during testing (have specific naming pattern)
 */
async function cleanupTestData(api: AdminAPI): Promise<void> {
    try {
        // Get all categories
        const categories = await api.getCategories()

        // Only delete test categories (those with timestamp in slug or specific test names)
        const testCategories = categories.filter(category =>
            category.slug.includes('-1768') || // Contains timestamp
            category.slug.includes('test-') ||
            category.slug.includes('delete-') ||
            category.slug.includes('minimal-') ||
            category.slug.includes('special-') ||
            category.slug.includes('path-') ||
            category.slug.includes('url-') ||
            category.slug.includes('hyphen-') ||
            category.slug.includes('whitespace-') ||
            category.slug.includes('retrieval-') ||
            category.name.includes('Test ') ||
            category.name.includes('Delete ') ||
            category.name.includes('Minimal ') ||
            category.name.includes('Special ') ||
            category.name.includes('Path ') ||
            category.name.includes('URL ') ||
            category.name.includes('Hyphen ') ||
            category.name.includes('Whitespace ') ||
            category.name.includes('Retrieval ')
        )

        // Delete test categories
        for (const category of testCategories) {
            try {
                await api.deleteCategory(category.id)
            } catch (error) {
                // Ignore errors during cleanup (category might have products or already be deleted)
            }
        }
    } catch (error) {
        // Ignore errors during cleanup
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
 * Create a category for testing deletion
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

describeIntegration('Category Deletion Property Test', () => {
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
     * Property 3: Category deletion removes from database
     * 
     * For any existing category, deleting the category should result in the category 
     * no longer existing in the database.
     * 
     * **Validates: Requirements 1.4**
     */
    it('should remove any existing category from database when deleted', async () => {
        await fc.assert(
            fc.asyncProperty(categoryDataArb, async (categoryData) => {
                // Create a category to delete
                const createdCategory = await createTestCategory(api, categoryData)

                // Verify the category exists in the database
                const categoriesBeforeDeletion = await api.getCategories()
                const categoryBeforeDeletion = categoriesBeforeDeletion.find(c => c.id === createdCategory.id)
                expect(categoryBeforeDeletion).toBeDefined()
                expect(categoryBeforeDeletion?.id).toBe(createdCategory.id)
                expect(categoryBeforeDeletion?.name).toBe(createdCategory.name)
                expect(categoryBeforeDeletion?.slug).toBe(createdCategory.slug)

                // Count only test categories before deletion
                const testCategoriesBeforeDeletion = categoriesBeforeDeletion.filter(c =>
                    c.slug.includes('-1768') || c.slug.includes('test-') || c.name.includes('Test ')
                )

                // Delete the category via API
                await api.deleteCategory(createdCategory.id)

                // Verify the category no longer exists in the database
                const categoriesAfterDeletion = await api.getCategories()
                const categoryAfterDeletion = categoriesAfterDeletion.find(c => c.id === createdCategory.id)

                // Category should not exist in database after deletion
                expect(categoryAfterDeletion).toBeUndefined()

                // Verify the category list no longer contains the deleted category
                const categoryIds = categoriesAfterDeletion.map(c => c.id)
                expect(categoryIds).not.toContain(createdCategory.id)

                // Count only test categories after deletion
                const testCategoriesAfterDeletion = categoriesAfterDeletion.filter(c =>
                    c.slug.includes('-1768') || c.slug.includes('test-') || c.name.includes('Test ')
                )

                // Verify the test category count decreased by 1
                expect(testCategoriesAfterDeletion.length).toBe(testCategoriesBeforeDeletion.length - 1)
            }),
            { numRuns: 1 }
        )
    }, 60000) // 1 minute timeout for property test

    /**
     * Edge case: Delete category with minimal data
     * A category with only required fields should be deleted successfully
     */
    it('should delete category with minimal data (only name and slug)', async () => {
        const minimalCategory = {
            name: 'Minimal Delete Category',
            slug: `minimal-delete-category-${Date.now()}`,
            description: '',
            image_url: null,
        }

        // Create category
        const created = await api.createCategory(minimalCategory)

        // Verify it exists
        const categoriesBefore = await api.getCategories()
        const foundBefore = categoriesBefore.find(c => c.id === created.id)
        expect(foundBefore).toBeDefined()

        // Delete category
        await api.deleteCategory(created.id)

        // Verify it no longer exists
        const categoriesAfter = await api.getCategories()
        const foundAfter = categoriesAfter.find(c => c.id === created.id)
        expect(foundAfter).toBeUndefined()
    })

    /**
     * Edge case: Delete category with maximum length fields
     * A category with maximum length data should be deleted successfully
     */
    it('should delete category with maximum length fields', async () => {
        const maxCategory = {
            name: 'A'.repeat(255),
            slug: 'a'.repeat(255),
            description: 'D'.repeat(5000),
            image_url: 'https://example.com/' + 'x'.repeat(470), // Total 500 chars
        }

        // Create category
        const created = await api.createCategory(maxCategory)

        // Verify it exists
        const categoriesBefore = await api.getCategories()
        const foundBefore = categoriesBefore.find(c => c.id === created.id)
        expect(foundBefore).toBeDefined()
        expect(foundBefore?.name).toBe(maxCategory.name)
        expect(foundBefore?.slug).toBe(maxCategory.slug)

        // Delete category
        await api.deleteCategory(created.id)

        // Verify it no longer exists
        const categoriesAfter = await api.getCategories()
        const foundAfter = categoriesAfter.find(c => c.id === created.id)
        expect(foundAfter).toBeUndefined()
    })

    /**
     * Edge case: Delete category with special characters in description
     * A category with special characters should be deleted successfully
     */
    it('should delete category with special characters in description', async () => {
        const specialCategory = {
            name: 'Special Delete Category',
            slug: `special-delete-category-${Date.now()}`,
            description: 'Description with special chars: !@#$%^&*()_+{}[]|\\:";\'<>?,./\nNewline\tTab\r\nCRLF\n\nDouble newline\n\n\nTriple\n🎉 Emoji 🚀',
            image_url: null,
        }

        // Create category
        const created = await api.createCategory(specialCategory)

        // Verify it exists with special characters
        const categoriesBefore = await api.getCategories()
        const foundBefore = categoriesBefore.find(c => c.id === created.id)
        expect(foundBefore).toBeDefined()
        expect(foundBefore?.description).toBe(specialCategory.description)

        // Delete category
        await api.deleteCategory(created.id)

        // Verify it no longer exists
        const categoriesAfter = await api.getCategories()
        const foundAfter = categoriesAfter.find(c => c.id === created.id)
        expect(foundAfter).toBeUndefined()
    })

    /**
     * Edge case: Delete category with URL vs path image_url
     * Categories with both URL and path image_url should be deleted successfully
     */
    it('should delete categories with both URL and path image_url', async () => {
        // Test with relative path
        const pathCategory = {
            name: 'Path Delete Category',
            slug: `path-delete-category-${Date.now()}`,
            description: 'Category with path',
            image_url: '/images/categories/delete-test.jpg',
        }

        const createdPath = await api.createCategory(pathCategory)
        // Handle API inconsistency: create returns 'image' but we send 'image_url'
        const expectedImagePath = createdPath.image_url || createdPath.image
        expect(expectedImagePath).toBe(pathCategory.image_url)

        // Test with full URL
        const urlCategory = {
            name: 'URL Delete Category',
            slug: `url-delete-category-${Date.now()}`,
            description: 'Category with URL',
            image_url: 'https://example.com/images/delete-test.jpg',
        }

        const createdUrl = await api.createCategory(urlCategory)
        const expectedImageUrl = createdUrl.image_url || createdUrl.image
        expect(expectedImageUrl).toBe(urlCategory.image_url)

        // Verify both exist
        const categoriesBefore = await api.getCategories()
        const foundPathBefore = categoriesBefore.find(c => c.id === createdPath.id)
        const foundUrlBefore = categoriesBefore.find(c => c.id === createdUrl.id)
        expect(foundPathBefore).toBeDefined()
        expect(foundUrlBefore).toBeDefined()

        // Delete both categories
        await api.deleteCategory(createdPath.id)
        await api.deleteCategory(createdUrl.id)

        // Verify both no longer exist
        const categoriesAfter = await api.getCategories()
        const foundPathAfter = categoriesAfter.find(c => c.id === createdPath.id)
        const foundUrlAfter = categoriesAfter.find(c => c.id === createdUrl.id)
        expect(foundPathAfter).toBeUndefined()
        expect(foundUrlAfter).toBeUndefined()
    })

    /**
     * Edge case: Delete category with hyphens in slug
     * Categories with multiple consecutive hyphens should be deleted successfully
     */
    it('should delete category with hyphens in slug', async () => {
        const hyphenCategory = {
            name: 'Hyphen Delete Category',
            slug: `hyphen--delete---category-${Date.now()}`,
            description: 'Category with hyphens',
            image_url: null,
        }

        // Create category
        const created = await api.createCategory(hyphenCategory)
        expect(created.slug).toBe(hyphenCategory.slug)

        // Verify it exists
        const categoriesBefore = await api.getCategories()
        const foundBefore = categoriesBefore.find(c => c.id === created.id)
        expect(foundBefore).toBeDefined()
        expect(foundBefore?.slug).toBe(hyphenCategory.slug)

        // Delete category
        await api.deleteCategory(created.id)

        // Verify it no longer exists
        const categoriesAfter = await api.getCategories()
        const foundAfter = categoriesAfter.find(c => c.id === created.id)
        expect(foundAfter).toBeUndefined()
    })

    /**
     * Edge case: Delete category with numeric characters
     * Categories with numbers in name and slug should be deleted successfully
     */
    it('should delete category with numeric characters', async () => {
        const numericCategory = {
            name: 'Delete Category 123 Test 456',
            slug: `delete-category-123-test-456-${Date.now()}`,
            description: 'Category with numbers for deletion',
            image_url: null,
        }

        // Create category
        const created = await api.createCategory(numericCategory)
        expect(created.name).toBe(numericCategory.name)
        expect(created.slug).toBe(numericCategory.slug)

        // Verify it exists
        const categoriesBefore = await api.getCategories()
        const foundBefore = categoriesBefore.find(c => c.id === created.id)
        expect(foundBefore).toBeDefined()
        expect(foundBefore?.name).toBe(numericCategory.name)

        // Delete category
        await api.deleteCategory(created.id)

        // Verify it no longer exists
        const categoriesAfter = await api.getCategories()
        const foundAfter = categoriesAfter.find(c => c.id === created.id)
        expect(foundAfter).toBeUndefined()
    })

    /**
     * Edge case: Delete multiple categories in sequence
     * Multiple categories should be deleted independently without affecting each other
     */
    it('should delete multiple categories independently', async () => {
        const category1 = {
            name: 'Delete Category 1',
            slug: `delete-category-1-${Date.now()}`,
            description: 'First category to delete',
            image_url: null,
        }

        const category2 = {
            name: 'Delete Category 2',
            slug: `delete-category-2-${Date.now()}`,
            description: 'Second category to delete',
            image_url: '/images/category2.jpg',
        }

        const category3 = {
            name: 'Delete Category 3',
            slug: `delete-category-3-${Date.now()}`,
            description: 'Third category to delete',
            image_url: 'https://example.com/category3.jpg',
        }

        // Create all categories
        const created1 = await api.createCategory(category1)
        const created2 = await api.createCategory(category2)
        const created3 = await api.createCategory(category3)

        // Verify all exist
        const categoriesBefore = await api.getCategories()
        expect(categoriesBefore.find(c => c.id === created1.id)).toBeDefined()
        expect(categoriesBefore.find(c => c.id === created2.id)).toBeDefined()
        expect(categoriesBefore.find(c => c.id === created3.id)).toBeDefined()

        // Delete first category
        await api.deleteCategory(created1.id)

        // Verify only first is deleted, others remain
        const categoriesAfter1 = await api.getCategories()
        expect(categoriesAfter1.find(c => c.id === created1.id)).toBeUndefined()
        expect(categoriesAfter1.find(c => c.id === created2.id)).toBeDefined()
        expect(categoriesAfter1.find(c => c.id === created3.id)).toBeDefined()

        // Delete second category
        await api.deleteCategory(created2.id)

        // Verify first and second are deleted, third remains
        const categoriesAfter2 = await api.getCategories()
        expect(categoriesAfter2.find(c => c.id === created1.id)).toBeUndefined()
        expect(categoriesAfter2.find(c => c.id === created2.id)).toBeUndefined()
        expect(categoriesAfter2.find(c => c.id === created3.id)).toBeDefined()

        // Delete third category
        await api.deleteCategory(created3.id)

        // Verify all are deleted
        const categoriesAfter3 = await api.getCategories()
        expect(categoriesAfter3.find(c => c.id === created1.id)).toBeUndefined()
        expect(categoriesAfter3.find(c => c.id === created2.id)).toBeUndefined()
        expect(categoriesAfter3.find(c => c.id === created3.id)).toBeUndefined()
    })

    /**
     * Edge case: Attempt to delete non-existent category
     * Deleting a non-existent category should throw an error
     */
    it('should throw error when attempting to delete non-existent category', async () => {
        const nonExistentId = 'non-existent-category-id-12345'

        // Attempt to delete non-existent category should throw error
        await expect(api.deleteCategory(nonExistentId)).rejects.toThrow()
    })

    /**
     * Edge case: Delete category then verify it cannot be retrieved
     * After deletion, attempting to get the category should not return it
     */
    it('should not return deleted category in subsequent API calls', async () => {
        const testCategory = {
            name: 'Test Retrieval After Delete',
            slug: `test-retrieval-after-delete-${Date.now()}`,
            description: 'This category will be deleted and should not be retrievable',
            image_url: null,
        }

        // Create category
        const created = await api.createCategory(testCategory)

        // Verify it can be retrieved
        const categoriesBefore = await api.getCategories()
        const foundBefore = categoriesBefore.find(c => c.id === created.id)
        expect(foundBefore).toBeDefined()

        // Delete category
        await api.deleteCategory(created.id)

        // Verify it cannot be retrieved in multiple subsequent calls
        for (let i = 0; i < 3; i++) {
            const categoriesAfter = await api.getCategories()
            const foundAfter = categoriesAfter.find(c => c.id === created.id)
            expect(foundAfter).toBeUndefined()
        }
    })
})