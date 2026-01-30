"use client"

import { useState, use, useEffect } from "react"
import Link from "next/link"
import { productsApi, categoriesApi, type Product, type Category } from "@/lib/api"
import { useCart } from "@/context/cart-context"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import ProductCard from "@/components/product-card"
import { toast } from "sonner"

// Simple icon components
const ChevronRight = ({ className }: { className?: string }) => <span className={`inline-block ${className || ''}`}>›</span>
const Minus = ({ className }: { className?: string }) => <span className={`inline-block ${className || ''}`}>−</span>
const Plus = ({ className }: { className?: string }) => <span className={`inline-block ${className || ''}`}>+</span>
const ShoppingCart = ({ className }: { className?: string }) => <span className={`inline-block ${className || ''}`}>🛒</span>
const AlertTriangle = ({ className }: { className?: string }) => <span className={`inline-block ${className || ''}`}>⚠️</span>
const Check = ({ className }: { className?: string }) => <span className={`inline-block ${className || ''}`}>✓</span>
const Truck = ({ className }: { className?: string }) => <span className={`inline-block ${className || ''}`}>🚚</span>
const Shield = ({ className }: { className?: string }) => <span className={`inline-block ${className || ''}`}>🛡️</span>

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [product, setProduct] = useState<Product | null>(null)
  const [category, setCategory] = useState<Category | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const { addToCart } = useCart()
  const { user } = useAuth()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price)
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const response = await productsApi.getById(resolvedParams.id)
        if (response.success && response.data) {
          const productData = response.data
          setProduct(productData)

          // Fetch category info for breadcrumbs
          const catResponse = await categoriesApi.getAll()
          if (catResponse.success && catResponse.data) {
            const currentCat = catResponse.data.find(c => c.id === productData.category)
            if (currentCat) setCategory(currentCat)
          }

          // Fetch related products
          const relatedResponse = await productsApi.getAll(productData.category)
          if (relatedResponse.success && relatedResponse.data) {
            setRelatedProducts(relatedResponse.data.filter(p => p.id !== productData.id).slice(0, 4))
          }
        }
      } catch (error) {
        console.error("Failed to fetch product details:", error)
        toast.error("Failed to load product details")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [resolvedParams.id])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <div className="animate-pulse text-xl text-muted-foreground font-serif">Loading product details...</div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <Link href="/" className="text-primary hover:underline">
            Go back home
          </Link>
        </div>
      </div>
    )
  }

  const isLowStock = product.stock <= 10 && product.stock > 0
  const isOutOfStock = product.stock === 0

  const handleAddToCart = () => {
    addToCart(product.id, quantity)
    toast.success(`${quantity} ${product.name} added to cart`)
    setQuantity(1)
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
          {category && (
            <>
              <Link href={`/products/${category.slug}`} className="hover:text-primary transition-colors">
                {category.name}
              </Link>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
          <span className="text-foreground font-medium line-clamp-1">{product.name}</span>
        </nav>

        {/* Product Detail */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Product Image */}
          <div className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden bg-muted shadow-lg">
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {isLowStock && (
              <div className="absolute top-4 left-4 bg-accent text-primary-dark shadow-md px-4 py-2 rounded-full flex items-center gap-2 font-medium animate-bounce">
                <AlertTriangle className="w-4 h-4" />
                Only {product.stock} left!
              </div>
            )}
            {isOutOfStock && (
              <div className="absolute top-4 left-4 bg-destructive text-white shadow-md px-4 py-2 rounded-full font-medium">
                Out of Stock
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4 uppercase tracking-wide">
              {product.name}
            </h1>
            <p className="text-muted-foreground font-medium text-lg mb-6">{product.unit}</p>

            <div className="flex items-baseline gap-4 mb-8">
              <span className="text-4xl font-bold text-primary">{formatPrice(product.price)}</span>
            </div>

            <p className="text-foreground leading-relaxed text-lg mb-8 max-w-2xl">{product.description}</p>

            {/* Stock Status */}
            <div className="flex items-center gap-2 mb-8">
              {isOutOfStock ? (
                <span className="text-destructive font-bold px-4 py-2 bg-destructive/10 rounded-lg">Out of Stock</span>
              ) : isLowStock ? (
                <span className="text-accent-dark font-bold flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-lg">
                  <AlertTriangle className="w-5 h-5" />
                  Only {product.stock} items remaining
                </span>
              ) : (
                <span className="text-primary font-bold flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
                  <Check className="w-5 h-5" />
                  In Stock ({product.stock} available)
                </span>
              )}
            </div>

            {/* Admin Restriction Message */}
            {user?.role === "admin" && (
              <div className="bg-muted p-6 rounded-2xl border border-border mt-8">
                <p className="text-muted-foreground font-medium text-center">
                  Administrators cannot place orders or add items to the cart.
                </p>
              </div>
            )}

            {/* Quantity Selector - Hidden for Admin */}
            {!isOutOfStock && (!user || user.role !== "admin") && (
              <div className="flex items-center gap-6 mb-10">
                <span className="font-bold text-foreground">QUANTITY:</span>
                <div className="flex items-center border-2 border-primary rounded-xl overflow-hidden bg-background shadow-sm">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="p-3 hover:bg-primary hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="px-6 py-2 font-bold text-xl min-w-16 text-center border-x-2 border-primary text-primary">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    className="p-3 hover:bg-primary hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Add to Cart Button - Hidden for Admin */}
            {(!user || user.role !== "admin") && (
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="w-full md:w-auto bg-primary hover:bg-primary-dark text-white px-16 py-8 text-xl font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 gap-3 uppercase tracking-wider"
              >
                <ShoppingCart className="w-6 h-6" />
                {isOutOfStock ? "Out of Stock" : "Add to Cart"}
              </Button>
            )}

            {/* Features */}
            <div className="grid grid-cols-2 gap-6 mt-12 pt-8 border-t-2 border-dashed border-border">
              <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-2xl border border-border/50">
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center shadow-inner">
                  <Truck className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-sm uppercase">Fast Delivery</p>
                  <p className="text-xs text-muted-foreground font-medium">Nationwide shipping</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-2xl border border-border/50">
                <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center shadow-inner">
                  <Shield className="w-6 h-6 text-accent-dark" />
                </div>
                <div>
                  <p className="font-bold text-sm uppercase">Quality Assured</p>
                  <p className="text-xs text-muted-foreground font-medium">100% genuine products</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <h2 className="font-serif text-3xl font-bold mb-10 pb-4 border-b-2 border-primary w-fit pr-8">Related Products</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
