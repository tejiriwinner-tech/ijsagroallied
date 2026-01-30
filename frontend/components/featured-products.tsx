"use client"

import { useEffect, useRef, useState } from "react"
import { productsApi, type Product } from "@/lib/api"
import ProductCard from "@/components/product-card"

export default function FeaturedProducts() {
  const [isVisible, setIsVisible] = useState(false)
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productsApi.getAll()
        if (response.success && response.data) {
          setFeaturedProducts(response.data.slice(0, 8))
        }
      } catch (error) {
        console.error("Failed to fetch featured products:", error)
      }
    }

    fetchProducts()

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="py-24">
      <div className="container mx-auto px-4">
        <div className={`text-center mb-16 ${isVisible ? "animate-fade-up" : "opacity-0"}`}>
          <span className="inline-block px-4 py-1 bg-accent/10 text-accent-dark rounded-full text-sm font-medium mb-4">
            Featured Products
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">Top Selling Products</h2>
          <p className="text-foreground max-w-2xl mx-auto">
            Our most popular products trusted by thousands of farmers across Nigeria.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product, index) => (
            <div
              key={product.id}
              className={`${isVisible ? "animate-fade-up" : "opacity-0"}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
