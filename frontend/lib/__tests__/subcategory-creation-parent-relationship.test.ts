/**
 * Property-Based Test: Subcategory Creation with Parent Relationship
 * 
 * Feature: admin-dashboard-features, Property 4: Subcategory creation with parent relationship
 * 
 * Property Statement:
 * For any existing category and any valid subcategory data, creating a subcategory 
 * should result in the subcategory being persisted with the correct parent category 
 * relationship in the database.
 * 
 * **Validates: Requirements 1.5**
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
 * npm test -- --testPathIgnorePatterns=subcategory-creation-parent-relationship
 */

import fc from 'fast-check'
import { AdminAPI } from '../api'
import type { Category, Subcategory, SubcategoryInput } from '../admin-types'

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
    try {
        // Get all categories
        const categories = await api.getCategories()

        // Delete all categories (subcategories will be deleted via CASCADE)
        for (const category of categories) {
            try {
                await api.deleteCategory(category.id)
            } catch (error) {
                // Ignore errors during cleanup - category might already be deleted
                console.warn(`Failed to delete category ${category.id} during cleanup:`, error)
            }
        }
    } catch (error) {
        // Ignore errors during cleanup
        console.warn('Failed to fetch categories during cleanup:', error)
    }
}

/**
 * Create a test parent category for subcategory tests
 */
async function createTestParentCategory(api: AdminAPI, suffix: string = ''): Promise<Category> {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 10000)
    const uniqueSuffix = suffix ? `-${suffix}` : ''

    const categoryData = {
        name: `Test Parent Category${uniqueSuffix}`,
        slug: `test-parent-category${uniqueSuffix}-${timestamp}-${random}`,
        description: `Test parent category for subcategory testing${uniqueSuffix}`,
        image_url: null,
    }

    return await api.createCategory(categoryData)
}

/**
 * Arbitrary generator for valid subcategory names
 * Must be 1-255 characters, non-empty after trim
 */
const subcategoryNameArb = fc
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
 * Arbitrary generator for subcategory data (without category_id)
 */
const subcategoryDataArb = fc.record({
    name: subcategoryNameArb,
    slug: slugArb,
    description: descriptionArb,
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

describeIntegration('Subcategory Creation with Parent Relationship Property Test', () => {
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
     * Property 4: Subcategory creation with parent relationship
     * 
     * For any existing category and any valid subcategory data, creating a subcategory 
     * should result in the subcategory being persisted with the correct parent category 
     * relationship in the database.
     * 
     * **Validates: Requirements 1.5**
     */
    it('should persist any valid subcategory data with correct parent relationship', async () => {
        await fc.assert(
            fc.asyncProperty(subcategoryDataArb, async (subcategoryData) => {
                // First, create a parent category
                const parentCategory = await createTestParentCategory(api, 'prop-test')

                // Make slug unique to avoid conflicts across test runs
                const uniqueSlug = makeUniqueSlug(subcategoryData.slug)
                const inputData: SubcategoryInput = {
                    category_id: parentCategory.id,
                    name: subcategoryData.name,
                    slug: uniqueSlug,
                    description: subcategoryData.description,
                }

                try {
                    // Create subcategory via API
                    const createdSubcategory = await api.createSubcategory(inputData)

                    // Verify the response contains the created subcategory
                    expect(createdSubcategory).toBeDefined()
                    expect(createdSubcategory.id).toBeDefined()

                    // Verify the returned data matches the input data
                    expect(createdSubcategory.name).toBe(inputData.name)
                    expect(createdSubcategory.slug).toBe(inputData.slug)
                    expect(createdSubcategory.description).toBe(inputData.description)
                    expect(createdSubcategory.category_id).toBe(inputData.category_id)

                    // Verify the parent relationship is correct
                    expect(createdSubcategory.category_id).toBe(parentCategory.id)

                    // Verify the subcategory was persisted by fetching the parent category with subcategories
                    const allCategories = await api.getCategories()
                    const persistedParentCategory = allCategories.find(c => c.id === parentCategory.id)

                    // Parent category should exist and have subcategories
                    expect(persistedParentCategory).toBeDefined()
                    expect(persistedParentCategory?.subcategories).toBeDefined()

                    if (persistedParentCategory?.subcategories) {
                        // Find the created subcategory in the parent's subcategories
                        const persistedSubcategory = persistedParentCategory.subcategories.find(
                            s => s.id === createdSubcategory.id
                        )

                        // Subcategory should exist in parent's subcategories
                        expect(persistedSubcategory).toBeDefined()

                        if (persistedSubcategory) {
                            // Persisted data should match the input data
                            expect(persistedSubcategory.name).toBe(inputData.name)
                            expect(persistedSubcategory.slug).toBe(inputData.slug)
                            expect(persistedSubcategory.description).toBe(inputData.description)
                            expect(persistedSubcategory.category_id).toBe(inputData.category_id)

                            // Persisted data should match the returned data
                            expect(persistedSubcategory.id).toBe(createdSubcategory.id)
                            expect(persistedSubcategory.name).toBe(createdSubcategory.name)
                            expect(persistedSubcategory.slug).toBe(createdSubcategory.slug)
                            expect(persistedSubcategory.description).toBe(createdSubcategory.description)
                            expect(persistedSubcategory.category_id).toBe(createdSubcategory.category_id)
                        }
                    }

                    // Clean up this specific subcategory first, then parent category
                    try {
                        await api.deleteSubcategory(createdSubcategory.id)
                    } catch (error) {
                        console.warn('Failed to delete subcategory during cleanup:', error)
                    }
                } catch (error) {
                    console.error('Error during subcategory test:', error)
                    throw error
                } finally {
                    // Always try to clean up the parent category
                    try {
                        await api.deleteCategory(parentCategory.id)
                    } catch (error) {
                        console.warn('Failed to delete parent category during cleanup:', error)
                    }
                }
            }),
            { numRuns: 1 }
        )
    }, 30000) // 30 seconds timeout for property test

    /**
     * Edge case: Minimal valid subcategory (only required fields)
     * A subcategory with only name, slug, and category_id should be created successfully
     */
    it('should create subcategory with only required fields', async () => {
        const parentCategory = await createTestParentCategory(api, 'minimal')

        const minimalSubcategory: SubcategoryInput = {
            category_id: parentCategory.id,
            name: 'Minimal Subcategory',
            slug: `minimal-subcategory-${Date.now()}`,
            description: '',
        }

        const created = await api.createSubcategory(minimalSubcategory)

        expect(created).toBeDefined()
        expect(created.name).toBe(minimalSubcategory.name)
        expect(created.slug).toBe(minimalSubcategory.slug)
        expect(created.description).toBe(minimalSubcategory.description)
        expect(created.category_id).toBe(minimalSubcategory.category_id)

        // Verify parent relationship
        const categories = await api.getCategories()
        const parent = categories.find(c => c.id === parentCategory.id)
        const subcategory = parent?.subcategories?.find(s => s.id === created.id)

        expect(subcategory).toBeDefined()
        expect(subcategory?.category_id).toBe(parentCategory.id)
    })

    /**
     * Edge case: Maximum length fields
     * A subcategory with maximum length name, slug, and description should be created
     */
    it('should create subcategory with maximum length fields', async () => {
        const parentCategory = await createTestParentCategory(api, 'max-length')

        const maxSubcategory: SubcategoryInput = {
            category_id: parentCategory.id,
            name: 'A'.repeat(255),
            slug: 'a'.repeat(255),
            description: 'D'.repeat(5000),
        }

        const created = await api.createSubcategory(maxSubcategory)

        expect(created).toBeDefined()
        expect(created.name).toBe(maxSubcategory.name)
        expect(created.slug).toBe(maxSubcategory.slug)
        expect(created.description).toBe(maxSubcategory.description)
        expect(created.category_id).toBe(maxSubcategory.category_id)

        // Verify parent relationship and persistence
        const categories = await api.getCategories()
        const parent = categories.find(c => c.id === parentCategory.id)
        const subcategory = parent?.subcategories?.find(s => s.id === created.id)

        expect(subcategory).toBeDefined()
        expect(subcategory?.name).toBe(maxSubcategory.name)
        expect(subcategory?.slug).toBe(maxSubcategory.slug)
        expect(subcategory?.description).toBe(maxSubcategory.description)
        expect(subcategory?.category_id).toBe(parentCategory.id)
    })

    /**
     * Edge case: Multiple subcategories under same parent
     * Multiple subcategories should be able to exist under the same parent category
     */
    it('should create multiple subcategories under same parent category', async () => {
        const parentCategory = await createTestParentCategory(api, 'multiple-subs')

        const subcategory1: SubcategoryInput = {
            category_id: parentCategory.id,
            name: 'First Subcategory',
            slug: `first-subcategory-${Date.now()}`,
            description: 'First subcategory description',
        }

        const subcategory2: SubcategoryInput = {
            category_id: parentCategory.id,
            name: 'Second Subcategory',
            slug: `second-subcategory-${Date.now()}`,
            description: 'Second subcategory description',
        }

        const created1 = await api.createSubcategory(subcategory1)
        const created2 = await api.createSubcategory(subcategory2)

        // Both should be created successfully
        expect(created1).toBeDefined()
        expect(created2).toBeDefined()
        expect(created1.category_id).toBe(parentCategory.id)
        expect(created2.category_id).toBe(parentCategory.id)

        // Verify both exist under the same parent
        const categories = await api.getCategories()
        const parent = categories.find(c => c.id === parentCategory.id)

        expect(parent?.subcategories).toBeDefined()
        expect(parent?.subcategories?.length).toBeGreaterThanOrEqual(2)

        const persistedSub1 = parent?.subcategories?.find(s => s.id === created1.id)
        const persistedSub2 = parent?.subcategories?.find(s => s.id === created2.id)

        expect(persistedSub1).toBeDefined()
        expect(persistedSub2).toBeDefined()
        expect(persistedSub1?.category_id).toBe(parentCategory.id)
        expect(persistedSub2?.category_id).toBe(parentCategory.id)
    })

    /**
     * Edge case: Special characters in description
     * A subcategory with special characters, unicode, and newlines in description should persist correctly
     */
    it('should create subcategory with special characters in description', async () => {
        const parentCategory = await createTestParentCategory(api, 'special-chars')

        const specialSubcategory: SubcategoryInput = {
            category_id: parentCategory.id,
            name: 'Special Subcategory',
            slug: `special-subcategory-${Date.now()}`,
            description: 'Description with special chars: !@#$%^&*()_+{}[]|\\:";\'<>?,./\nNewline\tTab\r\nCRLF\n\nDouble newline\n\n\nTriple\n🎉 Emoji 🚀',
        }

        const created = await api.createSubcategory(specialSubcategory)

        expect(created).toBeDefined()
        expect(created.description).toBe(specialSubcategory.description)
        expect(created.category_id).toBe(parentCategory.id)

        // Verify persistence with special characters
        const categories = await api.getCategories()
        const parent = categories.find(c => c.id === parentCategory.id)
        const subcategory = parent?.subcategories?.find(s => s.id === created.id)

        expect(subcategory).toBeDefined()
        expect(subcategory?.description).toBe(specialSubcategory.description)
        expect(subcategory?.category_id).toBe(parentCategory.id)
    })

    /**
     * Edge case: Whitespace handling in name
     * Names with leading/trailing whitespace should be trimmed
     */
    it('should trim whitespace from subcategory name', async () => {
        const parentCategory = await createTestParentCategory(api, 'whitespace')

        const whitespaceSubcategory: SubcategoryInput = {
            category_id: parentCategory.id,
            name: '  Whitespace Subcategory  ',
            slug: `whitespace-subcategory-${Date.now()}`,
            description: 'Subcategory with whitespace',
        }

        const created = await api.createSubcategory(whitespaceSubcategory)

        // Name should be trimmed
        expect(created.name).toBe('Whitespace Subcategory')
        expect(created.category_id).toBe(parentCategory.id)

        // Verify persistence
        const categories = await api.getCategories()
        const parent = categories.find(c => c.id === parentCategory.id)
        const subcategory = parent?.subcategories?.find(s => s.id === created.id)

        expect(subcategory?.name).toBe('Whitespace Subcategory')
        expect(subcategory?.category_id).toBe(parentCategory.id)
    })

    /**
     * Edge case: Slug with hyphens
     * Slugs with multiple consecutive hyphens should be accepted
     */
    it('should create subcategory with hyphens in slug', async () => {
        const parentCategory = await createTestParentCategory(api, 'hyphens')

        const hyphenSubcategory: SubcategoryInput = {
            category_id: parentCategory.id,
            name: 'Hyphen Subcategory',
            slug: `hyphen--subcategory---test-${Date.now()}`,
            description: 'Subcategory with hyphens',
        }

        const created = await api.createSubcategory(hyphenSubcategory)

        expect(created.slug).toBe(hyphenSubcategory.slug)
        expect(created.category_id).toBe(parentCategory.id)

        // Verify persistence
        const categories = await api.getCategories()
        const parent = categories.find(c => c.id === parentCategory.id)
        const subcategory = parent?.subcategories?.find(s => s.id === created.id)

        expect(subcategory?.slug).toBe(hyphenSubcategory.slug)
        expect(subcategory?.category_id).toBe(parentCategory.id)
    })

    /**
     * Edge case: Empty description
     * A subcategory with empty description should be created with empty string
     */
    it('should create subcategory with empty description', async () => {
        const parentCategory = await createTestParentCategory(api, 'empty-desc')

        const emptyDescSubcategory: SubcategoryInput = {
            category_id: parentCategory.id,
            name: 'Empty Desc Subcategory',
            slug: `empty-desc-subcategory-${Date.now()}`,
            description: '',
        }

        const created = await api.createSubcategory(emptyDescSubcategory)

        expect(created.description).toBe('')
        expect(created.category_id).toBe(parentCategory.id)

        // Verify persistence
        const categories = await api.getCategories()
        const parent = categories.find(c => c.id === parentCategory.id)
        const subcategory = parent?.subcategories?.find(s => s.id === created.id)

        expect(subcategory?.description).toBe('')
        expect(subcategory?.category_id).toBe(parentCategory.id)
    })

    /**
     * Edge case: Numeric characters in name and slug
     * Names and slugs with numbers should be accepted
     */
    it('should create subcategory with numeric characters', async () => {
        const parentCategory = await createTestParentCategory(api, 'numeric')

        const numericSubcategory: SubcategoryInput = {
            category_id: parentCategory.id,
            name: 'Subcategory 123 Test 456',
            slug: `subcategory-123-test-456-${Date.now()}`,
            description: 'Subcategory with numbers',
        }

        const created = await api.createSubcategory(numericSubcategory)

        expect(created.name).toBe(numericSubcategory.name)
        expect(created.slug).toBe(numericSubcategory.slug)
        expect(created.category_id).toBe(parentCategory.id)

        // Verify persistence
        const categories = await api.getCategories()
        const parent = categories.find(c => c.id === parentCategory.id)
        const subcategory = parent?.subcategories?.find(s => s.id === created.id)

        expect(subcategory?.name).toBe(numericSubcategory.name)
        expect(subcategory?.slug).toBe(numericSubcategory.slug)
        expect(subcategory?.category_id).toBe(parentCategory.id)
    })

    /**
     * Edge case: Parent category deletion cascade
     * When a parent category is deleted, its subcategories should also be deleted (CASCADE)
     */
    it('should delete subcategories when parent category is deleted (CASCADE)', async () => {
        const parentCategory = await createTestParentCategory(api, 'cascade-test')

        const subcategory: SubcategoryInput = {
            category_id: parentCategory.id,
            name: 'Cascade Test Subcategory',
            slug: `cascade-test-subcategory-${Date.now()}`,
            description: 'Subcategory for cascade deletion test',
        }

        const createdSubcategory = await api.createSubcategory(subcategory)

        // Verify subcategory was created
        expect(createdSubcategory).toBeDefined()
        expect(createdSubcategory.category_id).toBe(parentCategory.id)

        // Delete the parent category
        await api.deleteCategory(parentCategory.id)

        // Verify parent category no longer exists
        const categoriesAfterDelete = await api.getCategories()
        const deletedParent = categoriesAfterDelete.find(c => c.id === parentCategory.id)
        expect(deletedParent).toBeUndefined()

        // Subcategory should also be deleted due to CASCADE constraint
        // We can't directly query subcategories, but we can verify it's not in any category's subcategories
        const allSubcategories = categoriesAfterDelete.flatMap(c => c.subcategories || [])
        const deletedSubcategory = allSubcategories.find(s => s.id === createdSubcategory.id)
        expect(deletedSubcategory).toBeUndefined()
    })
})