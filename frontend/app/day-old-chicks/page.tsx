"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { dayOldChicksBatches, formatPrice } from "@/lib/data"
import { useAuth } from "@/context/auth-context"
import { useCart } from "@/context/cart-context"
import { chicksApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { ChevronRight, Calendar, Users, Check } from "lucide-react"

// Utility function for consistent date formatting
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

export default function DayOldChicksPage() {
  const { user } = useAuth()
  const { addToCart } = useCart()
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null)
  const [quantity, setQuantity] = useState<number>(50)
  const [contactInfo, setContactInfo] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isBooked, setIsBooked] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selected = dayOldChicksBatches.find((b) => b.id === selectedBatch)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected) return

    setIsSubmitting(true)
    setError(null)
    // Simulate API call
    try {
      const response = await chicksApi.createBooking({
        userId: user?.id,
        batchId: selected.id,
        breed: selected.breed,
        quantity,
        totalPrice: (selected.pricePerChick || 0) * quantity,
        customerName: contactInfo.name,
        customerEmail: contactInfo.email,
        customerPhone: contactInfo.phone,
        deliveryAddress: contactInfo.address,
        description: contactInfo.notes,
        pickupDate: selected.availableDate,
      })

      if (!response.success) {
        throw new Error(response.error || response.message || "Failed to create booking")
      }

      addToCart(selected.id, quantity)
      setIsBooked(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create booking")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isBooked) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto text-center py-16">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-primary" />
            </div>
            <h1 className="font-serif text-3xl font-bold mb-4 text-foreground">Booking Confirmed!</h1>
            <p className="text-foreground mb-8">
              Your booking for {quantity} {selected?.breed} day-old chicks has been received. We&apos;ll contact you
              shortly to confirm delivery details.
            </p>
            <Link href="/">
              <Button className="bg-primary hover:bg-primary-dark text-primary-foreground">Back to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-foreground mb-8">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">Day-Old Chicks</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1 bg-accent/10 text-accent-dark rounded-full text-sm font-medium mb-4">
            Pre-Order Now
          </span>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">Day-Old Chicks Booking</h1>
          <p className="text-foreground max-w-2xl mx-auto">
            Book quality day-old chicks from trusted hatcheries. All chicks are vaccinated and health-certified for
            optimal survival rates.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Available Batches */}
          <div className="lg:col-span-2">
            <h2 className="font-serif text-2xl font-bold mb-6 text-foreground">Available Batches</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {dayOldChicksBatches.map((batch) => (
                <Card
                  key={batch.id}
                  className={`cursor-pointer transition-all hover:shadow-lg overflow-hidden ${selectedBatch === batch.id ? "ring-2 ring-primary border-primary" : ""
                    }`}
                  onClick={() => {
                    setSelectedBatch(batch.id)
                    setQuantity(batch.minimumOrder)
                  }}
                >
                  <div className="h-48 w-full relative">
                    <img
                      src={batch.image}
                      alt={batch.breed}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{batch.breed}</CardTitle>
                      {selectedBatch === batch.id && (
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <CardDescription>{batch.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-foreground">Price per chick</span>
                        <span className="font-bold text-primary">{formatPrice(batch.pricePerChick)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-foreground">Minimum order</span>
                        <span className="font-medium">{batch.minimumOrder} chicks</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-foreground">Available</span>
                        <span className="font-medium">{batch.availableQuantity.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} chicks</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-foreground pt-2 border-t border-border">
                        <Calendar className="w-4 h-4" />
                        <span>Available: {formatDate(batch.availableDate)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl p-6 border border-border sticky top-24">
              <h2 className="font-serif text-xl font-bold mb-6 text-foreground">Book Now</h2>

              {error && (
                <div className="p-3 mb-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
                  {error}
                </div>
              )}

              {!selectedBatch ? (
                <div className="text-center py-8 text-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a batch to proceed with booking</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="quantity">Quantity (min: {selected?.minimumOrder})</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min={selected?.minimumOrder}
                      max={selected?.availableQuantity}
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={contactInfo.name}
                      onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={contactInfo.phone}
                      onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={contactInfo.email}
                      onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={contactInfo.notes}
                      onChange={(e) => setContactInfo({ ...contactInfo, notes: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Delivery Address</Label>
                    <Input
                      id="address"
                      value={contactInfo.address}
                      onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })}
                      required
                    />
                  </div>

                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-foreground">Price per chick</span>
                      <span>{formatPrice(selected?.pricePerChick || 0)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-foreground">Quantity</span>
                      <span>{quantity}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t border-border pt-2">
                      <span>Total</span>
                      <span className="text-primary">{formatPrice((selected?.pricePerChick || 0) * quantity)}</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-accent hover:bg-accent-dark text-accent-foreground py-6"
                  >
                    {isSubmitting ? "Processing..." : "Confirm Booking"}
                  </Button>

                  <p className="text-xs text-foreground text-center">
                    A 50% deposit is required to secure your booking
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
