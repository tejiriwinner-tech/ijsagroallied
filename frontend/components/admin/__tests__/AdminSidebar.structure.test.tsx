/**
 * Property-Based Test: Navigation Item Structure
 * Feature: admin-sidebar-navigation, Property 2: Navigation Item Structure
 * Validates: Requirements 1.4
 * 
 * For any navigation item in the sidebar, it should include an associated icon 
 * and proper accessibility attributes.
 */

import { render, screen } from '@testing-library/react'
import { AdminSidebar } from '../AdminSidebar'
import { createNavigationItems } from '../navigation-config'
import fc from 'fast-check'

describe('AdminSidebar Navigation Item Structure Properties', () => {
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

    test('Property 2: Navigation Item Structure - all items have icons and accessibility attributes', () => {
        fc.assert(fc.property(
            fc.record({
                activeSection: fc.constantFrom(...validSections),
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

                const navigationItems = createNavigationItems(testData.lowStockCount)

                navigationItems.forEach(item => {
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

                    const button = screen.getByRole('button', {
                        name: new RegExp(`Navigate to ${sectionLabels[item.id as keyof typeof sectionLabels]}`, 'i')
                    })

                    // Verify button has proper accessibility attributes
                    expect(button).toHaveAttribute('aria-label', `Navigate to ${item.label}`)
                    expect(button).toHaveAttribute('title', item.description)

                    // Verify active state accessibility
                    if (item.id === testData.activeSection) {
                        expect(button).toHaveAttribute('aria-current', 'page')
                    } else {
                        expect(button).not.toHaveAttribute('aria-current', 'page')
                    }

                    // Verify icon is present (SVG element)
                    const icon = button.querySelector('svg')
                    expect(icon).toBeInTheDocument()
                    expect(icon).toHaveClass('w-5', 'h-5')

                    // Verify label text is present
                    expect(button).toHaveTextContent(item.label)

                    // Verify button structure classes
                    expect(button).toHaveClass('w-full')
                    expect(button).toHaveClass('flex')
                    expect(button).toHaveClass('items-center')
                    expect(button).toHaveClass('gap-3')
                    expect(button).toHaveClass('px-4')
                    expect(button).toHaveClass('py-3')
                    expect(button).toHaveClass('rounded-xl')
                    expect(button).toHaveClass('transition-all')
                    expect(button).toHaveClass('group')
                })
            }
        ), { numRuns: 100 })
    })

    test('Property 2: Navigation Item Structure - icon styling matches active state', () => {
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

                const navigationItems = createNavigationItems(testData.lowStockCount)

                navigationItems.forEach(item => {
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

                    const button = screen.getByRole('button', {
                        name: new RegExp(`Navigate to ${sectionLabels[item.id as keyof typeof sectionLabels]}`, 'i')
                    })

                    const icon = button.querySelector('svg')
                    expect(icon).toBeInTheDocument()

                    // Verify icon has proper styling classes
                    expect(icon).toHaveClass('w-5')
                    expect(icon).toHaveClass('h-5')
                    expect(icon).toHaveClass('transition-transform')
                    expect(icon).toHaveClass('duration-200')
                    expect(icon).toHaveClass('group-hover:scale-110')

                    // Verify icon color classes based on active state
                    if (item.id === testData.activeSection) {
                        expect(icon).toHaveClass('text-white')
                    } else {
                        expect(icon).toHaveClass('text-muted-foreground')
                        expect(icon).toHaveClass('group-hover:text-foreground')
                    }
                })
            }
        ), { numRuns: 100 })
    })

    test('Property 2: Navigation Item Structure - label styling and positioning', () => {
        fc.assert(fc.property(
            fc.record({
                activeSection: fc.constantFrom(...validSections),
                lowStockCount: fc.integer({ min: 0, max: 25 })
            }),
            (testData) => {
                render(
                    <AdminSidebar
                        {...defaultProps}
                        activeSection={testData.activeSection}
                        lowStockCount={testData.lowStockCount}
                    />
                )

                const navigationItems = createNavigationItems(testData.lowStockCount)

                navigationItems.forEach(item => {
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

                    const button = screen.getByRole('button', {
                        name: new RegExp(`Navigate to ${sectionLabels[item.id as keyof typeof sectionLabels]}`, 'i')
                    })

                    // Find the label span element
                    const labelSpan = button.querySelector('span')
                    expect(labelSpan).toBeInTheDocument()
                    expect(labelSpan).toHaveTextContent(item.label)

                    // Verify label styling classes
                    expect(labelSpan).toHaveClass('font-medium')
                    expect(labelSpan).toHaveClass('flex-1')
                    expect(labelSpan).toHaveClass('text-left')
                    expect(labelSpan).toHaveClass('transition-colors')
                    expect(labelSpan).toHaveClass('duration-200')

                    // Verify label color based on active state
                    if (item.id === testData.activeSection) {
                        expect(labelSpan).toHaveClass('text-white')
                    } else {
                        expect(labelSpan).toHaveClass('text-foreground')
                    }
                })
            }
        ), { numRuns: 100 })
    })

    test('Property 2: Navigation Item Structure - hover indicator presence', () => {
        fc.assert(fc.property(
            fc.record({
                activeSection: fc.constantFrom(...validSections),
                lowStockCount: fc.integer({ min: 0, max: 10 })
            }),
            (testData) => {
                render(
                    <AdminSidebar
                        {...defaultProps}
                        activeSection={testData.activeSection}
                        lowStockCount={testData.lowStockCount}
                    />
                )

                const navigationItems = createNavigationItems(testData.lowStockCount)

                navigationItems.forEach(item => {
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

                    const button = screen.getByRole('button', {
                        name: new RegExp(`Navigate to ${sectionLabels[item.id as keyof typeof sectionLabels]}`, 'i')
                    })

                    // Find the hover indicator div
                    const hoverIndicator = button.querySelector('div')
                    expect(hoverIndicator).toBeInTheDocument()

                    // Verify hover indicator styling
                    expect(hoverIndicator).toHaveClass('absolute')
                    expect(hoverIndicator).toHaveClass('left-0')
                    expect(hoverIndicator).toHaveClass('top-1/2')
                    expect(hoverIndicator).toHaveClass('-translate-y-1/2')
                    expect(hoverIndicator).toHaveClass('w-1')
                    expect(hoverIndicator).toHaveClass('h-8')
                    expect(hoverIndicator).toHaveClass('bg-primary')
                    expect(hoverIndicator).toHaveClass('rounded-r-full')
                    expect(hoverIndicator).toHaveClass('transition-all')
                    expect(hoverIndicator).toHaveClass('duration-200')

                    // Verify hover indicator visibility based on active state
                    if (item.id === testData.activeSection) {
                        // Active items don't show hover indicator
                        expect(hoverIndicator).toHaveClass('opacity-0')
                    } else {
                        // Non-active items have hover indicator with group-hover classes
                        expect(hoverIndicator).toHaveClass('opacity-0')
                        expect(hoverIndicator).toHaveClass('group-hover:opacity-100')
                        expect(hoverIndicator).toHaveClass('group-hover:translate-x-0')
                    }
                })
            }
        ), { numRuns: 100 })
    })
})