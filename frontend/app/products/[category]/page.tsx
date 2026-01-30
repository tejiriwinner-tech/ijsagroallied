"use client"

import { useState, use, useEffect } from "react"
import Link from "next/link"
import { productsApi, categoriesApi, type Product, type Category } from "@/lib/api"
import ProductCard from "@/components/product-card"
import { useAuth } from "@/context/auth-context"
import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

// Simple icon components
const ChevronRight = ({ className }: { className?: string }) => <span className={`inline-block ${className || ''}`}>›</span>
const Filter = ({ className }: { className?: string }) => <span className={`inline-block ${className || ''}`}>🔍</span>
const Grid = ({ className }: { className?: string }) => <span className={`inline-block ${className || ''}`}>⊞</span>
const List = ({ className }: { className?: string }) => <span className={`inline-block ${className || ''}`}>☰</span>

export default function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const resolvedParams = use(params)
  const [category, setCategory] = useState<Category | null>(null)
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [isFetchingProducts, setIsFetchingProducts] = useState(false)

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setIsPageLoading(true)
        // Fetch all categories to find the current one by slug
        const catResponse = await categoriesApi.getAll()
        if (catResponse.success && catResponse.data) {
          const currentCat = catResponse.data.find(c => c.slug === resolvedParams.category)
          if (currentCat) {
            setCategory(currentCat)
            setSelectedSubcategory(null)
            setSearchTerm("")
          }
        }
      } catch (error) {
        console.error("Failed to fetch category data:", error)
        toast.error("Failed to load products")
      } finally {
        setIsPageLoading(false)
      }
    }

    fetchCategory()
  }, [resolvedParams.category])

  useEffect(() => {
    if (!category) return

    const term = searchTerm.trim()
    setIsFetchingProducts(true)

    const t = setTimeout(async () => {
      try {
        const prodResponse = await productsApi.getAll(
          category.id,
          selectedSubcategory || undefined,
          term ? term : undefined
        )
        if (prodResponse.success) {
          setFilteredProducts(prodResponse.data || [])
        } else {
          setFilteredProducts([])
        }
      } catch (error) {
        console.error("Failed to fetch products:", error)
        setFilteredProducts([])
      } finally {
        setIsFetchingProducts(false)
      }
    }, 300)

    return () => clearTimeout(t)
  }, [category, selectedSubcategory, searchTerm])

  if (isPageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="animate-pulse text-xl text-muted-foreground font-serif">Loading products...</div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
          <Link href="/" className="text-primary hover:underline">
            Go back home
          </Link>
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
          <Link href="/products" className="hover:text-primary transition-colors">
            Products
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">{category.name}</span>
        </nav>

        {/* Category Header */}
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-primary to-primary-dark p-8 md:p-12 mb-12">
          <div className="absolute inset-0 opacity-20">
            <img
              src={category.name === "Fish Feeds" ? "/fish-feed.png" : (category.image || "/placeholder.svg")}
              alt={category.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative">
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">{category.name}</h1>
            <p className="text-white/80 max-w-xl">{category.description}</p>
          </div>
        </div>

        {/* Subcategory Filter */}
        {category.subcategories && category.subcategories.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-foreground" />
              <span className="font-medium">Filter by Subcategory:</span>
            </div>
            <Tabs
              value={selectedSubcategory || "all"}
              onValueChange={(v) => setSelectedSubcategory(v === "all" ? null : v)}
            >
              <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent p-0">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-full px-4"
                >
                  All Products
                </TabsTrigger>
                {category.subcategories.map((sub) => (
                  <TabsTrigger
                    key={sub.id}
                    value={sub.id}
                    className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-full px-4"
                  >
                    {sub.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        )}

        <div className="max-w-xl mb-8">
          <Input
            placeholder={`Search in ${category.name}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {isFetchingProducts && searchTerm.trim() && (
            <div className="text-xs text-muted-foreground mt-2">Searching...</div>
          )}
        </div>

        {/* Products Header */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-foreground">
            Showing <span className="font-medium text-foreground">{filteredProducts.length}</span> products
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
              className={`transition-all ${viewMode === "grid"
                ? "bg-primary text-white shadow-md"
                : "bg-transparent border-border hover:bg-muted"
                }`}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
              className={`transition-all ${viewMode === "list"
                ? "bg-primary text-white shadow-md"
                : "bg-transparent border-border hover:bg-muted"
                }`}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Products Grid/List */}
        {viewMode === "grid" ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <div key={product.id} className="animate-fade-up" style={{ animationDelay: `${index * 0.05}s` }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredProducts.map((product, index) => (
              <ProductListItem key={product.id} product={product} index={index} />
            ))}
          </div>
        )}

        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-foreground">No products found in this category.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function ProductListItem({ product, index }: { product: Product; index: number }) {
  const { addToCart, getStockWarning } = useCart()
  const { user } = useAuth()
  const { formatPrice } = require("@/lib/data")
  const stockWarning = getStockWarning(product.id)
  const isLowStock = product.stock <= 10 && product.stock > 0
  const isOutOfStock = product.stock === 0

  return (
    <div
      className="flex gap-4 p-4 bg-card rounded-xl border border-border hover:shadow-lg transition-all animate-fade-up"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <Link href={`/product/${product.id}`} className="w-32 h-32 shrink-0 rounded-lg overflow-hidden">
        <img src={product.image || "/placeholder.svg"} alt={product.name} className="w-full h-full object-cover" />
      </Link>
      <div className="grow">
        <Link href={`/product/${product.id}`}>
          <h3 className="font-medium text-lg hover:text-primary transition-colors">{product.name}</h3>
        </Link>
        <p className="text-sm text-foreground mt-1">{product.unit}</p>
        <p className="text-foreground mt-2 line-clamp-2">{product.description}</p>
        {isLowStock && <p className="text-accent-dark text-sm font-medium mt-2">Only {product.stock} left!</p>}
      </div>
      <div className="flex flex-col items-end justify-between">
        <span className="text-xl font-bold text-primary">{formatPrice(product.price)}</span>
        {user?.role !== "admin" && (
          <Button
            onClick={() => addToCart(product.id)}
            disabled={isOutOfStock}
            className="bg-accent hover:bg-accent-dark text-primary-dark"
          >
            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
          </Button>
        )}
      </div>
    </div>
  )
}
