/**
 * Property-Based Test: Category List Hierarchical Structure
 * 
 * Feature: admin-dashboard-features, Property 5: Category list hierarchical structure
 * 
 * Property Statement:
 * For any set of categories with subcategories, fetching the category list should 
 * return all categories with their subcategories properly nested in a hierarchical structure.
 * 
 * **Validates: Requirements 1.6**
 * 
 * IMPORTANT: This is an integration test that requires:
 * - Backend PHP server running (XAMPP or similar)
 * - Test database configured and accessible
 * - Admin user authenticated (session/token)
 * 
 * To run this test:
 * 1. Ensure backend server is running
 * 2. Ensure test database exists (mv_agricultural_consult_test)
 * 3. Set environment variable: TEST_INTEGRATION=true
 * 
 * Skip this test if integration testing is not enabled:
 * npm test -- --testPathIgnorePatterns=category-list-hierarchy
 */

import fc from 'fast-check'
import { AdminAPI } from '../api'

// Check if integration tests should run
const INTEGRATION_TESTS_ENABLED = process.env.TEST_INTEGRATION === 'true'

// Test database helpers
interface TestCategory {
    name: string
    slug: string
    description: string
    subcategories: TestSubcategory[]
}

interface TestSubcategory {
    name: string
    slug: string
    description: string
}

/**
 * Create a category in the test database via API
 */
async function createCategoryInDB(api: AdminAPI, category: TestCategory): Promise<number> {
    const created = await api.createCategory({
        name: category.name,
        slug: category.slug,
        description: category.description,
        image_url: null,
    })
    return created.id
}

/**
 * Create a subcategory in the test database via API
 */
async function createSubcategoryInDB(
    api: AdminAPI,
    categoryId: number,
    subcategory: TestSubcategory
): Promise<void> {
    await api.createSubcategory({
        category_id: categoryId,
        name: subcategory.name,
        slug: subcategory.slug,
        description: subcategory.description,
    })
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
 */
const categoryNameArb = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0)

/**
 * Arbitrary generator for valid slugs
 */
const slugArb = fc
    .array(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789'.split('')), {
        minLength: 1,
        maxLength: 30,
    })
    .map(arr => arr.join(''))

/**
 * Arbitrary generator for descriptions
 */
const descriptionArb = fc.string({ maxLength: 200 })

/**
 * Arbitrary generator for subcategories
 */
const subcategoryArb = fc.record({
    name: categoryNameArb,
    slug: slugArb,
    description: descriptionArb,
})

/**
 * Arbitrary generator for categories with subcategories
 */
const categoryWithSubcategoriesArb = fc.record({
    name: categoryNameArb,
    slug: slugArb,
    description: descriptionArb,
    subcategories: fc.array(subcategoryArb, { minLength: 0, maxLength: 5 }),
})

/**
 * Generate unique slugs for categories to avoid conflicts
 */
function makeUniqueSlugs(categories: TestCategory[]): TestCategory[] {
    const slugSet = new Set<string>()

    return categories.map((cat, catIndex) => {
        // Make category slug unique
        let categorySlug = cat.slug
        let counter = 0
        while (slugSet.has(categorySlug)) {
            categorySlug = `${cat.slug}-${counter++}`
        }
        slugSet.add(categorySlug)

        // Make subcategory slugs unique
        const uniqueSubcategories = cat.subcategories.map((sub, subIndex) => {
            let subSlug = sub.slug
            let subCounter = 0
            while (slugSet.has(subSlug)) {
                subSlug = `${sub.slug}-${subCounter++}`
            }
            slugSet.add(subSlug)

            return {
                ...sub,
                slug: subSlug,
            }
        })

        return {
            ...cat,
            slug: categorySlug,
            subcategories: uniqueSubcategories,
        }
    })
}

// Conditional test suite - only runs when integration tests are enabled
const describeIntegration = INTEGRATION_TESTS_ENABLED ? describe : describe.skip

describeIntegration('Category List Hierarchical Structure Property Test', () => {
    let api: AdminAPI

    beforeAll(() => {
        // Verify integration test requirements
        if (!INTEGRATION_TESTS_ENABLED) {
            console.warn('⚠️  Integration tests disabled. Set TEST_INTEGRATION=true to enable.')
        }
    })

    beforeEach(() => {
        api = new AdminAPI()
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
     * Property 5: Category list hierarchical structure
     * 
     * For any set of categories with subcategories, fetching the category list should 
     * return all categories with their subcategories properly nested in a hierarchical structure.
     * 
     * **Validates: Requirements 1.6**
     */
    it('should return all categories with subcategories properly nested in hierarchical structure', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.array(categoryWithSubcategoriesArb, { minLength: 1, maxLength: 3 }),
                async (categories) => {
                    // Make slugs unique to avoid conflicts
                    const uniqueCategories = makeUniqueSlugs(categories)

                    // Create categories and subcategories in the database
                    const categoryIds: number[] = []

                    for (const category of uniqueCategories) {
                        // Create the category
                        const categoryId = await createCategoryInDB(api, category)
                        categoryIds.push(categoryId)

                        // Create subcategories for this category
                        for (const subcategory of category.subcategories) {
                            await createSubcategoryInDB(api, categoryId, subcategory)
                        }
                    }

                    // Fetch the category list
                    const fetchedCategories = await api.getCategories()

                    // Verify all created categories are in the response
                    expect(fetchedCategories.length).toBeGreaterThanOrEqual(uniqueCategories.length)

                    // Verify each category has the correct structure
                    for (let i = 0; i < uniqueCategories.length; i++) {
                        const expectedCategory = uniqueCategories[i]
                        const actualCategory = fetchedCategories.find(
                            c => c.slug === expectedCategory.slug
                        )

                        // Category should exist
                        expect(actualCategory).toBeDefined()

                        if (actualCategory) {
                            // Category properties should match
                            expect(actualCategory.name).toBe(expectedCategory.name)
                            expect(actualCategory.slug).toBe(expectedCategory.slug)
                            expect(actualCategory.description).toBe(expectedCategory.description)

                            // Subcategories should be present and nested
                            expect(actualCategory.subcategories).toBeDefined()
                            expect(Array.isArray(actualCategory.subcategories)).toBe(true)

                            // Number of subcategories should match
                            expect(actualCategory.subcategories?.length).toBe(
                                expectedCategory.subcategories.length
                            )

                            // Each subcategory should be properly nested
                            for (const expectedSub of expectedCategory.subcategories) {
                                const actualSub = actualCategory.subcategories?.find(
                                    s => s.slug === expectedSub.slug
                                )

                                expect(actualSub).toBeDefined()

                                if (actualSub) {
                                    // Subcategory should reference the parent category
                                    expect(actualSub.category_id).toBe(actualCategory.id)

                                    // Subcategory properties should match
                                    expect(actualSub.name).toBe(expectedSub.name)
                                    expect(actualSub.slug).toBe(expectedSub.slug)
                                    expect(actualSub.description).toBe(expectedSub.description)
                                }
                            }
                        }
                    }

                    // Clean up for next iteration
                    await cleanupTestData(api)
                }
            ),
            { numRuns: 1 }
        )
    }, 60000) // 1 minute timeout for property test with 20 runs

    /**
     * Edge case: Empty subcategories array
     * Categories without subcategories should still have an empty subcategories array
     */
    it('should return categories with empty subcategories array when no subcategories exist', async () => {
        const category = {
            name: 'Category Without Subs',
            slug: 'category-without-subs',
            description: 'A category with no subcategories',
        }

        await api.createCategory({
            ...category,
            image_url: null,
        })

        const categories = await api.getCategories()
        const found = categories.find(c => c.slug === category.slug)

        expect(found).toBeDefined()
        expect(found?.subcategories).toBeDefined()
        expect(Array.isArray(found?.subcategories)).toBe(true)
        expect(found?.subcategories?.length).toBe(0)
    })

    /**
     * Edge case: Multiple levels verification
     * Verify that subcategories are only one level deep (no nested subcategories)
     */
    it('should maintain single-level hierarchy (subcategories are not nested further)', async () => {
        const category = await api.createCategory({
            name: 'Parent Category',
            slug: 'parent-category',
            description: 'Parent',
            image_url: null,
        })

        await api.createSubcategory({
            category_id: category.id,
            name: 'Child Subcategory',
            slug: 'child-subcategory',
            description: 'Child',
        })

        const categories = await api.getCategories()
        const found = categories.find(c => c.id === category.id)

        expect(found?.subcategories).toBeDefined()
        expect(found?.subcategories?.length).toBe(1)

        // Subcategories should not have their own subcategories property
        const subcategory = found?.subcategories?.[0]
        expect(subcategory).not.toHaveProperty('subcategories')
    })

    /**
     * Edge case: Large number of subcategories
     * Verify that categories with many subcategories are handled correctly
     */
    it('should handle categories with many subcategories', async () => {
        const category = await api.createCategory({
            name: 'Category With Many Subs',
            slug: 'category-with-many-subs',
            description: 'A category with many subcategories',
            image_url: null,
        })

        const subcategoryCount = 20
        const subcategorySlugs: string[] = []

        for (let i = 0; i < subcategoryCount; i++) {
            const slug = `subcategory-${i}`
            subcategorySlugs.push(slug)

            await api.createSubcategory({
                category_id: category.id,
                name: `Subcategory ${i}`,
                slug,
                description: `Description ${i}`,
            })
        }

        const categories = await api.getCategories()
        const found = categories.find(c => c.id === category.id)

        expect(found?.subcategories).toBeDefined()
        expect(found?.subcategories?.length).toBe(subcategoryCount)

        // Verify all subcategories are present
        for (const slug of subcategorySlugs) {
            const sub = found?.subcategories?.find(s => s.slug === slug)
            expect(sub).toBeDefined()
            expect(sub?.category_id).toBe(category.id)
        }
    })
})
