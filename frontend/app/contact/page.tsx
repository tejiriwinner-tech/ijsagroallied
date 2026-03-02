"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageCircle,
  FileQuestion,
  Check
} from "lucide-react"

const contactMethods = [
  {
    icon: Phone,
    title: "Call Us",
    description: "Mon-Sat from 8am to 6pm",
    value: "+234 806 845 1057",
    action: "tel:+2348068451057",
  },
  {
    icon: Mail,
    title: "Email Us",
    description: "We reply within 24 hours",
    value: "info@mvagriculturalconsult.com",
    action: "mailto:info@mvagriculturalconsult.com",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp",
    description: "Quick responses",
    value: "+234 806 845 1057",
    action: "https://wa.me/2348068451057",
  },
]

const faqs = [
  {
    question: "What is your minimum order quantity?",
    answer:
      "For feeds, there's no minimum order. For day-old chicks, the minimum order depends on the breed - typically 50-100 chicks.",
  },
  {
    question: "Do you deliver nationwide?",
    answer:
      "Yes, we deliver to all states in Nigeria. Delivery times vary from 1-5 business days depending on your location.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept bank transfers, card payments, and cash on delivery for select locations.",
  },
  {
    question: "Are your vaccines properly stored?",
    answer: "Yes, all vaccines are stored in temperature-controlled facilities and delivered in cold chain packaging.",
  },
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    setIsSubmitted(true)
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
          <span className="text-foreground font-medium">Contact Us</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            Get in Touch
          </span>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
            We&apos;d Love to Hear From You
          </h1>
          <p className="text-foreground max-w-2xl mx-auto">
            Have questions about our products or need expert advice for your farm? Our team is here to help you succeed.
          </p>
        </div>

        {/* Contact Methods - Unique Hexagon Design */}
        <div ref={sectionRef} className="grid md:grid-cols-3 gap-6 mb-20">
          {contactMethods.map((method, index) => (
            <a
              key={method.title}
              href={method.action}
              className={`group relative bg-card rounded-2xl p-8 border border-border hover:border-primary hover:shadow-xl transition-all duration-500 overflow-hidden ${isVisible ? "animate-fade-up" : "opacity-0"
                }`}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-primary/10 to-accent/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />

              <div className="relative">
                <div className="w-16 h-16 bg-linear-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <method.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-serif text-xl font-bold text-foreground mb-2">{method.title}</h3>
                <p className="text-sm text-foreground mb-4">{method.description}</p>
                <p className="font-medium text-primary group-hover:text-accent-dark transition-colors">
                  {method.value}
                </p>
              </div>
            </a>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          {/* Contact Form */}
          <div className="bg-card rounded-2xl p-8 border border-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                <Send className="w-6 h-6 text-accent-dark" />
              </div>
              <div>
                <h2 className="font-serif text-2xl font-bold text-foreground">Send Us a Message</h2>
                <p className="text-sm text-foreground">We typically respond within 24 hours</p>
              </div>
            </div>

            {isSubmitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-serif text-xl font-bold mb-2 text-foreground">Message Sent!</h3>
                <p className="text-foreground mb-6">
                  Thank you for reaching out. We&apos;ll get back to you soon.
                </p>
                <Button onClick={() => setIsSubmitted(false)} variant="outline" className="bg-transparent">
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary-dark text-primary-foreground py-6"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            )}
          </div>

          {/* Map & Info */}
          <div className="space-y-6">
            {/* Map Placeholder */}
            <div className="bg-card rounded-2xl overflow-hidden border border-border">
              <div className="aspect-video bg-muted relative">
                <img src="/map-of-ibadan-nigeria.jpg" alt="Our location" className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-primary-dark/50">
                  <div className="text-center text-white">
                    <MapPin className="w-8 h-8 mx-auto mb-2" />
                    <p className="font-medium">Zone D, Maraba Loko, Orozo</p>
                    <p className="text-sm opacity-80">Abuja, Nigeria</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-serif text-lg font-bold text-foreground">Business Hours</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-foreground">Monday - Friday</span>
                  <span className="font-medium">8:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground">Saturday</span>
                  <span className="font-medium">9:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground">Sunday</span>
                  <span className="font-medium text-destructive">Closed</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-linear-to-br from-primary/5 to-accent/5 rounded-3xl p-8 md:p-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center">
              <FileQuestion className="w-6 h-6 text-primary-dark" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-foreground">Frequently Asked Questions</h2>
              <p className="text-sm text-foreground">Quick answers to common questions</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-card rounded-xl p-6 border border-border">
                <h4 className="font-medium text-foreground mb-2">{faq.question}</h4>
                <p className="text-sm text-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
