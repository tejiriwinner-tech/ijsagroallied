/**
 * Property-Based Test: Badge Display Behavior
 * Feature: admin-sidebar-navigation, Property 6: Badge Display Behavior
 * Validates: Requirements 7.1, 7.2
 * 
 * For any low stock count value, the Low Stock navigation item should display a badge 
 * when count > 0 and hide the badge when count = 0, with the badge updating automatically 
 * when the count changes.
 */

import { render, screen } from '@testing-library/react'
import { AdminSidebar } from '../AdminSidebar'
import { NavigationBadge } from '../NavigationBadge'
import fc from 'fast-check'

describe('AdminSidebar Badge Display Properties', () => {
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

    test('Property 6: Badge Display Behavior - badge appears when count > 0', () => {
        fc.assert(fc.property(
            fc.record({
                activeSection: fc.constantFrom(...validSections),
                lowStockCount: fc.integer({ min: 1, max: 100 }) // Only positive counts
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

                // Badge should be present when count > 0
                const badge = lowStockButton.querySelector('[title*="requiring attention"]')
                expect(badge).toBeInTheDocument()
                expect(badge).toHaveTextContent(testData.lowStockCount.toString())

                // Verify badge has proper accessibility attributes
                expect(badge).toHaveAttribute('title', `${testData.lowStockCount} item${testData.lowStockCount !== 1 ? 's' : ''} requiring attention`)
                expect(badge).toHaveAttribute('aria-label', `${testData.lowStockCount} item${testData.lowStockCount !== 1 ? 's' : ''} requiring attention`)

                // Verify badge styling
                expect(badge).toHaveClass('animate-pulse')
                expect(badge).toHaveClass('font-semibold')
                expect(badge).toHaveClass('transition-all')
                expect(badge).toHaveClass('duration-200')
            }
        ), { numRuns: 100 })
    })

    test('Property 6: Badge Display Behavior - badge hidden when count = 0', () => {
        fc.assert(fc.property(
            fc.record({
                activeSection: fc.constantFrom(...validSections),
                lowStockCount: fc.constant(0) // Only zero count
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

                // Badge should not be present when count = 0
                const badge = lowStockButton.querySelector('[title*="requiring attention"]')
                expect(badge).not.toBeInTheDocument()
            }
        ), { numRuns: 100 })
    })

    test('Property 6: Badge Display Behavior - badge hidden when count < 0', () => {
        fc.assert(fc.property(
            fc.record({
                activeSection: fc.constantFrom(...validSections),
                lowStockCount: fc.integer({ min: -100, max: -1 }) // Only negative counts
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

                // Badge should not be present when count < 0
                const badge = lowStockButton.querySelector('[title*="requiring attention"]')
                expect(badge).not.toBeInTheDocument()
            }
        ), { numRuns: 100 })
    })

    test('Property 6: Badge Display Behavior - badge styling matches active state', () => {
        fc.assert(fc.property(
            fc.record({
                activeSection: fc.constantFrom('low-stock', 'overview', 'categories'),
                lowStockCount: fc.integer({ min: 1, max: 50 })
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

                const badge = lowStockButton.querySelector('[title*="requiring attention"]')
                expect(badge).toBeInTheDocument()

                // Badge styling should match active state
                if (testData.activeSection === 'low-stock') {
                    expect(badge).toHaveClass('bg-white/20')
                    expect(badge).toHaveClass('text-white')
                    expect(badge).toHaveClass('border-white/30')
                } else {
                    expect(badge).toHaveClass('bg-accent')
                    expect(badge).toHaveClass('text-accent-foreground')
                }
            }
        ), { numRuns: 100 })
    })

    test('Property 6: Badge Display Behavior - large count display (99+ cap)', () => {
        fc.assert(fc.property(
            fc.record({
                activeSection: fc.constantFrom(...validSections),
                lowStockCount: fc.integer({ min: 100, max: 1000 }) // Large counts
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

                const badge = lowStockButton.querySelector('[title*="requiring attention"]')
                expect(badge).toBeInTheDocument()

                // Large counts should be capped at 99+
                expect(badge).toHaveTextContent('99+')

                // But the title should show the actual count
                expect(badge).toHaveAttribute('title', `${testData.lowStockCount} items requiring attention`)
            }
        ), { numRuns: 100 })
    })

    test('Property 6: Badge Display Behavior - NavigationBadge component standalone', () => {
        fc.assert(fc.property(
            fc.record({
                count: fc.integer({ min: -10, max: 150 }),
                isActive: fc.boolean()
            }),
            (testData) => {
                const { container } = render(
                    <NavigationBadge
                        count={testData.count}
                        isActive={testData.isActive}
                    />
                )

                if (testData.count <= 0) {
                    // Badge should not render for count <= 0
                    expect(container.firstChild).toBeNull()
                } else {
                    // Badge should render for count > 0
                    const badge = container.firstChild
                    expect(badge).toBeInTheDocument()

                    // Verify content
                    const displayText = testData.count > 99 ? '99+' : testData.count.toString()
                    expect(badge).toHaveTextContent(displayText)

                    // Verify accessibility
                    const itemText = testData.count === 1 ? 'item' : 'items'
                    expect(badge).toHaveAttribute('title', `${testData.count} ${itemText} requiring attention`)
                    expect(badge).toHaveAttribute('aria-label', `${testData.count} ${itemText} requiring attention`)

                    // Verify styling based on active state
                    if (testData.isActive) {
                        expect(badge).toHaveClass('bg-white/20')
                        expect(badge).toHaveClass('text-white')
                    } else {
                        expect(badge).toHaveClass('bg-accent')
                        expect(badge).toHaveClass('text-accent-foreground')
                    }
                }
            }
        ), { numRuns: 100 })
    })

    test('Property 6: Badge Display Behavior - only Low Stock item has badge', () => {
        fc.assert(fc.property(
            fc.record({
                activeSection: fc.constantFrom(...validSections),
                lowStockCount: fc.integer({ min: 1, max: 25 })
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

                // Check each navigation item
                Object.entries(sectionLabels).forEach(([sectionId, sectionLabel]) => {
                    const button = screen.getByRole('button', {
                        name: new RegExp(`Navigate to ${sectionLabel}`, 'i')
                    })

                    const badge = button.querySelector('[title*="requiring attention"]')

                    if (sectionId === 'low-stock') {
                        // Only Low Stock should have a badge
                        expect(badge).toBeInTheDocument()
                    } else {
                        // All other sections should not have badges
                        expect(badge).not.toBeInTheDocument()
                    }
                })
            }
        ), { numRuns: 100 })
    })
})