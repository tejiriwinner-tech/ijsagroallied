/**
 * Property-Based Test: Navigation Item Interaction
 * Feature: admin-sidebar-navigation, Property 1: Navigation Item Interaction
 * Validates: Requirements 1.2, 1.3
 * 
 * For any navigation item in the sidebar, when clicked, the dashboard should switch 
 * to the corresponding content section and highlight that item with active styling 
 * while removing highlighting from previously active items.
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { AdminSidebar } from '../AdminSidebar'
import fc from 'fast-check'

describe('AdminSidebar Navigation Item Interaction Properties', () => {
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
    })

    test('Property 1: Navigation Item Interaction - clicking any item triggers section change', () => {
        fc.assert(fc.property(
            fc.record({
                initialSection: fc.constantFrom(...validSections),
                targetSection: fc.constantFrom(...validSections),
                lowStockCount: fc.integer({ min: 0, max: 100 })
            }),
            (testData) => {
                const mockOnSectionChange = jest.fn()
                const mockOnSidebarClose = jest.fn()

                render(
                    <AdminSidebar
                        {...defaultProps}
                        activeSection={testData.initialSection}
                        onSectionChange={mockOnSectionChange}
                        onSidebarClose={mockOnSidebarClose}
                        lowStockCount={testData.lowStockCount}
                    />
                )

                // Find the target navigation item by its label
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

                const targetButton = screen.getByRole('button', {
                    name: new RegExp(`Navigate to ${sectionLabels[testData.targetSection as keyof typeof sectionLabels]}`, 'i')
                })

                // Click the navigation item
                fireEvent.click(targetButton)

                // Verify section change callback was called with correct section
                expect(mockOnSectionChange).toHaveBeenCalledWith(testData.targetSection)
                expect(mockOnSectionChange).toHaveBeenCalledTimes(1)

                // Verify sidebar close callback was called (for mobile behavior)
                expect(mockOnSidebarClose).toHaveBeenCalledTimes(1)
            }
        ), { numRuns: 100 })
    })

    test('Property 1: Navigation Item Interaction - active item has correct styling', () => {
        fc.assert(fc.property(
            fc.record({
                activeSection: fc.constantFrom(...validSections),
                lowStockCount: fc.integer({ min: 0, max: 50 })
            }),
            (testData) => {
                render(
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

                // Find the active navigation item
                const activeButton = screen.getByRole('button', {
                    name: new RegExp(`Navigate to ${sectionLabels[testData.activeSection as keyof typeof sectionLabels]}`, 'i')
                })

                // Verify active item has correct aria-current attribute
                expect(activeButton).toHaveAttribute('aria-current', 'page')

                // Verify active item has primary background styling
                expect(activeButton).toHaveClass('bg-primary')
                expect(activeButton).toHaveClass('text-white')
                expect(activeButton).toHaveClass('shadow-md')
                expect(activeButton).toHaveClass('shadow-primary/20')

                // Verify non-active items don't have active styling
                validSections.forEach(section => {
                    if (section !== testData.activeSection) {
                        const inactiveButton = screen.getByRole('button', {
                            name: new RegExp(`Navigate to ${sectionLabels[section as keyof typeof sectionLabels]}`, 'i')
                        })
                        expect(inactiveButton).not.toHaveAttribute('aria-current', 'page')
                        expect(inactiveButton).not.toHaveClass('bg-primary')
                        expect(inactiveButton).toHaveClass('text-foreground')
                    }
                })
            }
        ), { numRuns: 100 })
    })

    test('Property 1: Navigation Item Interaction - badge display behavior', () => {
        fc.assert(fc.property(
            fc.record({
                activeSection: fc.constantFrom('low-stock', 'overview', 'categories'),
                lowStockCount: fc.integer({ min: 0, max: 100 })
            }),
            (testData) => {
                render(
                    <AdminSidebar
                        {...defaultProps}
                        activeSection={testData.activeSection}
                        lowStockCount={testData.lowStockCount}
                    />
                )

                const lowStockButton = screen.getByRole('button', {
                    name: /Navigate to Low Stock/i
                })

                if (testData.lowStockCount > 0) {
                    // Badge should be present when count > 0
                    const badge = lowStockButton.querySelector('.animate-pulse')
                    expect(badge).toBeInTheDocument()
                    expect(badge).toHaveTextContent(testData.lowStockCount.toString())

                    // Badge styling should match active state
                    if (testData.activeSection === 'low-stock') {
                        expect(badge).toHaveClass('bg-white/20')
                        expect(badge).toHaveClass('text-white')
                    } else {
                        expect(badge).toHaveClass('bg-accent')
                        expect(badge).toHaveClass('text-accent-foreground')
                    }
                } else {
                    // Badge should not be present when count is 0
                    const badge = lowStockButton.querySelector('.animate-pulse')
                    expect(badge).not.toBeInTheDocument()
                }
            }
        ), { numRuns: 100 })
    })

    test('Property 1: Navigation Item Interaction - hover effects on non-active items', () => {
        fc.assert(fc.property(
            fc.record({
                activeSection: fc.constantFrom(...validSections),
                hoverSection: fc.constantFrom(...validSections)
            }),
            (testData) => {
                // Skip if hover section is the same as active section
                fc.pre(testData.hoverSection !== testData.activeSection)

                render(
                    <AdminSidebar
                        {...defaultProps}
                        activeSection={testData.activeSection}
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

                const hoverButton = screen.getByRole('button', {
                    name: new RegExp(`Navigate to ${sectionLabels[testData.hoverSection as keyof typeof sectionLabels]}`, 'i')
                })

                // Verify non-active item has hover classes
                expect(hoverButton).toHaveClass('hover:bg-muted')
                expect(hoverButton).toHaveClass('hover:shadow-sm')
                expect(hoverButton).toHaveClass('group')

                // Verify it doesn't have active styling
                expect(hoverButton).not.toHaveClass('bg-primary')
                expect(hoverButton).not.toHaveAttribute('aria-current', 'page')
            }
        ), { numRuns: 100 })
    })
})