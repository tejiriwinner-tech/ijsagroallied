"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { categories } from "@/lib/data"
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter, ChevronUp } from "lucide-react"

export default function Footer() {
  const [isVisible, setIsVisible] = useState(false)
  const footerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    if (footerRef.current) {
      observer.observe(footerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <footer ref={footerRef} className="bg-primary-dark text-white relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/20 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full translate-x-1/3 translate-y-1/3" />

      <div className="container mx-auto px-4 py-16 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className={`${isVisible ? "animate-slide-in-left" : "opacity-0"}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center p-2">
                <img
                  src="/m&vlogo.png"
                  alt="MV Agricultural Consult Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold">MV Agricultural Consult</h3>
                <p className="text-sm text-white/70">mvagriculturalconsult.com</p>
              </div>
            </div>
            <p className="text-white/80 mb-6 leading-relaxed">
              Your trusted partner for quality poultry feeds, day-old chicks, veterinary drugs, and farm supplies.
              Empowering farmers across Nigeria since 2015.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-accent transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-accent transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-accent transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className={`${isVisible ? "animate-fade-up stagger-1" : "opacity-0"}`}>
            <h4 className="font-serif text-lg font-bold mb-6 text-accent">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-white/80 hover:text-accent transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-accent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/day-old-chicks"
                  className="text-white/80 hover:text-accent transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-accent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  Day-Old Chicks
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-white/80 hover:text-accent transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-accent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-white/80 hover:text-accent transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-accent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  Login / Register
                </Link>
              </li>
            </ul>
          </div>

          {/* Product Categories */}
          <div className={`${isVisible ? "animate-fade-up stagger-2" : "opacity-0"}`}>
            <h4 className="font-serif text-lg font-bold mb-6 text-accent">Categories</h4>
            <ul className="space-y-3">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/products/${category.slug}`}
                    className="text-white/80 hover:text-accent transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-accent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className={`${isVisible ? "animate-slide-in-right stagger-3" : "opacity-0"}`}>
            <h4 className="font-serif text-lg font-bold mb-6 text-accent">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-accent mt-0.5" />
                <span className="text-white/80">
                  Zone D, Maraba Loko, Orozo,
                  <br />
                  Abuja, Nigeria
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-accent" />
                <a href="tel:+2348068451057" className="text-white/80 hover:text-accent transition-colors">
                  +234 806 845 1057
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-accent" />
                <a href="mailto:info@mvagriculturalconsult.com" className="text-white/80 hover:text-accent transition-colors">
                  info@mvagriculturalconsult.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/60 text-sm">
            © {new Date().getFullYear()} MV Agricultural Consult. All rights reserved.
          </p>
          <button
            onClick={scrollToTop}
            className="w-10 h-10 bg-accent rounded-full flex items-center justify-center hover:bg-accent-light transition-colors animate-float"
          >
            <ChevronUp className="w-5 h-5 text-primary-dark" />
          </button>
        </div>
      </div>
    </footer>
  )
}
