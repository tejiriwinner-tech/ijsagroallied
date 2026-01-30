/**
 * Test Helpers for Admin Dashboard Features
 * 
 * This file provides utilities for testing, including:
 * - Test data generators
 * - Database setup/teardown helpers
 * - Mock API responses
 */

import type { Category, Subcategory, Order, User, OrderItem } from './admin-types'

/**
 * Generate a random valid category for testing
 */
export function generateCategory(overrides?: Partial<Category>): Category {
    const id = overrides?.id ?? Math.floor(Math.random() * 10000)
    const name = overrides?.name ?? `Category ${id}`
    const slug = overrides?.slug ?? `category-${id}`

    return {
        id,
        name,
        slug,
        description: overrides?.description ?? `Description for ${name}`,
        image_url: overrides?.image_url ?? null,
        created_at: overrides?.created_at ?? new Date().toISOString(),
        subcategories: overrides?.subcategories ?? [],
    }
}

/**
 * Generate a random valid subcategory for testing
 */
export function generateSubcategory(categoryId: number, overrides?: Partial<Subcategory>): Subcategory {
    const id = overrides?.id ?? Math.floor(Math.random() * 10000)
    const name = overrides?.name ?? `Subcategory ${id}`
    const slug = overrides?.slug ?? `subcategory-${id}`

    return {
        id,
        category_id: categoryId,
        name,
        slug,
        description: overrides?.description ?? `Description for ${name}`,
        created_at: overrides?.created_at ?? new Date().toISOString(),
    }
}

/**
 * Generate a random valid order for testing
 */
export function generateOrder(overrides?: Partial<Order>): Order {
    const id = overrides?.id ?? Math.floor(Math.random() * 10000)
    const userId = overrides?.user_id ?? Math.floor(Math.random() * 1000)

    return {
        id,
        user_id: userId,
        customer_name: overrides?.customer_name ?? `Customer ${userId}`,
        customer_email: overrides?.customer_email ?? `customer${userId}@example.com`,
        total_amount: overrides?.total_amount ?? Math.floor(Math.random() * 10000) / 100,
        status: overrides?.status ?? 'pending',
        created_at: overrides?.created_at ?? new Date().toISOString(),
        updated_at: overrides?.updated_at ?? new Date().toISOString(),
    }
}

/**
 * Generate a random valid order item for testing
 */
export function generateOrderItem(orderId: number, overrides?: Partial<OrderItem>): OrderItem {
    const id = overrides?.id ?? Math.floor(Math.random() * 10000)
    const quantity = overrides?.quantity ?? Math.floor(Math.random() * 10) + 1
    const price = overrides?.price ?? Math.floor(Math.random() * 10000) / 100

    return {
        id,
        order_id: orderId,
        product_id: overrides?.product_id ?? Math.floor(Math.random() * 1000),
        product_name: overrides?.product_name ?? `Product ${id}`,
        quantity,
        price,
        subtotal: overrides?.subtotal ?? quantity * price,
    }
}

/**
 * Generate a random valid user for testing
 */
export function generateUser(overrides?: Partial<User>): User {
    const id = overrides?.id ?? Math.floor(Math.random() * 10000)

    return {
        id,
        name: overrides?.name ?? `User ${id}`,
        email: overrides?.email ?? `user${id}@example.com`,
        role: overrides?.role ?? 'user',
        created_at: overrides?.created_at ?? new Date().toISOString(),
    }
}

/**
 * Generate a valid slug from a name
 */
export function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

/**
 * Validate category data
 */
export function isValidCategoryData(data: any): boolean {
    return (
        typeof data.name === 'string' &&
        data.name.trim().length > 0 &&
        data.name.length <= 255 &&
        typeof data.slug === 'string' &&
        /^[a-z0-9-]+$/.test(data.slug) &&
        data.slug.length > 0 &&
        data.slug.length <= 255 &&
        (data.description === undefined || typeof data.description === 'string') &&
        (data.image_url === undefined || data.image_url === null || typeof data.image_url === 'string')
    )
}

/**
 * Validate order status
 */
export function isValidOrderStatus(status: string): boolean {
    return ['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)
}

/**
 * Validate user role
 */
export function isValidUserRole(role: string): boolean {
    return ['admin', 'user'].includes(role)
}

/**
 * Mock fetch for testing API calls
 */
export function mockFetch(response: any, status: number = 200) {
    global.fetch = jest.fn(() =>
        Promise.resolve({
            ok: status >= 200 && status < 300,
            status,
            json: () => Promise.resolve(response),
        } as Response)
    )
}

/**
 * Clear all mocks
 */
export function clearMocks() {
    jest.clearAllMocks()
}
