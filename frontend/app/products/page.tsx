"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { categoriesApi, productsApi, type Category, type Product } from "@/lib/api"
import { Input } from "@/components/ui/input"
import ProductCard from "@/components/product-card"
import { toast } from "sonner"

// Simple icon component
const ArrowRight = ({ className }: { className?: string }) => <span className={`inline-block ${className || ''}`}>→</span>

export default function ProductsPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true)
        const response = await categoriesApi.getAll()
        if (response.success && response.data) {
          setCategories(response.data)
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error)
        toast.error("Failed to load categories")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  useEffect(() => {
    const term = searchTerm.trim()
    if (!term) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    const t = setTimeout(async () => {
      try {
        const response = await productsApi.getAll(undefined, undefined, term)
        if (response.success) {
          setSearchResults(response.data || [])
        } else {
          setSearchResults([])
        }
      } catch (error) {
        console.error("Failed to search products:", error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(t)
  }, [searchTerm])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <div className="animate-pulse text-xl text-muted-foreground font-serif">Loading categories...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl font-bold text-foreground mb-4">Our Products</h1>
          <p className="text-foreground max-w-2xl mx-auto">
            Browse our comprehensive range of quality poultry feeds, veterinary products, and farm supplies.
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-10">
          <Input
            placeholder="Search products (e.g. vaccine, antibiotics, feed...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {isSearching && (
            <div className="text-sm text-muted-foreground mt-2 text-center">Searching...</div>
          )}
        </div>

        {searchTerm.trim() && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-2xl font-bold text-foreground">Search Results</h2>
              <p className="text-sm text-muted-foreground">{searchResults.length} found</p>
            </div>

            {searchResults.length === 0 && !isSearching ? (
              <div className="text-center py-12 text-muted-foreground">No products found.</div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products/${category.slug}`}
              className="group relative overflow-hidden rounded-2xl bg-card shadow-lg hover:shadow-2xl transition-all duration-500"
            >
              <div className="aspect-4/3 overflow-hidden">
                <img
                  src={category.name === "Fish Feeds" ? "/fish-feed.png" : (category.image || "/placeholder.svg")}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-linear-to-t from-primary-dark/90 via-primary-dark/30 to-transparent" />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="font-serif text-xl font-bold mb-2 group-hover:text-accent transition-colors">
                  {category.name}
                </h3>
                <p className="text-white/80 text-sm mb-4 line-clamp-2">{category.description}</p>
                <div className="flex items-center gap-2 text-accent font-medium text-sm">
                  <span>View Products</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
