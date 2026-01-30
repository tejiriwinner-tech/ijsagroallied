'use client'

import React, { useState, useEffect } from 'react'
import { AdminAPI, type ChickBatch } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LayoutGrid, Calendar, Package } from 'lucide-react'

export function BatchManager() {
    const [batches, setBatches] = useState<ChickBatch[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const api = new AdminAPI()

    const loadBatches = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const data = await api.getBatches()
            setBatches(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load batches')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadBatches()
    }, [])

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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <LayoutGrid className="w-5 h-5 text-primary" />
                    Available Batches
                </h3>
                <Button size="sm" variant="outline" onClick={loadBatches}>Refresh</Button>
            </div>

            {error && (
                <div className="p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    <div className="col-span-full py-20 text-center">
                        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                    </div>
                ) : batches.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-muted-foreground">
                        No active batches found
                    </div>
                ) : batches.map((batch) => (
                    <Card key={batch.id} className="overflow-hidden hover:shadow-md transition-shadow">
                        <CardHeader className="bg-muted pb-4">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg">{batch.breed}</CardTitle>
                                <Badge variant={batch.available_quantity > 100 ? "default" : "destructive"}>
                                    {batch.available_quantity} available
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar className="w-4 h-4 text-primary" />
                                <span className="text-muted-foreground">Delivery:</span>
                                <span className="font-medium">{formatDate(batch.available_date)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Package className="w-4 h-4 text-primary" />
                                <span className="text-muted-foreground">Min Order:</span>
                                <span className="font-medium">{batch.minimum_order} chicks</span>
                            </div>
                            <div className="pt-2 border-t border-border flex justify-between items-center">
                                <div className="text-lg font-bold text-primary">{formatPrice(batch.price_per_chick)}</div>
                                <div className="text-xs text-muted-foreground">per chick</div>
                            </div>
                            <p className="text-xs text-muted-foreground italic line-clamp-2">
                                {batch.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
