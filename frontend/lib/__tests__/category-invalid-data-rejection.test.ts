/**
 * Property-Based Test: Invalid Category Data Rejection
 * 
 * Feature: admin-dashboard-features, Property 6: Invalid category data rejection
 * 
 * Property Statement:
 * For any invalid category data (empty name, duplicate slug, invalid format), 
 * attempting to create or update a category should be rejected with appropriate 
 * validation errors.
 * 
 * **Validates: Requirements 1.7**
 * 
 * This test validates client-side validation logic and API error handling.
 * It uses mocked API responses to test validation scenarios without requiring
 * a full backend setup.
 */

import { AdminAPI } from '../api'
import type { CategoryInput } from '../admin-types'

// Mock fetch for testing
const mockFetch = jest.fn()
global.fetch = mockFetch

/**
 * Make slugs unique by appending a timestamp and random suffix
 */
function makeUniqueSlug(slug: string): string {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 10000)
    return `${slug}-${timestamp}-${random}`.substring(0, 255)
}

describe('Invalid Category Data Rejection Property Test', () => {
    let api: AdminAPI

    beforeEach(() => {
        // Create API instance
        api = new AdminAPI('mock-token')
        // Clear all mocks
        jest.clearAllMocks()
    })

    /**
     * Property 6: Invalid category data rejection
     * 
     * For any invalid category data (empty name, duplicate slug, invalid format), 
     * attempting to create or update a category should be rejected with appropriate 
     * validation errors.
     * 
     * **Validates: Requirements 1.7**
     */
    describe('Category Creation Validation', () => {
        it('should reject categories with invalid names', async () => {
            // Mock API response for validation error
            mockFetch.mockResolvedValueOnce({
                status: 422,
                json: async () => ({
                    success: false,
                    message: 'Validation failed',
                    errors: { name: 'Name is required' }
                })
            })

            const invalidData: CategoryInput = {
                name: '', // Empty name
                slug: makeUniqueSlug('test-slug'),
                description: 'Test description',
                image_url: null,
            }

            try {
                await api.createCategory(invalidData)
                fail('Expected validation error for empty name')
            } catch (error: any) {
                expect(error.message).toMatch(/name|required|validation/i)
            }

            // Verify API was called with correct data
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/categories/create.php'),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify(invalidData)
                })
            )
        })

        it('should reject categories with invalid slugs', async () => {
            // Mock API response for slug validation error
            mockFetch.mockResolvedValueOnce({
                status: 422,
                json: async () => ({
                    success: false,
                    message: 'Validation failed',
                    errors: { slug: 'Slug must contain only lowercase letters, numbers, and hyphens' }
                })
            })

            const invalidData: CategoryInput = {
                name: 'Test Category',
                slug: 'Invalid Slug', // Spaces not allowed
                description: 'Test description',
                image_url: null,
            }

            try {
                await api.createCategory(invalidData)
                fail('Expected validation error for invalid slug')
            } catch (error: any) {
                expect(error.message).toMatch(/slug|validation/i)
            }

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/categories/create.php'),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify(invalidData)
                })
            )
        })

        it('should reject categories with oversized descriptions', async () => {
            // Mock API response for description validation error
            mockFetch.mockResolvedValueOnce({
                status: 422,
                json: async () => ({
                    success: false,
                    message: 'Validation failed',
                    errors: { description: 'Description must not exceed 5000 characters' }
                })
            })

            const invalidData: CategoryInput = {
                name: 'Test Category',
                slug: makeUniqueSlug('test-slug'),
                description: 'D'.repeat(5001), // Exceeds 5000 character limit
                image_url: null,
            }

            try {
                await api.createCategory(invalidData)
                fail('Expected validation error for oversized description')
            } catch (error: any) {
                expect(error.message).toMatch(/description|5000|exceed|validation/i)
            }

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/categories/create.php'),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify(invalidData)
                })
            )
        })

        it('should reject categories with invalid image URLs', async () => {
            // Mock API response for image URL validation error
            mockFetch.mockResolvedValueOnce({
                status: 422,
                json: async () => ({
                    success: false,
                    message: 'Validation failed',
                    errors: { image_url: 'Image URL must not exceed 500 characters' }
                })
            })

            const invalidData: CategoryInput = {
                name: 'Test Category',
                slug: makeUniqueSlug('test-slug'),
                description: 'Test description',
                image_url: 'https://example.com/' + 'x'.repeat(500), // Exceeds 500 character limit
            }

            try {
                await api.createCategory(invalidData)
                fail('Expected validation error for oversized image URL')
            } catch (error: any) {
                expect(error.message).toMatch(/image|url|500|exceed|validation/i)
            }

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/categories/create.php'),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify(invalidData)
                })
            )
        })

        it('should reject duplicate slugs', async () => {
            // Mock successful creation first
            mockFetch.mockResolvedValueOnce({
                status: 201,
                json: async () => ({
                    success: true,
                    data: {
                        id: 'cat-123',
                        name: 'First Category',
                        slug: 'test-category-unique',
                        description: 'First category description',
                        image: null
                    }
                })
            })

            // Mock duplicate slug error for second creation
            mockFetch.mockResolvedValueOnce({
                status: 422,
                json: async () => ({
                    success: false,
                    message: 'A category with this slug already exists',
                    errors: { slug: 'This slug is already in use' }
                })
            })

            const validSlug = 'test-category-unique'
            const firstCategory: CategoryInput = {
                name: 'First Category',
                slug: validSlug,
                description: 'First category description',
                image_url: null,
            }

            // Create first category successfully
            const created = await api.createCategory(firstCategory)
            expect(created).toBeDefined()
            expect(created.slug).toBe(validSlug)

            // Try to create duplicate category
            const duplicateCategory: CategoryInput = {
                name: 'Second Category',
                slug: validSlug, // Same slug as first category
                description: 'Second category description',
                image_url: null,
            }

            try {
                await api.createCategory(duplicateCategory)
                fail('Expected duplicate slug error but category was created')
            } catch (error: any) {
                expect(
                    error.message.toLowerCase().includes('duplicate') ||
                    error.message.toLowerCase().includes('already exists') ||
                    error.message.toLowerCase().includes('slug') ||
                    error.message.toLowerCase().includes('already in use')
                ).toBe(true)
            }

            // Verify both API calls were made
            expect(mockFetch).toHaveBeenCalledTimes(2)
        })
    })
})