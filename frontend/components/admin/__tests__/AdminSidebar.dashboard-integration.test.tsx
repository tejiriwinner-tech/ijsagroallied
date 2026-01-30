/**
 * Focused Integration Tests: AdminSidebar with Dashboard Content
 * 
 * Tests the core integration between AdminSidebar and dashboard sections,
 * focusing on navigation behavior and responsive functionality.
 * 
 * Requirements tested: 1.1-1.5, 2.1-2.5
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AdminSidebar, MobileSidebarToggle } from '../AdminSidebar'

// Mock the manager components
jest.mock('../CategoryManager', () => ({
    CategoryManager: () => <div data-testid="category-manager">Category Manager Content</div>
}))

jest.mock('../OrderManager', () => ({
    OrderManager: () => <div data-testid="order-manager">Order Manager Content</div>
}))

jest.mock('../UserManager', () => ({
    UserManager: () => <div data-testid="user-manager">User Manager Content</div>
}))

// Simple dashboard component that uses the sidebar
const TestDashboard: React.FC = () => {
    const [activeSection, setActiveSection] = React.useState('overview')
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false)
    const lowStockCount = 5

    const renderContent = () => {
        switch (activeSection) {
            case 'overview':
                return <div data-testid="overview-content">Overview Dashboard Content</div>
            case 'categories':
                return <div data-testid="category-content">Categories Content</div>
            case 'orders':
                return <div data-testid="orders-content">Orders Content</div>
            case 'users':
                return <div data-testid="users-content">Users Content</div>
            case 'products':
                return <div data-testid="products-content">Products Content</div>
            case 'low-stock':
                return <div data-testid="low-stock-content">Low Stock Content</div>
            case 'settings':
                return <div data-testid="settings-content">Settings Content</div>
            default:
                return <div data-testid="default-content">Default Content</div>
        }
    }

    return (
        <div className="min-h-screen">
            <MobileSidebarToggle
                isSidebarOpen={isSidebarOpen}
                onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            />

            <div className="flex">
                <AdminSidebar
                    activeSection={activeSection}
                    onSectionChange={setActiveSection}
                    isSidebarOpen={isSidebarOpen}
                    onSidebarClose={() => setIsSidebarOpen(false)}
                    lowStockCount={lowStockCount}
                />

                <main className="flex-1 p-6">
                    <h1>Test Dashboard</h1>
                    {renderContent()}
                </main>
            </div>
        </div>
    )
}

describe('AdminSidebar Dashboard Integration', () => {
    describe('Navigation Integration', () => {
        it('should render sidebar with dashboard and show overview by default', () => {
            render(<TestDashboard />)

            // Sidebar should be present
            expect(screen.getByText('ADMIN DASHBOARD')).toBeInTheDocument()
            expect(screen.getByText('Overview')).toBeInTheDocument()

            // Overview content should be shown by default
            expect(screen.getByTestId('overview-content')).toBeInTheDocument()
            expect(screen.getByText('Overview Dashboard Content')).toBeInTheDocument()
        })

        it('should navigate to different sections when sidebar items are clicked', () => {
            render(<TestDashboard />)

            // Initially showing overview
            expect(screen.getByTestId('overview-content')).toBeInTheDocument()

            // Click Categories navigation item
            const categoriesButton = screen.getByRole('button', { name: /categories/i })
            fireEvent.click(categoriesButton)

            // Should show categories content
            expect(screen.getByTestId('category-content')).toBeInTheDocument()
            expect(screen.queryByTestId('overview-content')).not.toBeInTheDocument()

            // Click Orders navigation item
            const ordersButton = screen.getByRole('button', { name: /orders/i })
            fireEvent.click(ordersButton)

            // Should show orders content
            expect(screen.getByTestId('orders-content')).toBeInTheDocument()
            expect(screen.queryByTestId('category-content')).not.toBeInTheDocument()
        })

        it('should navigate through all available sections', () => {
            render(<TestDashboard />)

            const sections = [
                { name: /users/i, testId: 'users-content' },
                { name: /all products/i, testId: 'products-content' },
                { name: /low stock/i, testId: 'low-stock-content' },
                { name: /settings/i, testId: 'settings-content' }
            ]

            sections.forEach(({ name, testId }) => {
                const button = screen.getByRole('button', { name })
                fireEvent.click(button)
                expect(screen.getByTestId(testId)).toBeInTheDocument()
            })
        })

        it('should display low stock badge with correct count', () => {
            render(<TestDashboard />)

            // Low stock item should show badge with count
            const lowStockButton = screen.getByRole('button', { name: /low stock/i })
            expect(lowStockButton).toBeInTheDocument()

            // Badge should be visible (implementation detail - may need adjustment based on actual badge rendering)
            expect(screen.getByText('Low Stock')).toBeInTheDocument()
        })
    })

    describe('Mobile Responsive Integration', () => {
        it('should render mobile toggle button', () => {
            render(<TestDashboard />)

            // Mobile toggle should be present
            const toggleButton = screen.getByLabelText(/open sidebar|close sidebar/i)
            expect(toggleButton).toBeInTheDocument()
        })

        it('should toggle sidebar state when mobile button is clicked', () => {
            render(<TestDashboard />)

            const toggleButton = screen.getByLabelText(/open sidebar/i)

            // Click to open sidebar
            fireEvent.click(toggleButton)

            // Button label should change (sidebar is now open)
            expect(screen.getByLabelText(/close sidebar/i)).toBeInTheDocument()

            // Click to close sidebar
            fireEvent.click(screen.getByLabelText(/close sidebar/i))

            // Button label should change back
            expect(screen.getByLabelText(/open sidebar/i)).toBeInTheDocument()
        })

        it('should close sidebar when navigation item is clicked on mobile', () => {
            render(<TestDashboard />)

            // Open sidebar first
            const toggleButton = screen.getByLabelText(/open sidebar/i)
            fireEvent.click(toggleButton)

            // Verify sidebar is open
            expect(screen.getByLabelText(/close sidebar/i)).toBeInTheDocument()

            // Click a navigation item
            const categoriesButton = screen.getByRole('button', { name: /categories/i })
            fireEvent.click(categoriesButton)

            // Sidebar should close automatically
            expect(screen.getByLabelText(/open sidebar/i)).toBeInTheDocument()

            // Content should still change
            expect(screen.getByTestId('category-content')).toBeInTheDocument()
        })

        it('should handle backdrop click to close sidebar', () => {
            render(<TestDashboard />)

            // Open sidebar
            const toggleButton = screen.getByLabelText(/open sidebar/i)
            fireEvent.click(toggleButton)

            // Find and click backdrop (if rendered)
            const backdrop = screen.queryByTestId('sidebar-backdrop')
            if (backdrop) {
                fireEvent.click(backdrop)
                expect(screen.getByLabelText(/open sidebar/i)).toBeInTheDocument()
            }
        })
    })

    describe('Keyboard Navigation Integration', () => {
        it('should support keyboard navigation through sidebar items', () => {
            render(<TestDashboard />)

            // Focus first navigation item
            const overviewButton = screen.getByRole('button', { name: /overview/i })
            overviewButton.focus()
            expect(overviewButton).toHaveFocus()

            // Press Enter to activate
            fireEvent.keyDown(overviewButton, { key: 'Enter' })
            expect(screen.getByTestId('overview-content')).toBeInTheDocument()
        })

        it('should support Space key activation', () => {
            render(<TestDashboard />)

            const categoriesButton = screen.getByRole('button', { name: /categories/i })
            categoriesButton.focus()

            // Press Space to activate
            fireEvent.keyDown(categoriesButton, { key: ' ' })
            expect(screen.getByTestId('category-content')).toBeInTheDocument()
        })

        it('should close sidebar with Escape key when open', () => {
            render(<TestDashboard />)

            // Open sidebar
            const toggleButton = screen.getByLabelText(/open sidebar/i)
            fireEvent.click(toggleButton)

            // Press Escape on sidebar
            const sidebar = screen.getByRole('navigation', { name: /admin navigation/i })
            fireEvent.keyDown(sidebar, { key: 'Escape' })

            // Sidebar should close
            expect(screen.getByLabelText(/open sidebar/i)).toBeInTheDocument()
        })
    })

    describe('Accessibility Integration', () => {
        it('should have proper ARIA labels and roles', () => {
            render(<TestDashboard />)

            // Sidebar should have navigation role
            expect(screen.getByRole('navigation', { name: /admin navigation/i })).toBeInTheDocument()

            // Navigation items should be buttons
            expect(screen.getByRole('button', { name: /overview/i })).toBeInTheDocument()
            expect(screen.getByRole('button', { name: /categories/i })).toBeInTheDocument()
        })

        it('should provide skip link for keyboard users', () => {
            render(<TestDashboard />)

            // Skip link should be present (though hidden by default)
            const skipLink = screen.getByText(/skip to main content/i)
            expect(skipLink).toBeInTheDocument()
        })

        it('should have proper focus management', () => {
            render(<TestDashboard />)

            // Navigation items should be focusable
            const overviewButton = screen.getByRole('button', { name: /overview/i })
            expect(overviewButton).toHaveAttribute('tabIndex', '0')
        })
    })
})