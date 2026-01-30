/**
 * Tests for test helpers and property-based testing setup
 */

import fc from 'fast-check'
import {
    generateCategory,
    generateSlug,
    isValidCategoryData,
    isValidOrderStatus,
    isValidUserRole,
} from '../test-helpers'

describe('Test Helpers', () => {
    describe('generateCategory', () => {
        it('should generate valid category data', () => {
            const category = generateCategory()

            expect(category).toHaveProperty('id')
            expect(category).toHaveProperty('name')
            expect(category).toHaveProperty('slug')
            expect(category).toHaveProperty('description')
            expect(category).toHaveProperty('created_at')
            expect(category).toHaveProperty('subcategories')
        })

        it('should accept overrides', () => {
            const category = generateCategory({ name: 'Custom Name', slug: 'custom-slug' })

            expect(category.name).toBe('Custom Name')
            expect(category.slug).toBe('custom-slug')
        })
    })

    describe('generateSlug', () => {
        it('should convert name to valid slug', () => {
            expect(generateSlug('Test Category')).toBe('test-category')
            expect(generateSlug('Test  Multiple  Spaces')).toBe('test-multiple-spaces')
            expect(generateSlug('Test-With-Hyphens')).toBe('test-with-hyphens')
            expect(generateSlug('Test_With_Underscores')).toBe('test-with-underscores')
        })

        // Property-based test: slug generation should always produce valid slugs
        it('should always generate valid slugs from any string', () => {
            fc.assert(
                fc.property(
                    fc.string({ minLength: 1, maxLength: 100 }),
                    (name) => {
                        const slug = generateSlug(name)
                        // Valid slug: lowercase letters, numbers, and hyphens only
                        // May be empty if input has no valid characters
                        if (slug.length > 0) {
                            expect(slug).toMatch(/^[a-z0-9-]+$/)
                            expect(slug).not.toMatch(/^-|-$/) // No leading/trailing hyphens
                        }
                    }
                ),
                { numRuns: 1 }
            )
        })
    })

    describe('isValidCategoryData', () => {
        it('should validate correct category data', () => {
            const validData = {
                name: 'Test Category',
                slug: 'test-category',
                description: 'Test description',
                image_url: null,
            }

            expect(isValidCategoryData(validData)).toBe(true)
        })

        it('should reject invalid category data', () => {
            expect(isValidCategoryData({ name: '', slug: 'test' })).toBe(false)
            expect(isValidCategoryData({ name: 'Test', slug: 'Test Invalid' })).toBe(false)
            expect(isValidCategoryData({ name: 'Test', slug: 'test_invalid' })).toBe(false)
            expect(isValidCategoryData({ name: 'Test', slug: '' })).toBe(false)
        })

        // Property-based test: validation should be consistent
        it('should consistently validate category data', () => {
            fc.assert(
                fc.property(
                    fc.record({
                        name: fc.string({ minLength: 1, maxLength: 255 }),
                        slug: fc.array(
                            fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789-'.split('')),
                            { minLength: 1, maxLength: 255 }
                        ).map(arr => arr.join('')),
                        description: fc.string({ maxLength: 5000 }),
                        image_url: fc.option(fc.constant(null), { nil: null }),
                    }),
                    (data) => {
                        const isValid = isValidCategoryData(data)
                        // If data passes validation, it should have required properties
                        if (isValid) {
                            expect(data.name.trim().length).toBeGreaterThan(0)
                            expect(data.slug.length).toBeGreaterThan(0)
                            expect(data.slug).toMatch(/^[a-z0-9-]+$/)
                        }
                    }
                ),
                { numRuns: 1 }
            )
        })
    })

    describe('isValidOrderStatus', () => {
        it('should validate correct order statuses', () => {
            expect(isValidOrderStatus('pending')).toBe(true)
            expect(isValidOrderStatus('processing')).toBe(true)
            expect(isValidOrderStatus('shipped')).toBe(true)
            expect(isValidOrderStatus('delivered')).toBe(true)
            expect(isValidOrderStatus('cancelled')).toBe(true)
        })

        it('should reject invalid order statuses', () => {
            expect(isValidOrderStatus('invalid')).toBe(false)
            expect(isValidOrderStatus('PENDING')).toBe(false)
            expect(isValidOrderStatus('')).toBe(false)
        })
    })

    describe('isValidUserRole', () => {
        it('should validate correct user roles', () => {
            expect(isValidUserRole('admin')).toBe(true)
            expect(isValidUserRole('user')).toBe(true)
        })

        it('should reject invalid user roles', () => {
            expect(isValidUserRole('invalid')).toBe(false)
            expect(isValidUserRole('ADMIN')).toBe(false)
            expect(isValidUserRole('')).toBe(false)
        })
    })
})
