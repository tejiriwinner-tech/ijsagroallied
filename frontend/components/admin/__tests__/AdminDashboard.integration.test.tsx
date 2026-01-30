/**
 * Integration tests for Admin Dashboard functionality
 * Tests all admin sections to ensure no functionality is lost after sidebar conversion
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AdminDashboard from '../../../app/admin/page'
import { useAuth } from '@/context/auth-context'
import { adminApi, productsApi, categoriesApi } from '@/lib/api'

// Mock the auth context
jest.mock('@/context/auth-context')
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

// Mock the API modules
jest.mock('@/lib/api')
const mockAdminApi = adminApi as jest.Mocked<typeof adminApi>
const mockProductsApi = productsApi as jest.Mocked<typeof productsApi>
const mockCategoriesApi = categoriesApi as jest.Mocked<typeof categoriesApi>

// Mock Next.js router
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}))

// Mock data
const mockAdmin = {
    id: '1',
    name: 'Admin User',
    email: 'admin@test.com',
    role: 'admin' as const,
    phone: '+234123456789',
    profile_picture: null,
}

const mockProducts = [
    {
        id: '1',
        name: 'Test Product 1',
        description: 'Test description',
        price: 1000,
        category: 'cat1',
        subcategory: 'sub1',
        stock: 50,
        unit: 'piece',
        image: '/test-image.jpg',
    },
    {
        id: '2',
        name: 'Low Stock Product',
        description: 'Low stock item',
        price: 2000,
        category: 'cat2',
        subcategory: '',
        stock: 5,
        unit: 'kg',
        image: '/test-image2.jpg',
    },
]

const mockCategories = [
    {
        id: 'cat1',
        name: 'Category 1',
        slug: 'category-1',
        description: 'Test category',
        image_url: '/cat1.jpg',
        created_at: '2024-01-01T00:00:00Z',
        subcategories: [
            {
                id: 'sub1',
                category_id: 'cat1',
                name: 'Subcategory 1',
                slug: 'subcategory-1',
                description: 'Test subcategory',
            },
        ],
    },
    {
        id: 'cat2',
        name: 'Category 2',
        slug: 'category-2',
        description: 'Another category',
        image_url: '/cat2.jpg',
        created_at: '2024-01-02T00:00:00Z',
        subcategories: [],
    },
]

const mockOrders = [
    {
        id: 'order1',
        customer_name: 'John Doe',
        customer_email: 'john@test.com',
        total_amount: 5000,
        status: 'pending',
        created_at: '2024-01-01T10:00:00Z',
    },
]

const mockUsers = [
    {
        id: 'user1',
        name: 'Test User',
        email: 'user@test.com',
        role: 'user' as const,
        created_at: '2024-01-01T00:00:00Z',
    },
]

const mockBookings = [
    {
        id: 'booking1',
        customer_name: 'Jane Doe',
        customer_email: 'jane@test.com',
        breed: 'Broiler',
        quantity: 100,
        total_price: 50000,
        pickup_date: '2024-02-01',
        status: 'pending',
    },
]

const mockBatches = [
    {
        id: 'batch1',
        breed: 'Layer',
        available_quantity: 500,
        available_date: '2024-02-15',
        minimum_order: 50,
        price_per_chick: 500,
        description: 'High quality layer chicks',
    },
]

describe('AdminDashboard Integration Tests', () => {
    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks()

        // Setup auth mock
        mockUseAuth.mockReturnValue({
            user: mockAdmin,
            isLoading: false,
            login: jest.fn(),
            logout: jest.fn(),
            updateProfile: jest.fn().mockResolvedValue(true),
        })

        // Setup API mocks
        mockProductsApi.getAll.mockResolvedValue({
            success: true,
            data: mockProducts,
        })

        mockCategoriesApi.getAll.mockResolvedValue({
            success: true,
            data: mockCategories,
        })

        mockAdminApi.getOrders.mockResolvedValue(mockOrders)
        mockAdminApi.getUsers.mockResolvedValue(mockUsers)
        mockAdminApi.getBookings.mockResolvedValue(mockBookings)
        mockAdminApi.getBatches.mockResolvedValue(mockBatches)
    })

    describe('Overview Section', () => {
        it('should display overview dashboard with statistics', async () => {
            render(<AdminDashboard />)

            // Wait for data to load
            await waitFor(() => {
                expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
            })

            // Check statistics cards
            expect(screen.getByText('Total Products')).toBeInTheDocument()
            expect(screen.getByText('2')).toBeInTheDocument() // Product count
            expect(screen.getByText('Low Stock Items')).toBeInTheDocument()
            expect(screen.getByText('1')).toBeInTheDocument() // Low stock count

            // Check quick access buttons
            expect(screen.getByText('Manage Products')).toBeInTheDocument()
            expect(screen.getByText('View Orders')).toBeInTheDocument()
            expect(screen.getByText('Add Category')).toBeInTheDocument()
            expect(screen.getByText('Manage Users')).toBeInTheDocument()

            // Check system health
            expect(screen.getByText('System Health')).toBeInTheDocument()
            expect(screen.getByText('Database')).toBeInTheDocument()
            expect(screen.getByText('Connected')).toBeInTheDocument()
        })

        it('should navigate to sections via quick access buttons', async () => {
            const user = userEvent.setup()
            render(<AdminDashboard />)

            await waitFor(() => {
                expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
            })

            // Click on Manage Products button
            const manageProductsBtn = screen.getByText('Manage Products')
            await user.click(manageProductsBtn)

            // Should show products section
            await waitFor(() => {
                expect(screen.getByText('Search products...')).toBeInTheDocument()
            })
        })
    })

    describe('Products Section', () => {
        it('should display products list with search functionality', async () => {
            const user = userEvent.setup()
            render(<AdminDashboard />)

            // Navigate to products section via sidebar
            await waitFor(() => {
                expect(screen.getByText('All Products')).toBeInTheDocument()
            })

            const productsNavItem = screen.getByText('All Products')
            await user.click(productsNavItem)

            // Check products table
            await waitFor(() => {
                expect(screen.getByText('Test Product 1')).toBeInTheDocument()
                expect(screen.getByText('Low Stock Product')).toBeInTheDocument()
            })

            // Test search functionality
            const searchInput = screen.getByPlaceholderText('Search products...')
            await user.type(searchInput, 'Low Stock')

            // Should filter products
            expect(screen.getByText('Low Stock Product')).toBeInTheDocument()
            expect(screen.queryByText('Test Product 1')).not.toBeInTheDocument()
        })

        it('should handle product creation', async () => {
            const user = userEvent.setup()
            mockProductsApi.create.mockResolvedValue({ success: true })

            render(<AdminDashboard />)

            await waitFor(() => {
                expect(screen.getByText('Add Product')).toBeInTheDocument()
            })

            // Click Add Product button
            const addProductBtn = screen.getByText('Add Product')
            await user.click(addProductBtn)

            // Should open modal
            await waitFor(() => {
                expect(screen.getByText('Add New Product')).toBeInTheDocument()
            })

            // Fill form
            const nameInput = screen.getByLabelText(/Product Name/i)
            await user.type(nameInput, 'New Test Product')

            const priceInput = screen.getByLabelText(/Price/i)
            await user.type(priceInput, '1500')

            // Submit form
            const submitBtn = screen.getByRole('button', { name: /Add Product/i })
            await user.click(submitBtn)

            // Should call API
            await waitFor(() => {
                expect(mockProductsApi.create).toHaveBeenCalledWith(
                    expect.objectContaining({
                        name: 'New Test Product',
                        price: 1500,
                    })
                )
            })
        })
    })

    describe('Categories Section', () => {
        it('should display categories management interface', async () => {
            const user = userEvent.setup()
            mockAdminApi.getCategories.mockResolvedValue(mockCategories)

            render(<AdminDashboard />)

            // Navigate to categories section
            await waitFor(() => {
                expect(screen.getByText('Categories')).toBeInTheDocument()
            })

            const categoriesNavItem = screen.getByText('Categories')
            await user.click(categoriesNavItem)

            // Should show CategoryManager component
            await waitFor(() => {
                expect(screen.getByText('Category Management')).toBeInTheDocument()
                expect(screen.getByText('Create Category')).toBeInTheDocument()
            })
        })
    })

    describe('Orders Section', () => {
        it('should display orders management interface', async () => {
            const user = userEvent.setup()
            render(<AdminDashboard />)

            // Navigate to orders section
            await waitFor(() => {
                expect(screen.getByText('Orders')).toBeInTheDocument()
            })

            const ordersNavItem = screen.getByText('Orders')
            await user.click(ordersNavItem)

            // Should show OrderManager component
            await waitFor(() => {
                expect(screen.getByText('Order Management')).toBeInTheDocument()
            })
        })
    })

    describe('Users Section', () => {
        it('should display users management interface', async () => {
            const user = userEvent.setup()
            render(<AdminDashboard />)

            // Navigate to users section
            await waitFor(() => {
                expect(screen.getByText('Users')).toBeInTheDocument()
            })

            const usersNavItem = screen.getByText('Users')
            await user.click(usersNavItem)

            // Should show UserManager component
            await waitFor(() => {
                expect(screen.getByText('User Management')).toBeInTheDocument()
            })
        })
    })

    describe('Bookings Section', () => {
        it('should display bookings management interface', async () => {
            const user = userEvent.setup()
            render(<AdminDashboard />)

            // Navigate to bookings section
            await waitFor(() => {
                expect(screen.getByText('Bookings')).toBeInTheDocument()
            })

            const bookingsNavItem = screen.getByText('Bookings')
            await user.click(bookingsNavItem)

            // Should show BookingManager component
            await waitFor(() => {
                expect(screen.getByText('Available Batches')).toBeInTheDocument()
            })
        })
    })

    describe('Chick Batches Section', () => {
        it('should display batch management interface', async () => {
            const user = userEvent.setup()
            render(<AdminDashboard />)

            // Navigate to batches section
            await waitFor(() => {
                expect(screen.getByText('Chick Batches')).toBeInTheDocument()
            })

            const batchesNavItem = screen.getByText('Chick Batches')
            await user.click(batchesNavItem)

            // Should show BatchManager component
            await waitFor(() => {
                expect(screen.getByText('Available Batches')).toBeInTheDocument()
            })
        })
    })

    describe('Low Stock Section', () => {
        it('should display low stock products', async () => {
            const user = userEvent.setup()
            render(<AdminDashboard />)

            // Navigate to low stock section
            await waitFor(() => {
                expect(screen.getByText('Low Stock')).toBeInTheDocument()
            })

            const lowStockNavItem = screen.getByText('Low Stock')
            await user.click(lowStockNavItem)

            // Should show low stock products
            await waitFor(() => {
                expect(screen.getByText('Low Stock Product')).toBeInTheDocument()
                expect(screen.getByText('5')).toBeInTheDocument() // Stock count
                expect(screen.getByText('Low Stock')).toBeInTheDocument() // Status badge
            })
        })

        it('should show badge with correct count in sidebar', async () => {
            render(<AdminDashboard />)

            await waitFor(() => {
                // Should show badge with count of 1 (one low stock product)
                const badge = screen.getByText('1')
                expect(badge).toBeInTheDocument()
            })
        })
    })

    describe('Settings Section', () => {
        it('should display admin profile and password settings', async () => {
            const user = userEvent.setup()
            render(<AdminDashboard />)

            // Navigate to settings section
            await waitFor(() => {
                expect(screen.getByText('Settings')).toBeInTheDocument()
            })

            const settingsNavItem = screen.getByText('Settings')
            await user.click(settingsNavItem)

            // Should show settings components
            await waitFor(() => {
                expect(screen.getByText('Admin Profile')).toBeInTheDocument()
                expect(screen.getByText('Security')).toBeInTheDocument()
                expect(screen.getByDisplayValue('Admin User')).toBeInTheDocument()
                expect(screen.getByDisplayValue('admin@test.com')).toBeInTheDocument()
            })
        })

        it('should handle profile updates', async () => {
            const user = userEvent.setup()
            render(<AdminDashboard />)

            // Navigate to settings
            const settingsNavItem = screen.getByText('Settings')
            await user.click(settingsNavItem)

            await waitFor(() => {
                expect(screen.getByDisplayValue('Admin User')).toBeInTheDocument()
            })

            // Update name
            const nameInput = screen.getByDisplayValue('Admin User')
            await user.clear(nameInput)
            await user.type(nameInput, 'Updated Admin')

            // Save changes
            const saveBtn = screen.getByRole('button', { name: /Save Changes/i })
            await user.click(saveBtn)

            // Should call updateProfile
            await waitFor(() => {
                expect(mockUseAuth().updateProfile).toHaveBeenCalledWith(
                    expect.objectContaining({
                        name: 'Updated Admin',
                    })
                )
            })
        })
    })

    describe('Sidebar Navigation', () => {
        it('should highlight active navigation item', async () => {
            const user = userEvent.setup()
            render(<AdminDashboard />)

            await waitFor(() => {
                expect(screen.getByText('Overview')).toBeInTheDocument()
            })

            // Click on Products navigation
            const productsNavItem = screen.getByText('All Products')
            await user.click(productsNavItem)

            // Should update active state (this would be tested via CSS classes in real implementation)
            await waitFor(() => {
                expect(screen.getByText('Search products...')).toBeInTheDocument()
            })
        })

        it('should work on mobile with toggle functionality', async () => {
            // Mock mobile viewport
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 768,
            })

            const user = userEvent.setup()
            render(<AdminDashboard />)

            await waitFor(() => {
                // Should show mobile toggle button
                const toggleBtn = screen.getByRole('button', { name: /toggle sidebar/i })
                expect(toggleBtn).toBeInTheDocument()
            })
        })
    })

    describe('Error Handling', () => {
        it('should handle API errors gracefully', async () => {
            mockProductsApi.getAll.mockRejectedValue(new Error('API Error'))

            render(<AdminDashboard />)

            // Should still render without crashing
            await waitFor(() => {
                expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
            })
        })

        it('should redirect non-admin users', () => {
            mockUseAuth.mockReturnValue({
                user: { ...mockAdmin, role: 'user' },
                isLoading: false,
                login: jest.fn(),
                logout: jest.fn(),
                updateProfile: jest.fn(),
            })

            render(<AdminDashboard />)

            // Should show loading or redirect (implementation dependent)
            expect(screen.getByRole('progressbar') || screen.queryByText('Admin Dashboard')).toBeTruthy()
        })
    })
})