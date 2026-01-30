"use client"

import { useState, useEffect } from "react"
import { adminApi } from "@/lib/api"
import type { Category, Subcategory, CategoryInput, SubcategoryInput } from "@/lib/admin-types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { Plus, Search, Edit, Trash2, X, Save, AlertTriangle } from 'lucide-react'

// Utility function for consistent date formatting
const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

interface CategoryRowProps {
    category: Category
    onEdit: (category: Category) => void
    onDelete: (category: Category) => void
    onNotification: (message: string, type: 'success' | 'error' | 'info') => void
    onRefresh: () => void
    onCreateSubcategory: (categoryId: string) => void
    onEditSubcategory: (subcategory: Subcategory) => void
    onDeleteSubcategory: (subcategory: Subcategory) => void
}

function CategoryRow({ category, onEdit, onDelete, onNotification, onRefresh, onCreateSubcategory, onEditSubcategory, onDeleteSubcategory }: CategoryRowProps) {
    const [showSubcategories, setShowSubcategories] = useState(false)

    const handleEditSubcategory = (subcategory: Subcategory) => {
        onEditSubcategory(subcategory)
    }

    const handleDeleteSubcategory = async (subcategory: Subcategory) => {
        onDeleteSubcategory(subcategory)
    }

    return (
        <>
            <tr className="border-t border-border hover:bg-muted/50">
                <td className="p-4">
                    <div className="flex items-center gap-3">
                        {category.image_url && (
                            <img
                                src={category.image_url}
                                alt={category.name}
                                className="w-12 h-12 rounded-lg object-cover"
                            />
                        )}
                        <div>
                            <p className="font-medium">{category.name}</p>
                            <p className="text-sm text-foreground">
                                Created: {formatDate(category.created_at)}
                            </p>
                        </div>
                    </div>
                </td>
                <td className="p-4 text-foreground font-mono text-sm">{category.slug}</td>
                <td className="p-4 text-foreground max-w-xs">
                    <p className="truncate" title={category.description}>
                        {category.description || 'No description'}
                    </p>
                </td>
                <td className="p-4">
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">
                            {category.subcategories?.length || 0} subcategories
                        </span>
                        {(category.subcategories?.length || 0) > 0 && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setShowSubcategories(!showSubcategories)}
                                className="h-6 px-2 text-xs"
                            >
                                {showSubcategories ? 'Hide' : 'Show'}
                            </Button>
                        )}
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onCreateSubcategory(category.id)}
                            className="h-6 px-2 text-xs text-primary hover:text-primary"
                            title="Add subcategory"
                        >
                            <Plus className="w-3 h-3" />
                        </Button>
                    </div>
                </td>
                <td className="p-4">
                    <div className="flex items-center gap-2">
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => onEdit(category)}
                            className="h-8 w-8"
                            title="Edit category"
                        >
                            <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => onDelete(category)}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            title="Delete category"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </td>
            </tr>

            {/* Subcategories Row */}
            {showSubcategories && category.subcategories && category.subcategories.length > 0 && (
                <tr className="border-t border-border bg-muted/30">
                    <td colSpan={5} className="p-4">
                        <div className="ml-8">
                            <h4 className="font-medium text-sm mb-3 text-foreground">Subcategories:</h4>
                            <div className="space-y-2">
                                {category.subcategories.map((subcategory) => (
                                    <div key={subcategory.id} className="flex items-center justify-between p-3 bg-background rounded-lg border">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-4">
                                                <div>
                                                    <p className="font-medium text-sm">{subcategory.name}</p>
                                                    <p className="text-xs text-foreground font-mono">{subcategory.slug}</p>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm text-foreground">
                                                        {subcategory.description || 'No description'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => handleEditSubcategory(subcategory)}
                                                className="h-6 w-6"
                                                title="Edit subcategory"
                                            >
                                                <Edit className="w-3 h-3" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => handleDeleteSubcategory(subcategory)}
                                                className="h-6 w-6 text-destructive hover:text-destructive"
                                                title="Delete subcategory"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    )
}

interface CategoryManagerState {
    categories: Category[]
    isLoading: boolean
    showModal: boolean
    modalMode: 'create' | 'edit'
    selectedCategory: Category | null
    showDeleteConfirm: boolean
    deleteTarget: Category | null
    searchQuery: string
    error: string | null
    formData: CategoryInput
    formErrors: Record<string, string>
    isSubmitting: boolean
    isDeleting: boolean
    deleteWarning: { hasProducts: boolean; count: number } | null
    // Subcategory management
    showSubcategoryModal: boolean
    subcategoryModalMode: 'create' | 'edit'
    selectedSubcategory: Subcategory | null
    subcategoryFormData: SubcategoryInput
    subcategoryFormErrors: Record<string, string>
    subcategoryParentId: string
}

interface CategoryManagerProps {
    onNotification?: (message: string, type: 'success' | 'error' | 'info') => void
}

export function CategoryManager({ onNotification }: CategoryManagerProps) {
    const [state, setState] = useState<CategoryManagerState>({
        categories: [],
        isLoading: false,
        showModal: false,
        modalMode: 'create',
        selectedCategory: null,
        showDeleteConfirm: false,
        deleteTarget: null,
        searchQuery: '',
        error: null,
        formData: { name: '', slug: '', description: '', image_url: '' },
        formErrors: {},
        isSubmitting: false,
        isDeleting: false,
        deleteWarning: null,
        // Subcategory management
        showSubcategoryModal: false,
        subcategoryModalMode: 'create',
        selectedSubcategory: null,
        subcategoryFormData: { category_id: '', name: '', slug: '', description: '' },
        subcategoryFormErrors: {},
        subcategoryParentId: ''
    })

    // Load categories on component mount
    useEffect(() => {
        loadCategories()
    }, [])

    const loadCategories = async () => {
        setState(prev => ({ ...prev, isLoading: true, error: null }))
        try {
            const categories = await adminApi.getCategories()
            setState(prev => ({ ...prev, categories, isLoading: false }))
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load categories'
            setState(prev => ({ ...prev, error: errorMessage, isLoading: false }))
            onNotification?.(errorMessage, 'error')
        }
    }

    const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        onNotification?.(message, type)
    }

    // Form handling functions
    const openCreateModal = () => {
        setState(prev => ({
            ...prev,
            showModal: true,
            modalMode: 'create',
            selectedCategory: null,
            formData: { name: '', slug: '', description: '', image_url: '' },
            formErrors: {}
        }))
    }

    const openEditModal = (category: Category) => {
        setState(prev => ({
            ...prev,
            showModal: true,
            modalMode: 'edit',
            selectedCategory: category,
            formData: {
                name: category.name,
                slug: category.slug,
                description: category.description,
                image_url: category.image_url || ''
            },
            formErrors: {}
        }))
    }

    const closeModal = () => {
        setState(prev => ({
            ...prev,
            showModal: false,
            selectedCategory: null,
            formData: { name: '', slug: '', description: '', image_url: '' },
            formErrors: {},
            isSubmitting: false
        }))
    }

    const updateFormData = (field: keyof CategoryInput, value: string) => {
        setState(prev => ({
            ...prev,
            formData: { ...prev.formData, [field]: value },
            formErrors: { ...prev.formErrors, [field]: '' } // Clear error when user types
        }))

        // Auto-generate slug from name
        if (field === 'name' && value) {
            const slug = value
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim()
            setState(prev => ({
                ...prev,
                formData: { ...prev.formData, slug }
            }))
        }
    }

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {}

        if (!state.formData.name.trim()) {
            errors.name = 'Name is required'
        } else if (state.formData.name.length > 255) {
            errors.name = 'Name must be 255 characters or less'
        }

        if (!state.formData.slug.trim()) {
            errors.slug = 'Slug is required'
        } else if (state.formData.slug.length > 255) {
            errors.slug = 'Slug must be 255 characters or less'
        } else if (!/^[a-z0-9-]+$/.test(state.formData.slug)) {
            errors.slug = 'Slug must contain only lowercase letters, numbers, and hyphens'
        }

        if (state.formData.description && state.formData.description.length > 5000) {
            errors.description = 'Description must be 5000 characters or less'
        }

        if (state.formData.image_url && state.formData.image_url.length > 500) {
            errors.image_url = 'Image URL must be 500 characters or less'
        }

        // Check for duplicate slug (excluding current category in edit mode)
        const existingCategory = state.categories.find(cat =>
            cat.slug === state.formData.slug &&
            (state.modalMode === 'create' || cat.id !== state.selectedCategory?.id)
        )
        if (existingCategory) {
            errors.slug = 'A category with this slug already exists'
        }

        setState(prev => ({ ...prev, formErrors: errors }))
        return Object.keys(errors).length === 0
    }

    const handleSubmit = async () => {
        if (!validateForm()) return

        setState(prev => ({ ...prev, isSubmitting: true }))
        try {
            if (state.modalMode === 'create') {
                await adminApi.createCategory(state.formData)
                showNotification('Category created successfully', 'success')
            } else if (state.selectedCategory) {
                await adminApi.updateCategory(state.selectedCategory.id, state.formData)
                showNotification('Category updated successfully', 'success')
            }

            await loadCategories()
            closeModal()
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Operation failed'
            showNotification(errorMessage, 'error')
        } finally {
            setState(prev => ({ ...prev, isSubmitting: false }))
        }
    }

    // Delete handling functions
    const openDeleteConfirm = async (category: Category) => {
        setState(prev => ({ ...prev, isDeleting: true }))
        try {
            // Check if category has products
            const productCheck = await adminApi.checkCategoryProducts(category.id)
            setState(prev => ({
                ...prev,
                showDeleteConfirm: true,
                deleteTarget: category,
                deleteWarning: productCheck,
                isDeleting: false
            }))
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to check category products'
            showNotification(errorMessage, 'error')
            setState(prev => ({ ...prev, isDeleting: false }))
        }
    }

    const closeDeleteConfirm = () => {
        setState(prev => ({
            ...prev,
            showDeleteConfirm: false,
            deleteTarget: null,
            deleteWarning: null,
            isDeleting: false
        }))
    }

    const handleDelete = async () => {
        if (!state.deleteTarget) return

        setState(prev => ({ ...prev, isDeleting: true }))
        try {
            await adminApi.deleteCategory(state.deleteTarget.id)
            showNotification('Category deleted successfully', 'success')
            await loadCategories()
            closeDeleteConfirm()
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete category'
            showNotification(errorMessage, 'error')
        } finally {
            setState(prev => ({ ...prev, isDeleting: false }))
        }
    }

    // Subcategory management functions
    const openCreateSubcategoryModal = (categoryId: string) => {
        setState(prev => ({
            ...prev,
            showSubcategoryModal: true,
            subcategoryModalMode: 'create',
            selectedSubcategory: null,
            subcategoryParentId: categoryId,
            subcategoryFormData: { category_id: categoryId, name: '', slug: '', description: '' },
            subcategoryFormErrors: {}
        }))
    }

    const openEditSubcategoryModal = (subcategory: Subcategory) => {
        setState(prev => ({
            ...prev,
            showSubcategoryModal: true,
            subcategoryModalMode: 'edit',
            selectedSubcategory: subcategory,
            subcategoryParentId: subcategory.category_id,
            subcategoryFormData: {
                category_id: subcategory.category_id,
                name: subcategory.name,
                slug: subcategory.slug,
                description: subcategory.description || ''
            },
            subcategoryFormErrors: {}
        }))
    }

    const closeSubcategoryModal = () => {
        setState(prev => ({
            ...prev,
            showSubcategoryModal: false,
            selectedSubcategory: null,
            subcategoryParentId: '',
            subcategoryFormData: { category_id: '', name: '', slug: '', description: '' },
            subcategoryFormErrors: {},
            isSubmitting: false
        }))
    }

    const updateSubcategoryFormData = (field: keyof SubcategoryInput, value: string) => {
        setState(prev => ({
            ...prev,
            subcategoryFormData: { ...prev.subcategoryFormData, [field]: value },
            subcategoryFormErrors: { ...prev.subcategoryFormErrors, [field]: '' }
        }))

        // Auto-generate slug from name
        if (field === 'name' && value) {
            const slug = value
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim()
            setState(prev => ({
                ...prev,
                subcategoryFormData: { ...prev.subcategoryFormData, slug }
            }))
        }
    }

    const validateSubcategoryForm = (): boolean => {
        const errors: Record<string, string> = {}

        if (!state.subcategoryFormData.name.trim()) {
            errors.name = 'Name is required'
        } else if (state.subcategoryFormData.name.length > 255) {
            errors.name = 'Name must be 255 characters or less'
        }

        if (!state.subcategoryFormData.slug.trim()) {
            errors.slug = 'Slug is required'
        } else if (state.subcategoryFormData.slug.length > 255) {
            errors.slug = 'Slug must be 255 characters or less'
        } else if (!/^[a-z0-9-]+$/.test(state.subcategoryFormData.slug)) {
            errors.slug = 'Slug must contain only lowercase letters, numbers, and hyphens'
        }

        if (state.subcategoryFormData.description && state.subcategoryFormData.description.length > 5000) {
            errors.description = 'Description must be 5000 characters or less'
        }

        // Check for duplicate slug across all subcategories
        const allSubcategories = state.categories.flatMap(cat => cat.subcategories || [])
        const existingSubcategory = allSubcategories.find(sub =>
            sub.slug === state.subcategoryFormData.slug &&
            (state.subcategoryModalMode === 'create' || sub.id !== state.selectedSubcategory?.id)
        )
        if (existingSubcategory) {
            errors.slug = 'A subcategory with this slug already exists'
        }

        setState(prev => ({ ...prev, subcategoryFormErrors: errors }))
        return Object.keys(errors).length === 0
    }

    const handleSubcategorySubmit = async () => {
        if (!validateSubcategoryForm()) return

        setState(prev => ({ ...prev, isSubmitting: true }))
        try {
            if (state.subcategoryModalMode === 'create') {
                await adminApi.createSubcategory(state.subcategoryFormData)
                showNotification('Subcategory created successfully', 'success')
            } else if (state.selectedSubcategory) {
                await adminApi.updateSubcategory(state.selectedSubcategory.id, state.subcategoryFormData)
                showNotification('Subcategory updated successfully', 'success')
            }

            await loadCategories()
            closeSubcategoryModal()
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Operation failed'
            showNotification(errorMessage, 'error')
        } finally {
            setState(prev => ({ ...prev, isSubmitting: false }))
        }
    }

    const handleSubcategoryDelete = async (subcategory: Subcategory) => {
        if (!confirm(`Are you sure you want to delete the subcategory "${subcategory.name}"?`)) {
            return
        }

        try {
            await adminApi.deleteSubcategory(subcategory.id)
            showNotification('Subcategory deleted successfully', 'success')
            await loadCategories()
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete subcategory'
            showNotification(errorMessage, 'error')
        }
    }

    // Filter categories based on search query
    const filteredCategories = state.categories.filter(category =>
        category.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
        category.description.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
        category.subcategories?.some(sub =>
            sub.name.toLowerCase().includes(state.searchQuery.toLowerCase())
        )
    )

    if (state.isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="font-serif text-2xl font-bold text-foreground">Category Management</h2>
                    <p className="text-foreground">Manage product categories and subcategories</p>
                </div>
                <Button
                    onClick={openCreateModal}
                    className="bg-primary hover:bg-primary-dark gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Create Category
                </Button>
            </div>

            {/* Search */}
            <div className="flex items-center gap-4">
                <div className="relative grow max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground" />
                    <Input
                        placeholder="Search categories..."
                        value={state.searchQuery}
                        onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Error Display */}
            {state.error && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="w-4 h-4" />
                            <span>{state.error}</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Categories List */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Categories ({filteredCategories.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredCategories.length === 0 ? (
                        <div className="text-center py-8 text-foreground">
                            {state.searchQuery ? 'No categories match your search.' : 'No categories found. Create your first category to get started.'}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-muted">
                                    <tr>
                                        <th className="text-left p-4 font-medium text-foreground">Name</th>
                                        <th className="text-left p-4 font-medium text-foreground">Slug</th>
                                        <th className="text-left p-4 font-medium text-foreground">Description</th>
                                        <th className="text-left p-4 font-medium text-foreground">Subcategories</th>
                                        <th className="text-left p-4 font-medium text-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCategories.map((category) => (
                                        <CategoryRow
                                            key={category.id}
                                            category={category}
                                            onEdit={openEditModal}
                                            onDelete={openDeleteConfirm}
                                            onNotification={showNotification}
                                            onRefresh={loadCategories}
                                            onCreateSubcategory={openCreateSubcategoryModal}
                                            onEditSubcategory={openEditSubcategoryModal}
                                            onDeleteSubcategory={handleSubcategoryDelete}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Category Create/Edit Modal */}
            {state.showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-serif text-xl font-bold">
                                {state.modalMode === 'create' ? 'Create Category' : 'Edit Category'}
                            </h2>
                            <button onClick={closeModal} className="p-2 hover:bg-muted rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Name Field */}
                            <div>
                                <Label htmlFor="name">Category Name *</Label>
                                <Input
                                    id="name"
                                    value={state.formData.name}
                                    onChange={(e) => updateFormData('name', e.target.value)}
                                    placeholder="Enter category name"
                                    className={state.formErrors.name ? 'border-red-500' : ''}
                                />
                                {state.formErrors.name && (
                                    <p className="text-sm text-red-600 mt-1">{state.formErrors.name}</p>
                                )}
                            </div>

                            {/* Slug Field */}
                            <div>
                                <Label htmlFor="slug">Slug *</Label>
                                <Input
                                    id="slug"
                                    value={state.formData.slug}
                                    onChange={(e) => updateFormData('slug', e.target.value)}
                                    placeholder="category-slug"
                                    className={`font-mono text-sm ${state.formErrors.slug ? 'border-red-500' : ''}`}
                                />
                                <p className="text-xs text-foreground mt-1">
                                    Auto-generated from name. Use lowercase letters, numbers, and hyphens only.
                                </p>
                                {state.formErrors.slug && (
                                    <p className="text-sm text-red-600 mt-1">{state.formErrors.slug}</p>
                                )}
                            </div>

                            {/* Description Field */}
                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={state.formData.description}
                                    onChange={(e) => updateFormData('description', e.target.value)}
                                    placeholder="Enter category description"
                                    rows={3}
                                    className={state.formErrors.description ? 'border-red-500' : ''}
                                />
                                <p className="text-xs text-foreground mt-1">
                                    {state.formData.description.length}/5000 characters
                                </p>
                                {state.formErrors.description && (
                                    <p className="text-sm text-red-600 mt-1">{state.formErrors.description}</p>
                                )}
                            </div>

                            {/* Image URL Field */}
                            <div>
                                <Label htmlFor="image_url">Image URL</Label>
                                <Input
                                    id="image_url"
                                    type="url"
                                    value={state.formData.image_url || ''}
                                    onChange={(e) => updateFormData('image_url', e.target.value)}
                                    placeholder="https://example.com/image.jpg"
                                    className={state.formErrors.image_url ? 'border-red-500' : ''}
                                />
                                {state.formErrors.image_url && (
                                    <p className="text-sm text-red-600 mt-1">{state.formErrors.image_url}</p>
                                )}
                                {state.formData.image_url && (
                                    <div className="mt-2">
                                        <img
                                            src={state.formData.image_url}
                                            alt="Preview"
                                            className="w-20 h-20 rounded-lg object-cover"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none'
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Form Actions */}
                            <div className="flex gap-3 pt-4">
                                <Button
                                    onClick={closeModal}
                                    variant="outline"
                                    className="flex-1"
                                    disabled={state.isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    className="flex-1 bg-primary hover:bg-primary-dark gap-2"
                                    disabled={state.isSubmitting}
                                >
                                    {state.isSubmitting ? (
                                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                                    ) : (
                                        <Save className="w-4 h-4" />
                                    )}
                                    {state.isSubmitting ? 'Saving...' : (state.modalMode === 'create' ? 'Create Category' : 'Save Changes')}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {state.showDeleteConfirm && state.deleteTarget && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-2xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-serif text-xl font-bold text-red-600">Delete Category</h2>
                            <button onClick={closeDeleteConfirm} className="p-2 hover:bg-muted rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Warning Message */}
                            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                                <div>
                                    <p className="font-medium text-red-800">
                                        Are you sure you want to delete "{state.deleteTarget.name}"?
                                    </p>
                                    {state.deleteWarning?.hasProducts ? (
                                        <p className="text-sm text-red-700 mt-2">
                                            <strong>Warning:</strong> This category has {state.deleteWarning.count} product(s)
                                            associated with it. Deleting this category may affect those products.
                                        </p>
                                    ) : (
                                        <p className="text-sm text-red-700 mt-2">
                                            This action cannot be undone.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Category Details */}
                            <div className="p-4 bg-muted rounded-lg">
                                <div className="flex items-center gap-3">
                                    {state.deleteTarget.image_url && (
                                        <img
                                            src={state.deleteTarget.image_url}
                                            alt={state.deleteTarget.name}
                                            className="w-12 h-12 rounded-lg object-cover"
                                        />
                                    )}
                                    <div>
                                        <p className="font-medium">{state.deleteTarget.name}</p>
                                        <p className="text-sm text-foreground font-mono">{state.deleteTarget.slug}</p>
                                        {state.deleteTarget.subcategories && state.deleteTarget.subcategories.length > 0 && (
                                            <p className="text-sm text-foreground">
                                                {state.deleteTarget.subcategories.length} subcategories will also be deleted
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Confirmation Actions */}
                            <div className="flex gap-3 pt-4">
                                <Button
                                    onClick={closeDeleteConfirm}
                                    variant="outline"
                                    className="flex-1"
                                    disabled={state.isDeleting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleDelete}
                                    variant="destructive"
                                    className="flex-1 gap-2"
                                    disabled={state.isDeleting}
                                >
                                    {state.isDeleting ? (
                                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                                    ) : (
                                        <Trash2 className="w-4 h-4" />
                                    )}
                                    {state.isDeleting ? 'Deleting...' : 'Delete Category'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Subcategory Create/Edit Modal */}
            {state.showSubcategoryModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-serif text-xl font-bold">
                                {state.subcategoryModalMode === 'create' ? 'Create Subcategory' : 'Edit Subcategory'}
                            </h2>
                            <button onClick={closeSubcategoryModal} className="p-2 hover:bg-muted rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Parent Category Display */}
                            {state.subcategoryParentId && (
                                <div className="p-3 bg-muted rounded-lg">
                                    <Label className="text-sm font-medium text-foreground">Parent Category</Label>
                                    <p className="font-medium">
                                        {state.categories.find(cat => cat.id === state.subcategoryParentId)?.name || 'Unknown'}
                                    </p>
                                </div>
                            )}

                            {/* Name Field */}
                            <div>
                                <Label htmlFor="subcategory-name">Subcategory Name *</Label>
                                <Input
                                    id="subcategory-name"
                                    value={state.subcategoryFormData.name}
                                    onChange={(e) => updateSubcategoryFormData('name', e.target.value)}
                                    placeholder="Enter subcategory name"
                                    className={state.subcategoryFormErrors.name ? 'border-red-500' : ''}
                                />
                                {state.subcategoryFormErrors.name && (
                                    <p className="text-sm text-red-600 mt-1">{state.subcategoryFormErrors.name}</p>
                                )}
                            </div>

                            {/* Slug Field */}
                            <div>
                                <Label htmlFor="subcategory-slug">Slug *</Label>
                                <Input
                                    id="subcategory-slug"
                                    value={state.subcategoryFormData.slug}
                                    onChange={(e) => updateSubcategoryFormData('slug', e.target.value)}
                                    placeholder="subcategory-slug"
                                    className={`font-mono text-sm ${state.subcategoryFormErrors.slug ? 'border-red-500' : ''}`}
                                />
                                <p className="text-xs text-foreground mt-1">
                                    Auto-generated from name. Use lowercase letters, numbers, and hyphens only.
                                </p>
                                {state.subcategoryFormErrors.slug && (
                                    <p className="text-sm text-red-600 mt-1">{state.subcategoryFormErrors.slug}</p>
                                )}
                            </div>

                            {/* Description Field */}
                            <div>
                                <Label htmlFor="subcategory-description">Description</Label>
                                <Textarea
                                    id="subcategory-description"
                                    value={state.subcategoryFormData.description}
                                    onChange={(e) => updateSubcategoryFormData('description', e.target.value)}
                                    placeholder="Enter subcategory description"
                                    rows={3}
                                    className={state.subcategoryFormErrors.description ? 'border-red-500' : ''}
                                />
                                <p className="text-xs text-foreground mt-1">
                                    {(state.subcategoryFormData.description || '').length}/5000 characters
                                </p>
                                {state.subcategoryFormErrors.description && (
                                    <p className="text-sm text-red-600 mt-1">{state.subcategoryFormErrors.description}</p>
                                )}
                            </div>

                            {/* Form Actions */}
                            <div className="flex gap-3 pt-4">
                                <Button
                                    onClick={closeSubcategoryModal}
                                    variant="outline"
                                    className="flex-1"
                                    disabled={state.isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSubcategorySubmit}
                                    className="flex-1 bg-primary hover:bg-primary-dark gap-2"
                                    disabled={state.isSubmitting}
                                >
                                    {state.isSubmitting ? (
                                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                                    ) : (
                                        <Save className="w-4 h-4" />
                                    )}
                                    {state.isSubmitting ? 'Saving...' : (state.subcategoryModalMode === 'create' ? 'Create Subcategory' : 'Save Changes')}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}