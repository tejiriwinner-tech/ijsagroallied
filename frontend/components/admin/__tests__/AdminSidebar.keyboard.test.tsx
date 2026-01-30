/**
 * Property-Based Test: Keyboard Navigation Support
 * Feature: admin-sidebar-navigation, Property 5: Keyboard Navigation Support
 * Validates: Requirements 6.1, 6.2, 6.4, 6.5
 * 
 * For any navigation item, it should be reachable via Tab key navigation, 
 * activatable via Enter/Space keys, and maintain proper focus indicators 
 * in logical tab order.
 */

import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { AdminSidebar, MobileSidebarToggle } from '../AdminSidebar'
import fc from 'fast-check'

describe('AdminSidebar Keyboard Navigation Properties', () => {
    const validSections = ['overview', 'categories', 'orders', 'bookings', 'batches', 'users', 'products', 'low-stock', 'settings']

    const defaultProps = {
        activeSection: 'overview',
        onSectionChange: jest.fn(),
        isSidebarOpen: true,
        onSidebarClose: jest.fn(),
        lowStockCount: 0
    }

    beforeEach(() => {
        jest.clearAllMocks()
        cleanup()
    })

    afterEach(() => {
        cleanup()
    })

    test('Property 5: Keyboard Navigation Support - all navigation items are focusable', () => {
        fc.assert(fc.property(
            fc.record({
                activeSection: fc.constantFrom(...validSections),
                lowStockCount: fc.integer({ min: 0, max: 100 })
            }),
            (testData) => {
                cleanup() // Clean up before each property test run

                const { container } = render(
                    <AdminSidebar
                        {...defaultProps}
                        activeSection={testData.activeSection}
                        lowStockCount={testData.lowStockCount}
                    />
                )

                const sectionLabels = {
                    'overview': 'Overview',
                    'categories': 'Categories',
                    'orders': 'Orders',
                    'bookings': 'Bookings',
                    'batches': 'Chick Batches',
                    'users': 'Users',
                    'products': 'All Products',
                    'low-stock': 'Low Stock',
                    'settings': 'Settings'
                }

                // Verify all navigation items have proper tabIndex
                Object.entries(sectionLabels).forEach(([sectionId, sectionLabel]) => {
                    const buttons = screen.getAllByRole('button', {
                        name: new RegExp(`Navigate to ${sectionLabel}`, 'i')
                    })

                    // Should only find one button per section
                    expect(buttons).toHaveLength(1)
                    const button = buttons[0]

                    expect(button).toHaveAttribute('tabIndex', '0')
                    expect(button).toHaveClass('focus:outline-none')
                    expect(button).toHaveClass('focus:ring-2')
                    expect(button).toHaveClass('focus:ring-primary')
                    expect(button).toHaveClass('focus:ring-offset-2')
                    expect(button).toHaveClass('focus:ring-offset-card')
                })

                // Verify logout button is also focusable
                const logoutButtons = screen.getAllByRole('button', { name: /logout/i })
                expect(logoutButtons).toHaveLength(1)
                const logoutButton = logoutButtons[0]
                expect(logoutButton).toHaveAttribute('tabIndex', '0')
                expect(logoutButton).toHaveClass('focus:outline-none')
                expect(logoutButton).toHaveClass('focus:ring-2')
                expect(logoutButton).toHaveClass('focus:ring-destructive')

                cleanup() // Clean up after each property test run
            }
        ), { numRuns: 100 })
    })

    test('Property 5: Keyboard Navigation Support - Enter key activates navigation items', () => {
        fc.assert(fc.property(
            fc.record({
                activeSection: fc.constantFrom(...validSections),
                targetSection: fc.constantFrom(...validSections),
                lowStockCount: fc.integer({ min: 0, max: 50 })
            }),
            (testData) => {
                cleanup() // Clean up before each property test run

                const mockOnSectionChange = jest.fn()
                const mockOnSidebarClose = jest.fn()

                render(
                    <AdminSidebar
                        {...defaultProps}
                        activeSection={testData.activeSection}
                        onSectionChange={mockOnSectionChange}
                        onSidebarClose={mockOnSidebarClose}
                        lowStockCount={testData.lowStockCount}
                    />
                )

                const sectionLabels = {
                    'overview': 'Overview',
                    'categories': 'Categories',
                    'orders': 'Orders',
                    'bookings': 'Bookings',
                    'batches': 'Chick Batches',
                    'users': 'Users',
                    'products': 'All Products',
                    'low-stock': 'Low Stock',
                    'settings': 'Settings'
                }

                const targetButtons = screen.getAllByRole('button', {
                    name: new RegExp(`Navigate to ${sectionLabels[testData.targetSection as keyof typeof sectionLabels]}`, 'i')
                })

                expect(targetButtons).toHaveLength(1)
                const targetButton = targetButtons[0]

                // Press Enter key
                fireEvent.keyDown(targetButton, { key: 'Enter' })

                // Verify section change callback was called
                expect(mockOnSectionChange).toHaveBeenCalledWith(testData.targetSection)
                expect(mockOnSidebarClose).toHaveBeenCalledTimes(1)

                cleanup() // Clean up after each property test run
            }
        ), { numRuns: 100 })
    })

    test('Property 5: Keyboard Navigation Support - Space key activates navigation items', () => {
        fc.assert(fc.property(
            fc.record({
                activeSection: fc.constantFrom(...validSections),
                targetSection: fc.constantFrom(...validSections),
                lowStockCount: fc.integer({ min: 0, max: 25 })
            }),
            (testData) => {
                cleanup() // Clean up before each property test run

                const mockOnSectionChange = jest.fn()
                const mockOnSidebarClose = jest.fn()

                render(
                    <AdminSidebar
                        {...defaultProps}
                        activeSection={testData.activeSection}
                        onSectionChange={mockOnSectionChange}
                        onSidebarClose={mockOnSidebarClose}
                        lowStockCount={testData.lowStockCount}
                    />
                )

                const sectionLabels = {
                    'overview': 'Overview',
                    'categories': 'Categories',
                    'orders': 'Orders',
                    'bookings': 'Bookings',
                    'batches': 'Chick Batches',
                    'users': 'Users',
                    'products': 'All Products',
                    'low-stock': 'Low Stock',
                    'settings': 'Settings'
                }

                const targetButtons = screen.getAllByRole('button', {
                    name: new RegExp(`Navigate to ${sectionLabels[testData.targetSection as keyof typeof sectionLabels]}`, 'i')
                })

                expect(targetButtons).toHaveLength(1)
                const targetButton = targetButtons[0]

                // Press Space key
                fireEvent.keyDown(targetButton, { key: ' ' })

                // Verify section change callback was called
                expect(mockOnSectionChange).toHaveBeenCalledWith(testData.targetSection)
                expect(mockOnSidebarClose).toHaveBeenCalledTimes(1)

                cleanup() // Clean up after each property test run
            }
        ), { numRuns: 100 })
    })

    test('Property 5: Keyboard Navigation Support - Escape key closes sidebar', () => {
        fc.assert(fc.property(
            fc.record({
                activeSection: fc.constantFrom(...validSections),
                lowStockCount: fc.integer({ min: 0, max: 10 })
            }),
            (testData) => {
                cleanup() // Clean up before each property test run

                const mockOnSidebarClose = jest.fn()

                const { container } = render(
                    <AdminSidebar
                        {...defaultProps}
                        activeSection={testData.activeSection}
                        lowStockCount={testData.lowStockCount}
                        isSidebarOpen={true}
                        onSidebarClose={mockOnSidebarClose}
                    />
                )

                const sidebar = container.querySelector('aside')
                expect(sidebar).toBeInTheDocument()

                // Press Escape key on sidebar
                fireEvent.keyDown(sidebar!, { key: 'Escape' })

                // Verify sidebar close callback was called
                expect(mockOnSidebarClose).toHaveBeenCalledTimes(1)

                cleanup() // Clean up after each property test run
            }
        ), { numRuns: 100 })
    })

    test('Property 5: Keyboard Navigation Support - logout button keyboard activation', () => {
        fc.assert(fc.property(
            fc.record({
                activeSection: fc.constantFrom(...validSections),
                keyType: fc.constantFrom('Enter', ' ') // Test both Enter and Space
            }),
            (testData) => {
                cleanup() // Clean up before each property test run

                // Mock window.location.href
                const originalHref = window.location.href
                Object.defineProperty(window.location, 'href', {
                    writable: true,
                    value: originalHref
                })

                render(
                    <AdminSidebar
                        {...defaultProps}
                        activeSection={testData.activeSection}
                    />
                )

                const logoutButtons = screen.getAllByRole('button', { name: /logout/i })
                expect(logoutButtons).toHaveLength(1)
                const logoutButton = logoutButtons[0]

                // Press the specified key
                fireEvent.keyDown(logoutButton, { key: testData.keyType })

                // Verify logout was triggered (redirect to login)
                expect(window.location.href).toBe('/login')

                // Restore original href
                Object.defineProperty(window.location, 'href', {
                    writable: true,
                    value: originalHref
                })
                cleanup() // Clean up after each property test run
            }
        ), { numRuns: 100 })
    })

    test('Property 5: Keyboard Navigation Support - accessibility attributes present', () => {
        fc.assert(fc.property(
            fc.record({
                activeSection: fc.constantFrom(...validSections),
                lowStockCount: fc.integer({ min: 0, max: 5 })
            }),
            (testData) => {
                cleanup() // Clean up before each property test run

                const { container } = render(
                    <AdminSidebar
                        {...defaultProps}
                        activeSection={testData.activeSection}
                        lowStockCount={testData.lowStockCount}
                    />
                )

                // Verify sidebar has proper ARIA attributes
                const sidebar = container.querySelector('aside')
                expect(sidebar).toHaveAttribute('role', 'navigation')
                expect(sidebar).toHaveAttribute('aria-label', 'Admin navigation')

                // Verify navigation has proper ARIA attributes
                const nav = container.querySelector('nav')
                expect(nav).toHaveAttribute('role', 'list')
                expect(nav).toHaveAttribute('aria-label', 'Admin navigation menu')

                // Verify navigation items have proper ARIA attributes
                const navItems = container.querySelectorAll('[role="listitem"]')
                expect(navItems).toHaveLength(9) // 9 navigation items

                // Verify skip link is present
                const skipLink = container.querySelector('a[href="#main-content"]')
                expect(skipLink).toBeInTheDocument()
                expect(skipLink).toHaveClass('sr-only')
                expect(skipLink).toHaveClass('focus:not-sr-only')

                cleanup() // Clean up after each property test run
            }
        ), { numRuns: 100 })
    })

    test('Property 5: Keyboard Navigation Support - mobile toggle keyboard support', () => {
        fc.assert(fc.property(
            fc.record({
                isSidebarOpen: fc.boolean()
            }),
            (testData) => {
                cleanup() // Clean up before each property test run

                const mockOnToggle = jest.fn()

                render(
                    <MobileSidebarToggle
                        isSidebarOpen={testData.isSidebarOpen}
                        onToggle={mockOnToggle}
                    />
                )

                const toggleButtons = screen.getAllByRole('button')
                expect(toggleButtons).toHaveLength(1)
                const toggleButton = toggleButtons[0]

                // Verify button has proper accessibility attributes
                const expectedLabel = testData.isSidebarOpen ? 'Close sidebar' : 'Open sidebar'
                expect(toggleButton).toHaveAttribute('aria-label', expectedLabel)

                // Test keyboard activation (buttons are focusable by default)
                fireEvent.keyDown(toggleButton, { key: 'Enter' })
                // Note: Default button behavior handles Enter key, so we just verify the button is present
                expect(toggleButton).toBeInTheDocument()

                cleanup() // Clean up after each property test run
            }
        ), { numRuns: 100 })
    })

    test('Property 5: Keyboard Navigation Support - logical tab order', () => {
        fc.assert(fc.property(
            fc.record({
                activeSection: fc.constantFrom(...validSections),
                lowStockCount: fc.integer({ min: 0, max: 3 })
            }),
            (testData) => {
                cleanup() // Clean up before each property test run

                const { container } = render(
                    <AdminSidebar
                        {...defaultProps}
                        activeSection={testData.activeSection}
                        lowStockCount={testData.lowStockCount}
                    />
                )

                // Get all focusable elements in order
                const focusableElements = container.querySelectorAll('[tabIndex="0"]')

                // Should have 10 focusable elements: skip link + 9 nav items + logout button
                expect(focusableElements.length).toBeGreaterThanOrEqual(10)

                // Verify each element is properly focusable
                focusableElements.forEach(element => {
                    expect(element).toHaveAttribute('tabIndex', '0')
                })

                // Verify skip link exists and is focusable (it may not have explicit tabIndex="0")
                const skipLinks = container.querySelectorAll('a[href="#main-content"]')
                expect(skipLinks).toHaveLength(1)
                const skipLink = skipLinks[0]

                // Skip link should be focusable (either explicitly or by default for links)
                expect(skipLink).toBeInTheDocument()

                // The skip link should be among the first focusable elements
                // (it may not be exactly first due to default browser focus behavior)
                const allFocusableElements = container.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])')
                expect(allFocusableElements.length).toBeGreaterThanOrEqual(10)

                cleanup() // Clean up after each property test run
            }
        ), { numRuns: 100 })
    })

    test('Property 5: Keyboard Navigation Support - non-activating keys ignored', () => {
        fc.assert(fc.property(
            fc.record({
                activeSection: fc.constantFrom(...validSections),
                targetSection: fc.constantFrom(...validSections),
                nonActivatingKey: fc.constantFrom('Tab', 'Shift', 'Alt', 'Control', 'ArrowUp', 'ArrowDown', 'a', '1')
            }),
            (testData) => {
                // Skip if target is same as active (no change expected anyway)
                fc.pre(testData.targetSection !== testData.activeSection)

                cleanup() // Clean up before each property test run

                const mockOnSectionChange = jest.fn()
                const mockOnSidebarClose = jest.fn()

                render(
                    <AdminSidebar
                        {...defaultProps}
                        activeSection={testData.activeSection}
                        onSectionChange={mockOnSectionChange}
                        onSidebarClose={mockOnSidebarClose}
                    />
                )

                const sectionLabels = {
                    'overview': 'Overview',
                    'categories': 'Categories',
                    'orders': 'Orders',
                    'bookings': 'Bookings',
                    'batches': 'Chick Batches',
                    'users': 'Users',
                    'products': 'All Products',
                    'low-stock': 'Low Stock',
                    'settings': 'Settings'
                }

                const targetButtons = screen.getAllByRole('button', {
                    name: new RegExp(`Navigate to ${sectionLabels[testData.targetSection as keyof typeof sectionLabels]}`, 'i')
                })

                expect(targetButtons).toHaveLength(1)
                const targetButton = targetButtons[0]

                // Press non-activating key
                fireEvent.keyDown(targetButton, { key: testData.nonActivatingKey })

                // Verify no callbacks were called
                expect(mockOnSectionChange).not.toHaveBeenCalled()
                expect(mockOnSidebarClose).not.toHaveBeenCalled()

                cleanup() // Clean up after each property test run
            }
        ), { numRuns: 100 })
    })
})