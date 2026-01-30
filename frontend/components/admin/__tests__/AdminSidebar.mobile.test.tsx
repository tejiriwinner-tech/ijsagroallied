/**
 * Property-Based Test: Mobile Interaction Behavior
 * Feature: admin-sidebar-navigation, Property 4: Mobile Interaction Behavior
 * Validates: Requirements 2.4, 2.5
 * 
 * For any interaction that should close the mobile sidebar (backdrop click or 
 * navigation item selection), the sidebar should close and the backdrop should be removed.
 */

import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { AdminSidebar, MobileSidebarToggle } from '../AdminSidebar'
import fc from 'fast-check'

// Mock window.matchMedia for mobile testing
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

describe('AdminSidebar Mobile Interaction Properties', () => {
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
        // Mock mobile screen size
        mockMatchMedia(false)
    })

    test('Property 4: Mobile Interaction Behavior - backdrop click closes sidebar', () => {
        fc.assert(fc.property(
            fc.record({
                activeSection: fc.constantFrom(...validSections),
                lowStockCount: fc.integer({ min: 0, max: 100 }),
                isSidebarOpen: fc.constant(true) // Only test when sidebar is open
            }),
            (testData) => {
                cleanup() // Clean up before each property test run

                const mockOnSidebarClose = jest.fn()

                const { container } = render(
                    <AdminSidebar
                        {...defaultProps}
                        activeSection={testData.activeSection}
                        lowStockCount={testData.lowStockCount}
                        isSidebarOpen={testData.isSidebarOpen}
                        onSidebarClose={mockOnSidebarClose}
                    />
                )

                // Find the backdrop
                const backdrop = screen.getByTestId('sidebar-backdrop')
                expect(backdrop).toBeInTheDocument()

                // Click the backdrop
                fireEvent.click(backdrop!)

                // Verify sidebar close callback was called
                expect(mockOnSidebarClose).toHaveBeenCalledTimes(1)

                cleanup() // Clean up after each property test run
            }
        ), { numRuns: 100 })
    })

    test('Property 4: Mobile Interaction Behavior - backdrop touch closes sidebar', () => {
        fc.assert(fc.property(
            fc.record({
                activeSection: fc.constantFrom(...validSections),
                lowStockCount: fc.integer({ min: 0, max: 50 })
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

                const backdrop = screen.getByTestId('sidebar-backdrop')
                expect(backdrop).toBeInTheDocument()

                // Touch the backdrop
                fireEvent.touchStart(backdrop!)

                // Verify sidebar close callback was called
                expect(mockOnSidebarClose).toHaveBeenCalledTimes(1)

                cleanup() // Clean up after each property test run
            }
        ), { numRuns: 100 })
    })

    test('Property 4: Mobile Interaction Behavior - navigation item click closes sidebar', () => {
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
                        isSidebarOpen={true}
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

                // Click a navigation item
                const targetButtons = screen.getAllByRole('button', {
                    name: new RegExp(`Navigate to ${sectionLabels[testData.targetSection as keyof typeof sectionLabels]}`, 'i')
                })
                const targetButton = targetButtons[0] // Use the first matching button

                fireEvent.click(targetButton)

                // Verify both section change and sidebar close were called
                expect(mockOnSectionChange).toHaveBeenCalledWith(testData.targetSection)
                expect(mockOnSidebarClose).toHaveBeenCalledTimes(1)

                cleanup() // Clean up after each property test run
            }
        ), { numRuns: 100 })
    })

    test('Property 4: Mobile Interaction Behavior - escape key closes sidebar', () => {
        fc.assert(fc.property(
            fc.record({
                activeSection: fc.constantFrom(...validSections),
                lowStockCount: fc.integer({ min: 0, max: 10 })
            }),
            (testData) => {
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

                // Test escape key on backdrop
                const backdrops = screen.getAllByTestId('sidebar-backdrop')
                const backdrop = backdrops[0] // Use the first backdrop
                expect(backdrop).toBeInTheDocument()

                fireEvent.keyDown(backdrop!, { key: 'Escape' })
                expect(mockOnSidebarClose).toHaveBeenCalledTimes(1)

                // Reset mock
                mockOnSidebarClose.mockClear()

                // Test escape key on sidebar
                const sidebar = container.querySelector('aside')
                expect(sidebar).toBeInTheDocument()

                fireEvent.keyDown(sidebar!, { key: 'Escape' })
                expect(mockOnSidebarClose).toHaveBeenCalledTimes(1)
            }
        ), { numRuns: 100 })
    })

    test('Property 4: Mobile Interaction Behavior - backdrop accessibility', () => {
        fc.assert(fc.property(
            fc.record({
                activeSection: fc.constantFrom(...validSections),
                lowStockCount: fc.integer({ min: 0, max: 5 })
            }),
            (testData) => {
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

                const backdrops = screen.getAllByTestId('sidebar-backdrop')
                const backdrop = backdrops[0] // Use the first backdrop
                expect(backdrop).toBeInTheDocument()

                // Verify backdrop has proper accessibility attributes
                expect(backdrop).toHaveAttribute('aria-label', 'Close sidebar')
                expect(backdrop).toHaveAttribute('role', 'button')
                expect(backdrop).toHaveAttribute('tabIndex', '0')

                // Test Enter key
                fireEvent.keyDown(backdrop!, { key: 'Enter' })
                expect(mockOnSidebarClose).toHaveBeenCalledTimes(1)

                mockOnSidebarClose.mockClear()

                // Test Space key
                fireEvent.keyDown(backdrop!, { key: ' ' })
                expect(mockOnSidebarClose).toHaveBeenCalledTimes(1)
            }
        ), { numRuns: 100 })
    })

    test('Property 4: Mobile Interaction Behavior - mobile toggle button functionality', () => {
        fc.assert(fc.property(
            fc.record({
                isSidebarOpen: fc.boolean()
            }),
            (testData) => {
                const mockOnToggle = jest.fn()

                render(
                    <MobileSidebarToggle
                        isSidebarOpen={testData.isSidebarOpen}
                        onToggle={mockOnToggle}
                    />
                )

                const toggleButton = screen.getByRole('button', {
                    name: testData.isSidebarOpen ? /close sidebar/i : /open sidebar/i
                })

                // Verify button has proper accessibility attributes
                const expectedLabel = testData.isSidebarOpen ? 'Close sidebar' : 'Open sidebar'
                expect(toggleButton).toHaveAttribute('aria-label', expectedLabel)

                // Verify button styling
                expect(toggleButton).toHaveClass('hover:bg-muted')
                expect(toggleButton).toHaveClass('transition-all')

                // Click the toggle button
                fireEvent.click(toggleButton)
                expect(mockOnToggle).toHaveBeenCalledTimes(1)

                // Verify icon is present
                const icon = toggleButton.querySelector('svg')
                expect(icon).toBeInTheDocument()
                expect(icon).toHaveClass('w-5')
                expect(icon).toHaveClass('h-5')
                expect(icon).toHaveClass('transition-transform')
                expect(icon).toHaveClass('duration-200')
            }
        ), { numRuns: 100 })
    })

    test('Property 4: Mobile Interaction Behavior - backdrop only present when sidebar open', () => {
        fc.assert(fc.property(
            fc.record({
                isSidebarOpen: fc.boolean(),
                activeSection: fc.constantFrom(...validSections)
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
                    expect(backdrop).toBeInTheDocument()
                    expect(backdrop).toHaveClass('lg:hidden')
                    expect(backdrop).toHaveClass('z-30')
                    expect(backdrop).toHaveClass('transition-opacity')
                    expect(backdrop).toHaveClass('duration-300')
                } else {
                    expect(backdrop).not.toBeInTheDocument()
                }
            }
        ), { numRuns: 100 })
    })
})