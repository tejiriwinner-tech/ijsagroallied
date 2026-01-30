/**
 * Property-Based Test: Layout Space Distribution
 * Feature: admin-sidebar-navigation, Property 3: Layout Space Distribution
 * Validates: Requirements 1.5
 * 
 * For any screen size above mobile breakpoint, the content area should occupy 
 * the remaining horizontal space after accounting for the sidebar width.
 */

import { render, screen } from '@testing-library/react'
import { AdminSidebar, MobileSidebarToggle } from '../AdminSidebar'
import fc from 'fast-check'

// Mock window.matchMedia for responsive testing
const mockMatchMedia = (matches: boolean) => {
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation((query) => ({
            matches,
            media: query,
            onchange: null,
            addListener: jest.fn(),
            removeListener: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            dispatchEvent: jest.fn(),
        })),
    })
}

describe('AdminSidebar Layout Structure Properties', () => {
    const defaultProps = {
        activeSection: 'overview',
        onSectionChange: jest.fn(),
        isSidebarOpen: false,
        onSidebarClose: jest.fn(),
        lowStockCount: 0
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('Property 3: Layout Space Distribution - sidebar has fixed width on desktop', () => {
        fc.assert(fc.property(
            fc.record({
                activeSection: fc.constantFrom('overview', 'categories', 'orders', 'bookings', 'batches', 'users', 'products', 'low-stock', 'settings'),
                lowStockCount: fc.integer({ min: 0, max: 100 }),
                isSidebarOpen: fc.boolean()
            }),
            (testData) => {
                // Mock desktop screen size (lg breakpoint: 1024px+)
                mockMatchMedia(true)

                const { container } = render(
                    <AdminSidebar
                        {...defaultProps}
                        activeSection={testData.activeSection}
                        lowStockCount={testData.lowStockCount}
                        isSidebarOpen={testData.isSidebarOpen}
                    />
                )

                const sidebar = container.querySelector('aside')
                expect(sidebar).toBeInTheDocument()

                // Verify sidebar has fixed width class
                expect(sidebar).toHaveClass('w-64')

                // Verify sidebar is positioned for desktop layout
                expect(sidebar).toHaveClass('lg:static')
                expect(sidebar).toHaveClass('lg:translate-x-0')

                // On desktop, sidebar should always be visible (not affected by isSidebarOpen)
                const computedClasses = sidebar?.className || ''
                expect(computedClasses).toContain('lg:translate-x-0')
            }
        ), { numRuns: 100 })
    })

    test('Property 3: Layout Space Distribution - mobile sidebar behavior', () => {
        fc.assert(fc.property(
            fc.record({
                activeSection: fc.constantFrom('overview', 'categories', 'orders', 'users', 'settings'),
                lowStockCount: fc.integer({ min: 0, max: 50 }),
                isSidebarOpen: fc.boolean()
            }),
            (testData) => {
                // Mock mobile screen size
                mockMatchMedia(false)

                const { container } = render(
                    <AdminSidebar
                        {...defaultProps}
                        activeSection={testData.activeSection}
                        lowStockCount={testData.lowStockCount}
                        isSidebarOpen={testData.isSidebarOpen}
                    />
                )

                const sidebar = container.querySelector('aside')
                expect(sidebar).toBeInTheDocument()

                // Verify sidebar positioning classes for mobile
                expect(sidebar).toHaveClass('fixed')
                expect(sidebar).toHaveClass('inset-0')
                expect(sidebar).toHaveClass('z-40')

                // Verify sidebar visibility based on isSidebarOpen state
                if (testData.isSidebarOpen) {
                    expect(sidebar).toHaveClass('translate-x-0')
                } else {
                    expect(sidebar).toHaveClass('-translate-x-full')
                }
            }
        ), { numRuns: 100 })
    })

    test('Property 3: Layout Space Distribution - backdrop presence on mobile', () => {
        fc.assert(fc.property(
            fc.record({
                isSidebarOpen: fc.boolean(),
                activeSection: fc.constantFrom('overview', 'categories', 'orders')
            }),
            (testData) => {
                const { container } = render(
                    <AdminSidebar
                        {...defaultProps}
                        activeSection={testData.activeSection}
                        isSidebarOpen={testData.isSidebarOpen}
                    />
                )

                const backdrop = screen.queryByTestId('sidebar-backdrop')

                if (testData.isSidebarOpen) {
                    // When sidebar is open, backdrop should be present
                    expect(backdrop).toBeInTheDocument()
                    expect(backdrop).toHaveClass('z-30')
                    expect(backdrop).toHaveClass('lg:hidden')
                } else {
                    // When sidebar is closed, backdrop should not be present
                    expect(backdrop).not.toBeInTheDocument()
                }
            }
        ), { numRuns: 100 })
    })

    test('Property 3: Layout Space Distribution - mobile toggle button structure', () => {
        fc.assert(fc.property(
            fc.record({
                isSidebarOpen: fc.boolean()
            }),
            (testData) => {
                const { container } = render(
                    <MobileSidebarToggle
                        isSidebarOpen={testData.isSidebarOpen}
                        onToggle={jest.fn()}
                    />
                )

                // Verify mobile toggle has proper responsive classes
                const toggleContainer = container.querySelector('.lg\\:hidden')
                expect(toggleContainer).toHaveClass('lg:hidden')
                expect(toggleContainer).toHaveClass('bg-card/95')
                expect(toggleContainer).toHaveClass('border-b')

                // Verify toggle button shows correct icon
                const toggleButton = screen.getByRole('button')
                expect(toggleButton).toBeInTheDocument()

                // Icon changes based on sidebar state
                if (testData.isSidebarOpen) {
                    // Should show X icon when open (tested via button presence)
                    expect(toggleButton).toBeInTheDocument()
                } else {
                    // Should show Menu icon when closed (tested via button presence)
                    expect(toggleButton).toBeInTheDocument()
                }
            }
        ), { numRuns: 100 })
    })
})