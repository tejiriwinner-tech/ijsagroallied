'use client'

import React, { useState, useEffect } from 'react'
import { AdminAPI } from '@/lib/api'
import type { User, UserDetails, UserFilters } from '@/lib/admin-types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Eye, Search, Filter, Trash2, Shield, User as UserIcon } from 'lucide-react'

interface UserManagerProps {
    className?: string
}

interface UserManagerState {
    users: User[]
    isLoading: boolean
    roleFilter: string
    searchQuery: string
    selectedUser: User | null
    userDetails: UserDetails | null
    showDetailsModal: boolean
    showDeleteConfirm: boolean
    deleteTarget: User | null
    error: string | null
}

export function UserManager({ className }: UserManagerProps) {
    const [state, setState] = useState<UserManagerState>({
        users: [],
        isLoading: false,
        roleFilter: '',
        searchQuery: '',
        selectedUser: null,
        userDetails: null,
        showDetailsModal: false,
        showDeleteConfirm: false,
        deleteTarget: null,
        error: null,
    })

    const api = new AdminAPI()

    // Load users on component mount and when filters change
    useEffect(() => {
        loadUsers()
    }, [state.roleFilter, state.searchQuery])

    const loadUsers = async () => {
        setState(prev => ({ ...prev, isLoading: true, error: null }))

        try {
            const filters: UserFilters = {}
            if (state.roleFilter) filters.role = state.roleFilter
            if (state.searchQuery.trim()) filters.search = state.searchQuery.trim()

            const users = await api.getUsers(filters)
            setState(prev => ({ ...prev, users, isLoading: false }))
        } catch (error) {
            console.error('Failed to load users:', error)
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error instanceof Error ? error.message : 'Failed to load users'
            }))
        }
    }

    const handleRoleFilterChange = (value: string) => {
        setState(prev => ({ ...prev, roleFilter: value }))
    }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setState(prev => ({ ...prev, searchQuery: e.target.value }))
    }

    const handleRoleUpdate = async (userId: string, newRole: string) => {
        try {
            await api.updateUserRole(userId, newRole)
            // Reload users to reflect the change
            await loadUsers()
        } catch (error) {
            console.error('Failed to update user role:', error)
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Failed to update user role'
            }))
        }
    }

    const handleViewDetails = async (user: User) => {
        setState(prev => ({ ...prev, isLoading: true }))

        try {
            const userDetails = await api.getUserDetails(user.id)
            setState(prev => ({
                ...prev,
                selectedUser: user,
                userDetails,
                showDetailsModal: true,
                isLoading: false
            }))
        } catch (error) {
            console.error('Failed to load user details:', error)
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error instanceof Error ? error.message : 'Failed to load user details'
            }))
        }
    }

    const handleDeleteClick = (user: User) => {
        setState(prev => ({
            ...prev,
            deleteTarget: user,
            showDeleteConfirm: true
        }))
    }

    const handleDeleteConfirm = async () => {
        if (!state.deleteTarget) return

        try {
            await api.deleteUser(state.deleteTarget.id)
            setState(prev => ({
                ...prev,
                showDeleteConfirm: false,
                deleteTarget: null
            }))
            // Reload users to reflect the change
            await loadUsers()
        } catch (error) {
            console.error('Failed to delete user:', error)
            setState(prev => ({
                ...prev,
                showDeleteConfirm: false,
                deleteTarget: null,
                error: error instanceof Error ? error.message : 'Failed to delete user'
            }))
        }
    }

    const handleDeleteCancel = () => {
        setState(prev => ({
            ...prev,
            showDeleteConfirm: false,
            deleteTarget: null
        }))
    }

    const closeDetailsModal = () => {
        setState(prev => ({
            ...prev,
            showDetailsModal: false,
            selectedUser: null,
            userDetails: null
        }))
    }

    const getRoleBadgeVariant = (role: string) => {
        switch (role) {
            case 'admin': return 'default'
            case 'user': return 'secondary'
            default: return 'secondary'
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
        }).format(amount)
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()} ${hours}:${minutes}`
    }

    return (
        <div className={className}>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserIcon className="h-5 w-5" />
                        User Management
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Filters */}
                    <div className="flex gap-4 mb-6">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input
                                    placeholder="Search by name or email..."
                                    value={state.searchQuery}
                                    onChange={handleSearchChange}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Select value={state.roleFilter} onValueChange={handleRoleFilterChange}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Filter by role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All Roles</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="user">User</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Error Display */}
                    {state.error && (
                        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded mb-4">
                            {state.error}
                        </div>
                    )}

                    {/* Loading State */}
                    {state.isLoading && (
                        <div className="text-center py-8">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            <p className="mt-2 text-muted-foreground">Loading users...</p>
                        </div>
                    )}

                    {/* Users Table */}
                    {!state.isLoading && (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-3 font-medium">Name</th>
                                        <th className="text-left p-3 font-medium">Email</th>
                                        <th className="text-left p-3 font-medium">Role</th>
                                        <th className="text-left p-3 font-medium">Registration Date</th>
                                        <th className="text-left p-3 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {state.users.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="text-center py-8 text-muted-foreground">
                                                No users found
                                            </td>
                                        </tr>
                                    ) : (
                                        state.users.map((user) => (
                                            <tr key={user.id} className="border-b border-border hover:bg-muted/50">
                                                <td className="p-3 font-medium text-foreground">{user.name}</td>
                                                <td className="p-3 text-muted-foreground">{user.email}</td>
                                                <td className="p-3">
                                                    <Select
                                                        value={user.role}
                                                        onValueChange={(value) => handleRoleUpdate(user.id, value)}
                                                    >
                                                        <SelectTrigger className="w-24">
                                                            <Badge variant={getRoleBadgeVariant(user.role)}>
                                                                {user.role === 'admin' ? (
                                                                    <Shield className="h-3 w-3 mr-1" />
                                                                ) : (
                                                                    <UserIcon className="h-3 w-3 mr-1" />
                                                                )}
                                                                {user.role}
                                                            </Badge>
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="user">User</SelectItem>
                                                            <SelectItem value="admin">Admin</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </td>
                                                <td className="p-3 text-sm text-muted-foreground">{formatDate(user.created_at)}</td>
                                                <td className="p-3">
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleViewDetails(user)}
                                                            className="flex items-center gap-1"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                            Details
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDeleteClick(user)}
                                                            className="flex items-center gap-1 text-red-600 hover:text-red-700"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* User Details Modal */}
            {state.showDetailsModal && state.userDetails && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card text-card-foreground rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-border">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-serif font-bold">User Details</h2>
                            <Button variant="outline" onClick={closeDetailsModal}>
                                Close
                            </Button>
                        </div>

                        {/* User Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-border">
                            <div>
                                <h3 className="text-lg font-serif font-bold mb-4 text-primary">User Information</h3>
                                <div className="space-y-2">
                                    <p className="flex justify-between border-b border-border/50 pb-1"><strong className="text-foreground">Name:</strong> <span className="text-muted-foreground">{state.userDetails.name}</span></p>
                                    <p className="flex justify-between border-b border-border/50 pb-1"><strong className="text-foreground">Email:</strong> <span className="text-muted-foreground">{state.userDetails.email}</span></p>
                                    <p className="flex justify-between border-b border-border/50 pb-1"><strong className="text-foreground">Role:</strong>
                                        <Badge variant={getRoleBadgeVariant(state.userDetails.role)}>
                                            {state.userDetails.role === 'admin' ? (
                                                <Shield className="h-3 w-3 mr-1" />
                                            ) : (
                                                <UserIcon className="h-3 w-3 mr-1" />
                                            )}
                                            {state.userDetails.role}
                                        </Badge>
                                    </p>
                                    <p className="flex justify-between border-b border-border/50 pb-1"><strong className="text-foreground">Registration Date:</strong> <span className="text-muted-foreground">{formatDate(state.userDetails.created_at)}</span></p>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-serif font-bold mb-4 text-primary">Order Statistics</h3>
                                <div className="space-y-2">
                                    <p className="flex justify-between border-b border-border/50 pb-1"><strong className="text-foreground">Total Orders:</strong> <span className="text-muted-foreground">{state.userDetails.orders?.length || 0}</span></p>
                                    {state.userDetails.orders && state.userDetails.orders.length > 0 && (
                                        <>
                                            <p className="flex justify-between border-b border-border/50 pb-1"><strong className="text-foreground">Total Spent:</strong> <span className="text-primary font-bold">{formatCurrency(
                                                state.userDetails.orders.reduce((sum, order) => sum + order.total_amount, 0)
                                            )}</span></p>
                                            <p className="flex justify-between border-b border-border/50 pb-1"><strong className="text-foreground">Last Order:</strong> <span className="text-muted-foreground">{formatDate(state.userDetails.orders[0].created_at)}</span></p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Order History */}
                        <div className="mt-8">
                            <h3 className="text-lg font-serif font-bold mb-4">Order History</h3>
                            {!state.userDetails.orders || state.userDetails.orders.length === 0 ? (
                                <p className="text-muted-foreground italic">No orders found</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse border border-border">
                                        <thead>
                                            <tr className="bg-muted">
                                                <th className="border border-border p-3 text-left font-semibold">Order ID</th>
                                                <th className="border border-border p-3 text-left font-semibold">Total</th>
                                                <th className="border border-border p-3 text-left font-semibold">Status</th>
                                                <th className="border border-border p-3 text-left font-semibold">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {state.userDetails.orders.map((order) => (
                                                <tr key={order.id} className="hover:bg-muted/30">
                                                    <td className="border border-border p-3 font-mono text-sm">{order.id}</td>
                                                    <td className="border border-border p-3 font-medium">{formatCurrency(order.total_amount)}</td>
                                                    <td className="border border-border p-3 text-center">
                                                        <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                                                            {order.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="border border-border p-3 text-sm text-muted-foreground">{formatDate(order.created_at)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {state.showDeleteConfirm && state.deleteTarget && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card text-card-foreground rounded-xl p-6 max-w-md w-full border border-border shadow-2xl">
                        <h2 className="text-xl font-serif font-bold mb-4">Confirm Delete</h2>
                        <p className="mb-4">
                            Are you sure you want to delete user <strong>{state.deleteTarget.name}</strong>?
                        </p>
                        <p className="text-sm text-muted-foreground mb-6">
                            This action cannot be undone. The user will be permanently removed from the system.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <Button variant="outline" onClick={handleDeleteCancel}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={handleDeleteConfirm}>
                                Delete User
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}