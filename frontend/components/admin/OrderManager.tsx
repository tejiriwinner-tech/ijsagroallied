'use client'

import React, { useState, useEffect } from 'react'
import { AdminAPI } from '@/lib/api'
import type { Order, OrderDetails, OrderFilters } from '@/lib/admin-types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Eye, Search, Filter } from 'lucide-react'

interface OrderManagerProps {
    className?: string
}

interface OrderManagerState {
    orders: Order[]
    isLoading: boolean
    statusFilter: string
    searchQuery: string
    selectedOrder: Order | null
    orderDetails: OrderDetails | null
    showDetailsModal: boolean
    error: string | null
}

export function OrderManager({ className }: OrderManagerProps) {
    const [state, setState] = useState<OrderManagerState>({
        orders: [],
        isLoading: false,
        statusFilter: '',
        searchQuery: '',
        selectedOrder: null,
        orderDetails: null,
        showDetailsModal: false,
        error: null,
    })

    const api = new AdminAPI()

    // Load orders on component mount and when filters change
    useEffect(() => {
        loadOrders()
    }, [state.statusFilter, state.searchQuery])

    const loadOrders = async () => {
        setState(prev => ({ ...prev, isLoading: true, error: null }))

        try {
            const filters: OrderFilters = {}
            if (state.statusFilter) filters.status = state.statusFilter
            if (state.searchQuery.trim()) filters.search = state.searchQuery.trim()

            const orders = await api.getOrders(filters)
            setState(prev => ({ ...prev, orders, isLoading: false }))
        } catch (error) {
            console.error('Failed to load orders:', error)
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error instanceof Error ? error.message : 'Failed to load orders'
            }))
        }
    }

    const handleStatusFilterChange = (value: string) => {
        setState(prev => ({ ...prev, statusFilter: value }))
    }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setState(prev => ({ ...prev, searchQuery: e.target.value }))
    }

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        try {
            await api.updateOrderStatus(orderId, newStatus)
            // Reload orders to reflect the change
            await loadOrders()
        } catch (error) {
            console.error('Failed to update order status:', error)
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Failed to update order status'
            }))
        }
    }

    const handleViewDetails = async (order: Order) => {
        setState(prev => ({ ...prev, isLoading: true }))

        try {
            const orderDetails = await api.getOrderDetails(order.id)
            setState(prev => ({
                ...prev,
                selectedOrder: order,
                orderDetails,
                showDetailsModal: true,
                isLoading: false
            }))
        } catch (error) {
            console.error('Failed to load order details:', error)
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error instanceof Error ? error.message : 'Failed to load order details'
            }))
        }
    }

    const closeDetailsModal = () => {
        setState(prev => ({
            ...prev,
            showDetailsModal: false,
            selectedOrder: null,
            orderDetails: null
        }))
    }

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'pending': return 'secondary'
            case 'processing': return 'default'
            case 'shipped': return 'outline'
            case 'delivered': return 'default'
            case 'cancelled': return 'destructive'
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
                        <Filter className="h-5 w-5" />
                        Order Management
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Filters */}
                    <div className="flex gap-4 mb-6">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input
                                    placeholder="Search by customer name or email..."
                                    value={state.searchQuery}
                                    onChange={handleSearchChange}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Select value={state.statusFilter} onValueChange={handleStatusFilterChange}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All Statuses</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="processing">Processing</SelectItem>
                                <SelectItem value="shipped">Shipped</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
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
                            <p className="mt-2 text-muted-foreground">Loading orders...</p>
                        </div>
                    )}

                    {/* Orders Table */}
                    {!state.isLoading && (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-3 font-medium">Order ID</th>
                                        <th className="text-left p-3 font-medium">Customer</th>
                                        <th className="text-left p-3 font-medium">Email</th>
                                        <th className="text-left p-3 font-medium">Total</th>
                                        <th className="text-left p-3 font-medium">Status</th>
                                        <th className="text-left p-3 font-medium">Date</th>
                                        <th className="text-left p-3 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {state.orders.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="text-center py-8 text-muted-foreground">
                                                No orders found
                                            </td>
                                        </tr>
                                    ) : (
                                        state.orders.map((order) => (
                                            <tr key={order.id} className="border-b border-border hover:bg-muted/50">
                                                <td className="p-3 font-mono text-sm text-foreground">{order.id}</td>
                                                <td className="p-3 text-foreground">{order.customer_name}</td>
                                                <td className="p-3 text-sm text-muted-foreground">{order.customer_email}</td>
                                                <td className="p-3 font-medium text-foreground">{formatCurrency(order.total_amount)}</td>
                                                <td className="p-3">
                                                    <Select
                                                        value={order.status}
                                                        onValueChange={(value) => handleStatusUpdate(order.id, value)}
                                                    >
                                                        <SelectTrigger className="w-32">
                                                            <Badge variant={getStatusBadgeVariant(order.status)}>
                                                                {order.status}
                                                            </Badge>
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="pending">Pending</SelectItem>
                                                            <SelectItem value="processing">Processing</SelectItem>
                                                            <SelectItem value="shipped">Shipped</SelectItem>
                                                            <SelectItem value="delivered">Delivered</SelectItem>
                                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </td>
                                                <td className="p-3 text-sm text-muted-foreground">{formatDate(order.created_at)}</td>
                                                <td className="p-3">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleViewDetails(order)}
                                                        className="flex items-center gap-1"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                        Details
                                                    </Button>
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

            {/* Order Details Modal */}
            {state.showDetailsModal && state.orderDetails && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card text-card-foreground rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-border">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-serif font-bold">Order Details</h2>
                            <Button variant="outline" onClick={closeDetailsModal}>
                                Close
                            </Button>
                        </div>

                        {/* Order Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-border">
                            <div>
                                <h3 className="text-lg font-serif font-bold mb-4 text-primary">Order Information</h3>
                                <div className="space-y-2">
                                    <p className="flex justify-between border-b border-border/50 pb-1"><strong className="text-foreground">Order ID:</strong> <span className="text-muted-foreground font-mono">{state.orderDetails.order.id}</span></p>
                                    <p className="flex justify-between border-b border-border/50 pb-1"><strong className="text-foreground">Status:</strong>
                                        <Badge variant={getStatusBadgeVariant(state.orderDetails.order.status)}>
                                            {state.orderDetails.order.status}
                                        </Badge>
                                    </p>
                                    <p className="flex justify-between border-b border-border/50 pb-1"><strong className="text-foreground">Date:</strong> <span className="text-muted-foreground">{formatDate(state.orderDetails.order.created_at)}</span></p>
                                    <p className="flex justify-between border-b border-border/50 pb-1"><strong className="text-foreground text-lg">Total:</strong> <span className="text-primary font-bold text-lg">{formatCurrency(state.orderDetails.order.total_amount)}</span></p>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-serif font-bold mb-4 text-primary">Customer Information</h3>
                                <div className="space-y-2">
                                    <p className="flex justify-between border-b border-border/50 pb-1"><strong className="text-foreground">Name:</strong> <span className="text-muted-foreground">{state.orderDetails.order.customer_name}</span></p>
                                    <p className="flex justify-between border-b border-border/50 pb-1"><strong className="text-foreground">Email:</strong> <span className="text-muted-foreground">{state.orderDetails.order.customer_email}</span></p>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="mt-8">
                            <h3 className="text-lg font-serif font-bold mb-4">Order Items</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse border border-border">
                                    <thead>
                                        <tr className="bg-muted">
                                            <th className="border border-border p-3 text-left font-semibold">Product</th>
                                            <th className="border border-border p-3 text-left font-semibold">Quantity</th>
                                            <th className="border border-border p-3 text-left font-semibold">Price</th>
                                            <th className="border border-border p-3 text-left font-semibold">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {state.orderDetails.items.map((item) => (
                                            <tr key={item.id} className="hover:bg-muted/30">
                                                <td className="border border-border p-3">{item.product_name}</td>
                                                <td className="border border-border p-3 text-center">{item.quantity}</td>
                                                <td className="border border-border p-3">{formatCurrency(item.price)}</td>
                                                <td className="border border-border p-3 font-medium">{formatCurrency(item.subtotal)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="bg-muted font-bold">
                                            <td colSpan={3} className="border border-border p-3 text-right">Total:</td>
                                            <td className="border border-border p-3 text-primary">{formatCurrency(state.orderDetails.order.total_amount)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}