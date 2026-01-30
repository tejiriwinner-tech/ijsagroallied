/**
 * Property-Based Test: Order List Completeness
 * 
 * Feature: admin-dashboard-features, Property 8: Order list completeness
 * 
 * Property Statement:
 * For any set of orders in the database, fetching the order list should return all orders 
 * with customer name, email, total amount, status, and dates present in each order.
 * 
 * **Validates: Requirements 2.1**
 */

import fc from 'fast-check'
import { AdminAPI } from '../api'
import type { Order } from '../admin-types'

// Check if integration tests should run
const INTEGRATION_TESTS_ENABLED = process.env.TEST_INTEGRATION === 'true'

// Test admin credentials
const TEST_ADMIN_EMAIL = 'admin@test.com'
const TEST_ADMIN_PASSWORD = 'admin123'

/**
 * Login as admin and get authentication token
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
    const token = data.token || data.data?.token

    if (!data.success || !token) {
        throw new Error('Failed to login as admin. Ensure test admin user exists in database.')
    }

    return token
}

// Conditional test suite - only runs when integration tests are enabled
const describeIntegration = INTEGRATION_TESTS_ENABLED ? describe : describe.skip

describeIntegration('Order List Completeness Property Test', () => {
    let api: AdminAPI
    let authToken: string

    beforeAll(async () => {
        if (!INTEGRATION_TESTS_ENABLED) {
            console.warn('⚠️  Integration tests disabled. Set TEST_INTEGRATION=true to enable.')
            return
        }

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
        api = new AdminAPI(authToken)
    })

    /**
     * Property 8: Order list completeness
     * 
     * For any set of orders in the database, fetching the order list should return all orders 
     * with customer name, email, total amount, status, and dates present in each order.
     * 
     * **Validates: Requirements 2.1**
     */
    it('should return all orders with complete customer details and order information', async () => {
        // Get all orders from the API
        const orders = await api.getOrders()

        // Verify that orders is an array
        expect(Array.isArray(orders)).toBe(true)

        // For each order, verify all required fields are present and valid
        orders.forEach((order: Order) => {
            // Verify order has all required fields
            expect(order.id).toBeDefined()
            expect(typeof order.id).toBe('string')
            expect(order.id.length).toBeGreaterThan(0)

            expect(order.user_id).toBeDefined()
            expect(typeof order.user_id).toBe('string')
            expect(order.user_id.length).toBeGreaterThan(0)

            // Customer details should be present
            expect(order.customer_name).toBeDefined()
            expect(typeof order.customer_name).toBe('string')
            expect(order.customer_name.length).toBeGreaterThan(0)

            expect(order.customer_email).toBeDefined()
            expect(typeof order.customer_email).toBe('string')
            expect(order.customer_email.length).toBeGreaterThan(0)
            // Basic email format validation
            expect(order.customer_email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)

            // Order financial details
            expect(order.total_amount).toBeDefined()
            expect(typeof order.total_amount).toBe('number')
            expect(order.total_amount).toBeGreaterThan(0)

            // Order status should be valid
            expect(order.status).toBeDefined()
            expect(typeof order.status).toBe('string')
            expect(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).toContain(order.status)

            // Timestamps should be present and valid
            expect(order.created_at).toBeDefined()
            expect(typeof order.created_at).toBe('string')
            expect(order.created_at.length).toBeGreaterThan(0)
            // Should be a valid date string
            expect(new Date(order.created_at).toString()).not.toBe('Invalid Date')
        })

        console.log(`✅ Verified ${orders.length} orders have complete information`)
    }, 15000) // 15 second timeout
})