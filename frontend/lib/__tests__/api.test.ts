/**
 * Basic API tests to verify testing infrastructure is working
 */

import { AdminAPI } from '../api'
import { mockFetch, clearMocks, generateCategory } from '../test-helpers'

describe('AdminAPI', () => {
    let adminApi: AdminAPI

    beforeEach(() => {
        adminApi = new AdminAPI()
        clearMocks()
    })

    describe('getCategories', () => {
        it('should fetch categories successfully', async () => {
            const mockCategories = [generateCategory(), generateCategory()]
            mockFetch({ success: true, data: mockCategories })

            const result = await adminApi.getCategories()

            expect(result).toEqual(mockCategories)
            expect(global.fetch).toHaveBeenCalledTimes(1)
        })

        it('should throw error when API returns failure', async () => {
            mockFetch({ success: false, message: 'Failed to fetch' })

            await expect(adminApi.getCategories()).rejects.toThrow('Failed to fetch')
        })
    })

    describe('createCategory', () => {
        it('should create category successfully', async () => {
            const categoryData = {
                name: 'Test Category',
                slug: 'test-category',
                description: 'Test description',
            }
            const mockCategory = generateCategory(categoryData)
            mockFetch({ success: true, data: mockCategory })

            const result = await adminApi.createCategory(categoryData)

            expect(result).toEqual(mockCategory)
            expect(global.fetch).toHaveBeenCalledTimes(1)
        })

        it('should throw error when creation fails', async () => {
            const categoryData = {
                name: 'Test Category',
                slug: 'test-category',
                description: 'Test description',
            }
            mockFetch({ success: false, message: 'Duplicate slug' })

            await expect(adminApi.createCategory(categoryData)).rejects.toThrow('Duplicate slug')
        })
    })

    describe('checkCategoryProducts', () => {
        it('should check category products successfully', async () => {
            const mockResponse = { hasProducts: true, count: 5 }
            mockFetch({ success: true, data: mockResponse })

            const result = await adminApi.checkCategoryProducts('cat-123')

            expect(result).toEqual(mockResponse)
            expect(global.fetch).toHaveBeenCalledTimes(1)
        })

        it('should throw error when check fails', async () => {
            mockFetch({ success: false, message: 'Category not found' })

            await expect(adminApi.checkCategoryProducts('invalid-id')).rejects.toThrow('Category not found')
        })
    })

    describe('deleteCategory', () => {
        it('should delete category successfully', async () => {
            mockFetch({ success: true, message: 'Category deleted successfully' })

            await adminApi.deleteCategory('cat-123')

            expect(global.fetch).toHaveBeenCalledTimes(1)
        })

        it('should throw error when deletion fails', async () => {
            mockFetch({ success: false, message: 'Cannot delete category. It has 5 associated products.' })

            await expect(adminApi.deleteCategory('cat-123')).rejects.toThrow('Cannot delete category. It has 5 associated products.')
        })
    })
})
