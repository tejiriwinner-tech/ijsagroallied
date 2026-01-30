"use client"

import { useEffect, useRef, useState } from "react"
import { Shield, Truck, Headphones, BadgeCheck, Leaf, Clock } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "Quality Guaranteed",
    description: "All products undergo strict quality checks before reaching your farm.",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    description: "Swift nationwide delivery to ensure your farm never runs short.",
  },
  {
    icon: Headphones,
    title: "Expert Support",
    description: "Our agricultural experts are always ready to assist you.",
  },
  {
    icon: BadgeCheck,
    title: "Trusted Brands",
    description: "We partner with only the most reputable agricultural brands.",
  },
  {
    icon: Leaf,
    title: "Sustainable Practices",
    description: "Committed to eco-friendly farming solutions.",
  },
  {
    icon: Clock,
    title: "10+ Years Experience",
    description: "A decade of serving Nigerian farmers with excellence.",
  },
]

export default function WhyChooseUs() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
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
    <section ref={sectionRef} className="py-24 bg-primary-dark text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute top-0 left-0 w-full h-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className={`text-center mb-16 ${isVisible ? "animate-fade-up" : "opacity-0"}`}>
          <span className="inline-block px-4 py-1 bg-accent/20 text-accent rounded-full text-sm font-medium mb-4">
            Why Choose Us
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">The IJS Advantage</h2>
          <p className="text-white/70 max-w-2xl mx-auto">
            We go beyond just selling products. We partner with you for your farm&apos;s success.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`bg-white/5 backdrop-blur-sm rounded-xl p-6 hover:bg-white/10 transition-all duration-300 border border-white/10 ${isVisible ? "animate-fade-up" : "opacity-0"
                }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-14 h-14 bg-accent/20 rounded-xl flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-accent-dark" />
              </div>
              <h3 className="font-serif text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-white/70">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
