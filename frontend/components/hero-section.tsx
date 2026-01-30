"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Leaf, Award, Truck } from "lucide-react"

export default function HeroSection() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-linearr-to-br from-primary/5 via-background to-accent/5">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "1s" }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-32 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className={`${isLoaded ? "animate-slide-in-left" : "opacity-0"}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent-dark rounded-full mb-6">
              <Leaf className="w-4 h-4" />
              <span className="text-sm font-medium">Premium Quality Farm Supplies</span>
            </div>

            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              Nurturing Farms,{" "}
              <span className="text-primary relative">
                Growing Success
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none">
                  <path
                    d="M2 6C50 2 150 2 198 6"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-accent"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p className="text-lg text-foreground mb-8 max-w-lg leading-relaxed">
              Your trusted partner for quality poultry feeds, day-old chicks, veterinary drugs, and farm supplies.
              Empowering Nigerian farmers with premium agricultural products.
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <Link href="/products/chicken-feeds">
                <Button size="lg" className="bg-primary hover:bg-primary-dark text-white px-8 gap-2 group">
                  Shop Now
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/day-old-chicks">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-accent text-accent-dark hover:bg-accent hover:text-white px-8 bg-transparent"
                >
                  Book Day-Old Chicks
                </Button>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Award className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm text-foreground">Quality Assured</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                  <Truck className="w-5 h-5 text-accent-dark" />
                </div>
                <span className="text-sm text-foreground">Fast Delivery</span>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className={`relative ${isLoaded ? "animate-slide-in-right" : "opacity-0"}`}>
            <div className="relative aspect-square max-w-lg mx-auto">
              {/* Background Circle */}
              <div className="absolute inset-0 bg-linear-to-br from-primary to-primary-dark rounded-full animate-pulse-glow" />

              {/* Main Image */}
              <div className="absolute inset-4 rounded-full overflow-hidden border-4 border-accent">
                <img
                  src="/hero-poultry.png"
                  alt="Healthy poultry farm"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Floating Cards */}
              <div className="absolute -left-4 top-1/4 bg-card shadow-xl rounded-lg p-4 animate-float">
                <div className="text-2xl font-bold text-primary">10K+</div>
                <div className="text-xs text-foreground">Happy Farmers</div>
              </div>

              <div
                className="absolute -right-4 bottom-1/4 bg-card shadow-xl rounded-lg p-4 animate-float"
                style={{ animationDelay: "0.5s" }}
              >
                <div className="text-2xl font-bold text-accent-dark">500+</div>
                <div className="text-xs text-foreground">Products</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
