import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CategoryManager } from '../CategoryManager'
import { adminApi } from '@/lib/api'
import type { Category, CheckProductsResponse } from '@/lib/admin-types'

// Setup jest-dom matchers
import '@testing-library/jest-dom'

// Mock the API
jest.mock('@/lib/api', () => ({
    adminApi: {
        getCategories: jest.fn(),
        createCategory: jest.fn(),
        updateCategory: jest.fn(),
        deleteCategory: jest.fn(),
        checkCategoryProducts: jest.fn(),
        createSubcategory: jest.fn(),
        updateSubcategory: jest.fn(),
        deleteSubcategory: jest.fn(),
    }
}))

const mockAdminApi = adminApi as jest.Mocked<typeof adminApi>

// Mock data
const mockCategories: Category[] = [
    {
        id: '1',
        name: 'Test Category',
        slug: 'test-category',
        description: 'Test description',
        image_url: 'https://example.com/image.jpg',
        created_at: '2024-01-01T00:00:00Z',
        subcategories: [
            {
                id: 'sub1',
                category_id: '1',
                name: 'Test Subcategory',
                slug: 'test-subcategory',
                description: 'Test sub description',
                created_at: '2024-01-01T00:00:00Z'
            }
        ]
    },
    {
        id: '2',
        name: 'Another Category',
        slug: 'another-category',
        description: 'Another description',
        image_url: null,
        created_at: '2024-01-02T00:00:00Z',
        subcategories: []
    }
]

describe('CategoryManager', () => {
    const mockOnNotification = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
        mockAdminApi.getCategories.mockResolvedValue(mockCategories)
    })

    it('renders category management interface', async () => {
        render(<CategoryManager onNotification={mockOnNotification} />)

        await waitFor(() => {
            expect(screen.getByText('Category Management')).toBeInTheDocument()
        })

        expect(screen.getByText('Manage product categories and subcategories')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /create category/i })).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Search categories...')).toBeInTheDocument()

        await waitFor(() => {
            expect(mockAdminApi.getCategories).toHaveBeenCalled()
        })
    })

    it('displays categories in table after loading', async () => {
        render(<CategoryManager onNotification={mockOnNotification} />)

        await waitFor(() => {
            expect(screen.getByText('Test Category')).toBeInTheDocument()
            expect(screen.getByText('Another Category')).toBeInTheDocument()
            expect(screen.getByText('test-category')).toBeInTheDocument()
            expect(screen.getByText('1 subcategories')).toBeInTheDocument()
            expect(screen.getByText('0 subcategories')).toBeInTheDocument()
        })
    })

    it('opens create modal when Create Category button is clicked', async () => {
        const user = userEvent.setup()
        render(<CategoryManager onNotification={mockOnNotification} />)

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /create category/i })).toBeInTheDocument()
        })

        const createButtons = screen.getAllByRole('button', { name: /create category/i })
        await user.click(createButtons[0])

        expect(screen.getByRole('heading', { name: 'Create Category' })).toBeInTheDocument()
        expect(screen.getByLabelText('Category Name *')).toBeInTheDocument()
        expect(screen.getByLabelText('Slug *')).toBeInTheDocument()
        expect(screen.getByLabelText('Description')).toBeInTheDocument()
        expect(screen.getByLabelText('Image URL')).toBeInTheDocument()
    })

    it('displays validation errors for empty required fields', async () => {
        const user = userEvent.setup()
        render(<CategoryManager onNotification={mockOnNotification} />)

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /create category/i })).toBeInTheDocument()
        })

        // Open modal - click the first "Create Category" button (the one in the header)
        const createButtons = screen.getAllByRole('button', { name: /create category/i })
        await user.click(createButtons[0])

        // Wait for modal to open and form to be visible
        await waitFor(() => {
            expect(screen.getByLabelText('Category Name *')).toBeInTheDocument()
        })

        // Clear any existing values and try to submit empty form
        const nameInput = screen.getByLabelText('Category Name *')
        const slugInput = screen.getByLabelText('Slug *')

        await user.clear(nameInput)
        await user.clear(slugInput)

        // Find and click the submit button (the second "Create Category" button in the modal)
        const submitButtons = screen.getAllByRole('button', { name: /create category/i })
        const submitButton = submitButtons[1] // The modal submit button
        await user.click(submitButton)

        // Wait for validation errors to appear
        await waitFor(() => {
            expect(screen.getByText('Name is required')).toBeInTheDocument()
        }, { timeout: 3000 })

        await waitFor(() => {
            expect(screen.getByText('Slug is required')).toBeInTheDocument()
        }, { timeout: 3000 })
    })

    it('creates category successfully', async () => {
        const user = userEvent.setup()
        const newCategory: Category = {
            id: '3',
            name: 'New Category',
            slug: 'new-category',
            description: 'New description',
            image_url: null,
            created_at: '2024-01-03T00:00:00Z',
            subcategories: []
        }

        mockAdminApi.createCategory.mockResolvedValue(newCategory)
        mockAdminApi.getCategories.mockResolvedValueOnce(mockCategories).mockResolvedValueOnce([...mockCategories, newCategory])

        render(<CategoryManager onNotification={mockOnNotification} />)

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /create category/i })).toBeInTheDocument()
        })

        // Open modal - click the first "Create Category" button (the one in the header)
        const createButtons = screen.getAllByRole('button', { name: /create category/i })
        await user.click(createButtons[0])

        // Wait for modal to open
        await waitFor(() => {
            expect(screen.getByLabelText('Category Name *')).toBeInTheDocument()
        })

        // Fill form
        await user.type(screen.getByLabelText('Category Name *'), 'New Category')
        await user.type(screen.getByLabelText('Description'), 'New description')

        // Submit form - find the button inside the modal (the second "Create Category" button)
        const submitButtons = screen.getAllByRole('button', { name: /create category/i })
        const submitButton = submitButtons[1] // The modal submit button
        await user.click(submitButton)

        // Wait for API call and success notification
        await waitFor(() => {
            expect(mockAdminApi.createCategory).toHaveBeenCalledWith({
                name: 'New Category',
                slug: 'new-category',
                description: 'New description',
                image_url: ''
            })
        }, { timeout: 5000 })

        await waitFor(() => {
            expect(mockOnNotification).toHaveBeenCalledWith('Category created successfully', 'success')
        }, { timeout: 5000 })
    }, 10000)

    it('shows delete confirmation with product warning', async () => {
        const user = userEvent.setup()
        const productCheck: CheckProductsResponse = { hasProducts: true, count: 5 }
        mockAdminApi.checkCategoryProducts.mockResolvedValue(productCheck)

        render(<CategoryManager onNotification={mockOnNotification} />)

        await waitFor(() => {
            expect(screen.getByText('Test Category')).toBeInTheDocument()
        })

        // Click delete button
        const deleteButtons = screen.getAllByTitle('Delete category')
        await user.click(deleteButtons[0])

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'Delete Category' })).toBeInTheDocument()
            expect(screen.getByText(/This category has 5 product\(s\)/)).toBeInTheDocument()
            expect(screen.getByText(/Deleting this category may affect those products/)).toBeInTheDocument()
        })
    })

    it('displays error notification on API failure', async () => {
        mockAdminApi.getCategories.mockRejectedValue(new Error('API Error'))

        render(<CategoryManager onNotification={mockOnNotification} />)

        await waitFor(() => {
            expect(mockOnNotification).toHaveBeenCalledWith('API Error', 'error')
        })
    })
})