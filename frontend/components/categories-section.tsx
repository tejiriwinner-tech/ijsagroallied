"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { categoriesApi, type Category } from "@/lib/api"
import { ArrowRight } from "lucide-react"

export default function CategoriesSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesApi.getAll()
        if (response.success && response.data) {
          setCategories(response.data)
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error)
      }
    }

    fetchCategories()

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className={`text-center mb-16 ${isVisible ? "animate-fade-up" : "opacity-0"}`}>
          <span className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            Our Categories
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">Everything Your Farm Needs</h2>
          <p className="text-foreground max-w-2xl mx-auto">
            Browse our comprehensive range of agricultural products designed to help your farm thrive.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {categories.slice(0, 6).map((category, index) => (
            <Link
              key={category.id}
              href={`/products/${category.slug}`}
              className={`group relative overflow-hidden rounded-2xl bg-card shadow-lg hover:shadow-2xl transition-all duration-500 ${isVisible ? "animate-fade-up" : "opacity-0"
                }`}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Image */}
              <div className="aspect-4/3 overflow-hidden">
                <img
                  src={category.name === "Fish Feeds" ? "/fish-feed.png" : (category.image || "/placeholder.svg")}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-linear-to-t from-primary-dark/90 via-primary-dark/30 to-transparent" />
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="font-serif text-xl font-bold mb-2 group-hover:text-accent transition-colors">
                  {category.name}
                </h3>
                <p className="text-white/80 text-sm mb-4 line-clamp-2">{category.description}</p>
                <div className="flex items-center gap-2 text-accent font-medium text-sm">
                  <span>Shop Now</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Subcategories Badge */}
              {category.subcategories && category.subcategories.length > 0 && (
                <div className="absolute top-4 right-4 bg-accent text-primary-dark text-xs font-bold px-3 py-1 rounded-full">
                  {category.subcategories.length} Brands
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
