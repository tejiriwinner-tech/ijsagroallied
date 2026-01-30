'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LogOut, Users, Package, ShoppingCart } from 'lucide-react'
import { CategoryManager } from './CategoryManager'
import { OrderManager } from './OrderManager'
import { UserManager } from './UserManager'

interface AdminDashboardProps {
    initialTab?: 'categories' | 'orders' | 'users'
}

interface User {
    id: string
    name: string
    email: string
    role: 'admin' | 'user'
}

export default function AdminDashboard({ initialTab = 'categories' }: AdminDashboardProps) {
    const [activeTab, setActiveTab] = useState(initialTab)
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        checkAuthentication()
    }, [])

    const checkAuthentication = async () => {
        try {
            // Check if user is logged in and has admin role
            const token = localStorage.getItem('auth_token')
            const userData = localStorage.getItem('user_data')

            if (!token || !userData) {
                router.push('/login')
                return
            }

            const parsedUser = JSON.parse(userData)

            if (parsedUser.role !== 'admin') {
                // Redirect non-admin users
                router.push('/')
                return
            }

            setUser(parsedUser)
            setIsLoading(false)
        } catch (error) {
            console.error('Authentication check failed:', error)
            router.push('/login')
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_data')
        router.push('/login')
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading admin dashboard...</p>
                </div>
            </div>
        )
    }

    if (!user) {
        return null // Will redirect to login
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <header className="bg-card shadow-sm border-b border-border sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-serif font-bold text-primary">
                                Admin Dashboard
                            </h1>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-sm text-muted-foreground">
                                Welcome, <span className="font-medium text-foreground">{user.name}</span>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleLogout}
                                className="flex items-center gap-2"
                            >
                                <LogOut className="h-4 w-4" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
                    {/* Tab Navigation */}
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="categories" className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Categories
                        </TabsTrigger>
                        <TabsTrigger value="orders" className="flex items-center gap-2">
                            <ShoppingCart className="h-4 w-4" />
                            Orders
                        </TabsTrigger>
                        <TabsTrigger value="users" className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Users
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab Content */}
                    <TabsContent value="categories" className="space-y-6">
                        <CategoryManager />
                    </TabsContent>

                    <TabsContent value="orders" className="space-y-6">
                        <OrderManager />
                    </TabsContent>

                    <TabsContent value="users" className="space-y-6">
                        <UserManager />
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    )
}