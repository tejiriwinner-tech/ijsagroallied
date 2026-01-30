/**
 * Basic functionality test for AdminSidebar components
 */

import { render, screen } from '@testing-library/react'
import { AdminSidebar, MobileSidebarToggle } from '../AdminSidebar'
import { NavigationItem } from '../NavigationItem'
import { NavigationBadge } from '../NavigationBadge'
import { createNavigationItems } from '../navigation-config'

describe('AdminSidebar Basic Functionality', () => {
    const defaultProps = {
        activeSection: 'overview',
        onSectionChange: jest.fn(),
        isSidebarOpen: true,
        onSidebarClose: jest.fn(),
        lowStockCount: 5
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('AdminSidebar renders without crashing', () => {
        render(<AdminSidebar {...defaultProps} />)

        expect(screen.getByText('ADMIN DASHBOARD')).toBeInTheDocument()
        expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    test('MobileSidebarToggle renders without crashing', () => {
        render(
            <MobileSidebarToggle
                isSidebarOpen={false}
                onToggle={jest.fn()}
            />
        )

        expect(screen.getByText('ADMIN DASHBOARD')).toBeInTheDocument()
        expect(screen.getByRole('button')).toBeInTheDocument()
    })

    test('NavigationBadge renders correctly', () => {
        render(<NavigationBadge count={5} isActive={false} />)

        expect(screen.getByText('5')).toBeInTheDocument()
    })

    test('NavigationBadge does not render for zero count', () => {
        const { container } = render(<NavigationBadge count={0} isActive={false} />)

        expect(container.firstChild).toBeNull()
    })

    test('NavigationItem renders correctly', () => {
        const navigationItems = createNavigationItems(5)
        const overviewItem = navigationItems[0]

        render(
            <NavigationItem
                item={overviewItem}
                isActive={true}
                onClick={jest.fn()}
            />
        )

        expect(screen.getByRole('button')).toBeInTheDocument()
        expect(screen.getByText('Overview')).toBeInTheDocument()
    })

    test('createNavigationItems returns correct structure', () => {
        const items = createNavigationItems(10)

        expect(items).toHaveLength(9)
        expect(items[0].id).toBe('overview')
        expect(items[7].id).toBe('low-stock')
        expect(items[7].badge).toBe(10)
    })

    test('createNavigationItems handles zero low stock count', () => {
        const items = createNavigationItems(0)

        const lowStockItem = items.find(item => item.id === 'low-stock')
        expect(lowStockItem?.badge).toBeUndefined()
    })
})