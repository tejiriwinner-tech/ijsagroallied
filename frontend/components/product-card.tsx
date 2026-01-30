"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/cart-context"
import { useAuth } from "@/context/auth-context"
import { type Product, formatPrice } from "@/lib/data"
import { ShoppingCart, AlertTriangle, Check } from "lucide-react"

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, getStockWarning } = useCart()
  const { user } = useAuth()
  const [isAdding, setIsAdding] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const stockWarning = getStockWarning(product.id)
  const isLowStock = product.stock <= 10 && product.stock > 0
  const isOutOfStock = product.stock === 0

  const handleAddToCart = async () => {
    setIsAdding(true)
    addToCart(product.id)

    // Show success feedback
    setShowSuccess(true)
    setTimeout(() => {
      setShowSuccess(false)
      setIsAdding(false)
    }, 1500)
  }

  return (
    <div className="group bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-border">
      {/* Image */}
      <Link href={`/product/${product.id}`} className="block relative aspect-square overflow-hidden">
        <img
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Stock Badge */}
        {isLowStock && (
          <div className="absolute top-3 left-3 bg-accent text-primary-dark text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Only {product.stock} left!
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute top-3 left-3 bg-destructive text-white text-xs font-bold px-2 py-1 rounded-full">
            Out of Stock
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4">
        <Link href={`/product/${product.id}`}>
          <h3 className="font-medium text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-foreground mb-2">{product.unit}</p>
        <p className="text-sm text-foreground line-clamp-2 mb-3">{product.description}</p>

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary">{formatPrice(product.price)}</span>
          {(!user || user.role !== "admin") && (
            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={isOutOfStock || isAdding}
              className={`${showSuccess
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-accent hover:bg-accent-dark'
                } text-primary-dark transition-all`}
            >
              {showSuccess ? (
                <Check className="w-4 h-4" />
              ) : (
                <ShoppingCart className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
