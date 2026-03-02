"use client"

import { useState } from "react"
import Link from "next/link"
import { useCart } from "@/context/cart-context"
import { useAuth } from "@/context/auth-context"
import { formatPrice } from "@/lib/data"
import { paymentsApi } from "@/lib/api"
import { Button } from "@/components/ui/button"

import { ChevronRight, Minus, Plus, Trash2, ShoppingBag, AlertTriangle, CreditCard } from "lucide-react"

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, getCartTotal, clearCart, getProduct, getStockWarning } = useCart()
  const { user, addOrder } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)

  const handleCheckout = async () => {
    if (!user) {
      window.location.href = "/login?redirect=/cart"
      return
    }

    try {
      setIsProcessing(true)

      const orderItems = items.map((item) => {
        const product = getProduct(item.productId)
        return {
          productId: item.productId,
          quantity: item.quantity,
          priceAtPurchase: product?.price || 0,
          productName: product?.name || "",
        }
      })

      const response = await paymentsApi.initialize({
        email: user.email,
        amount: getCartTotal(),
        callback_url: `${window.location.origin}/cart/verify-payment`,
        metadata: {
          userId: user.id,
          items: orderItems,
        },
      })

      if (response.success && response.data?.authorization_url) {
        window.location.href = response.data.authorization_url
      } else {
        alert(response.error || "Failed to initialize payment")
        setIsProcessing(false)
      }
    } catch (error) {
      console.error("Checkout error:", error)
      alert("An error occurred during checkout")
      setIsProcessing(false)
    }
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto text-center py-16">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-primary" />
            </div>
            <h1 className="font-serif text-3xl font-bold mb-4 text-foreground">Order Placed Successfully!</h1>
            <p className="text-foreground mb-8">
              Thank you for your order. We&apos;ll process it shortly and send you a confirmation email.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/dashboard">
                <Button className="bg-primary hover:bg-primary-dark text-primary-foreground">View Orders</Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="bg-transparent">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto text-center py-16">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-foreground" />
            </div>
            <h1 className="font-serif text-3xl font-bold mb-4 text-foreground">Your Cart is Empty</h1>
            <p className="text-foreground mb-8">Looks like you haven&apos;t added any items to your cart yet.</p>
            <Link href="/products/chicken-feeds">
              <Button className="bg-primary hover:bg-primary-dark text-primary-foreground">Start Shopping</Button>
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
          <span className="text-foreground font-medium">Shopping Cart</span>
        </nav>

        <h1 className="font-serif text-3xl font-bold mb-8 text-foreground">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const product = getProduct(item.productId)
              if (!product) return null

              const stockWarning = getStockWarning(product.id)
              const isLowStock = product.stock <= 10 && product.stock > 0

              return (
                <div key={item.productId} className="bg-card rounded-xl p-4 border border-border flex gap-4">
                  <Link href={`/product/${product.id}`} className="w-24 h-24 shrink-0 rounded-lg overflow-hidden">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  <div className="grow">
                    <Link href={`/product/${product.id}`}>
                      <h3 className="font-medium hover:text-primary transition-colors">{product.name}</h3>
                    </Link>
                    <p className="text-sm text-foreground">{product.unit}</p>

                    {isLowStock && (
                      <p className="text-accent-dark text-sm font-medium flex items-center gap-1 mt-1">
                        <AlertTriangle className="w-3 h-3" />
                        Only {product.stock} left in stock!
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-border rounded-lg bg-background">
                        <button
                          onClick={() => updateQuantity(product.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="p-2 hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-l-lg"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-3 py-2 font-medium min-w-3rem text-center border-x border-border">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, item.quantity + 1)}
                          disabled={item.quantity >= product.stock}
                          className="p-2 hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-r-lg"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-primary">{formatPrice(product.price * item.quantity)}</p>
                    <p className="text-sm text-foreground">{formatPrice(product.price)} each</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl p-6 border border-border sticky top-24">
              <h2 className="font-serif text-xl font-bold mb-6 text-foreground">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-foreground">Subtotal</span>
                  <span className="font-medium">{formatPrice(getCartTotal())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground">Delivery</span>
                  <span className="font-medium text-primary">Free</span>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between">
                    <span className="font-bold text-lg">Total</span>
                    <span className="font-bold text-lg text-primary">{formatPrice(getCartTotal())}</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full bg-accent hover:bg-accent-dark text-accent-foreground py-6 text-lg gap-2"
              >
                {isProcessing ? (
                  <>Processing...</>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    {user ? "Place Order" : "Login to Checkout"}
                  </>
                )}
              </Button>

              <p className="text-xs text-foreground text-center mt-4">Secure payment powered by Paystack</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
