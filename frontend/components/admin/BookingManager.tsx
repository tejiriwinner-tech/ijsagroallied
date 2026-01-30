'use client'

import React, { useState, useEffect } from 'react'
import { AdminAPI, type ChickBooking } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Eye, Search, Filter, Calendar } from 'lucide-react'

export function BookingManager() {
    const [bookings, setBookings] = useState<ChickBooking[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [error, setError] = useState<string | null>(null)

    const api = new AdminAPI()

    const loadBookings = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const data = await api.getBookings()
            setBookings(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load bookings')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadBookings()
    }, [])

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            await api.updateBookingStatus(id, newStatus)
            loadBookings()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update status')
        }
    }

    const filteredBookings = bookings.filter(booking => {
        const matchesSearch = booking.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.id.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === '' || booking.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-NG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
        }).format(price)
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return <Badge variant="secondary">Pending</Badge>
            case 'confirmed': return <Badge variant="default" className="bg-blue-500 hover:bg-blue-600 text-white">Confirmed</Badge>
            case 'completed': return <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white">Completed</Badge>
            case 'cancelled': return <Badge variant="destructive">Cancelled</Badge>
            default: return <Badge variant="outline">{status}</Badge>
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search bookings..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val === 'all' ? '' : val)}>
                    <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {error && (
                <div className="p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
                    {error}
                </div>
            )}

            <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted">
                            <tr>
                                <th className="text-left p-4 font-medium">Customer</th>
                                <th className="text-left p-4 font-medium">Breed</th>
                                <th className="text-left p-4 font-medium">Qty</th>
                                <th className="text-left p-4 font-medium">Total</th>
                                <th className="text-left p-4 font-medium">Pickup Date</th>
                                <th className="text-left p-4 font-medium">Status</th>
                                <th className="text-left p-4 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="text-center p-8">
                                        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                                    </td>
                                </tr>
                            ) : filteredBookings.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center p-8 text-muted-foreground">
                                        No bookings found
                                    </td>
                                </tr>
                            ) : filteredBookings.map((booking) => (
                                <tr key={booking.id} className="border-t border-border hover:bg-muted/50">
                                    <td className="p-4">
                                        <div className="font-medium">{booking.customer_name}</div>
                                        <div className="text-xs text-muted-foreground">{booking.customer_email}</div>
                                    </td>
                                    <td className="p-4">{booking.breed}</td>
                                    <td className="p-4">{booking.quantity}</td>
                                    <td className="p-4 font-medium">{formatPrice(booking.total_price)}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3 h-3 text-muted-foreground" />
                                            {formatDate(booking.pickup_date)}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {getStatusBadge(booking.status)}
                                    </td>
                                    <td className="p-4">
                                        <Select
                                            value={booking.status}
                                            onValueChange={(val) => handleStatusUpdate(booking.id, val)}
                                        >
                                            <SelectTrigger className="w-32 h-8 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
                                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
