"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { productsApi, cartApi, type Product, type CartItem } from "@/lib/api"
import { useAuth } from "./auth-context"

interface CartContextType {
  items: CartItem[]
  products: Product[]
  isLoading: boolean
  addToCart: (productId: string, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getCartTotal: () => number
  getCartCount: () => number
  getProduct: (productId: string) => Product | undefined
  getStockWarning: (productId: string) => string | null
  refreshProducts: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    // Clear cart if user logs out
    if (isLoaded && !user) {
      setItems([])
      localStorage.removeItem("cart")
    }

    // Load account-based cart when user logs in
    if (isLoaded && user) {
      const loadAccountCart = async () => {
        try {
          const response = await cartApi.get()
          if (response.success && response.data) {
            const accountItems = response.data

            // Merge local items into account items
            const localStored = localStorage.getItem("cart")
            const localItems: CartItem[] = localStored ? JSON.parse(localStored) : []

            if (localItems.length > 0) {
              const merged = [...accountItems]
              localItems.forEach(localItem => {
                const existingIndex = merged.findIndex(i => i.productId === localItem.productId)
                if (existingIndex > -1) {
                  // If both exist, we can choose to take the local one or sum them
                  // Taking the local one usually makes more sense for "recent actions"
                  merged[existingIndex].quantity = localItem.quantity
                } else {
                  merged.push(localItem)
                }
              })
              setItems(merged)
              // Sync merged cart back to API
              await cartApi.sync(merged)
            } else {
              setItems(accountItems)
            }
          }
        } catch (error) {
          console.error("Failed to load account cart:", error)
        }
      }
      loadAccountCart()
    }
  }, [user, isLoaded])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productsApi.getAll()
        if (response.success && response.data) {
          setProducts(response.data)
        }
      } catch (error) {
        console.error("Failed to fetch products:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()

    const stored = localStorage.getItem("cart")
    if (stored) {
      setItems(JSON.parse(stored))
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("cart", JSON.stringify(items))

      // Sync to API if logged in
      if (user) {
        const syncTimer = setTimeout(() => {
          cartApi.sync(items).catch(err => console.error("Auto-sync failed:", err))
        }, 500) // Debounce sync
        return () => clearTimeout(syncTimer)
      }
    }
  }, [items, isLoaded, user])

  const refreshProducts = async () => {
    try {
      const response = await productsApi.getAll()
      if (response.success && response.data) {
        setProducts(response.data)
      }
    } catch (error) {
      console.error("Failed to refresh products:", error)
    }
  }

  const getProduct = (productId: string) => {
    return products.find((p) => p.id === productId)
  }

  const getStockWarning = (productId: string): string | null => {
    const product = getProduct(productId)
    if (product && product.stock <= 10 && product.stock > 0) {
      return `Only ${product.stock} left in stock!`
    }
    if (product && product.stock === 0) {
      return "Out of stock"
    }
    return null
  }

  const addToCart = (productId: string, quantity = 1) => {
    console.log("🛒 Adding to cart:", productId, "quantity:", quantity)
    const product = getProduct(productId)
    console.log("📦 Product found:", product)

    if (!product || product.stock === 0) {
      console.log("❌ Cannot add to cart: product not found or out of stock")
      return
    }

    setItems((prev) => {
      const existing = prev.find((item) => item.productId === productId)
      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, product.stock)
        console.log("✅ Updated quantity:", newQty)
        return prev.map((item) => (item.productId === productId ? { ...item, quantity: newQty } : item))
      }
      console.log("✅ Added new item to cart")
      return [...prev, { productId, quantity: Math.min(quantity, product.stock) }]
    })
  }

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    const product = getProduct(productId)
    if (!product) return

    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity: Math.min(quantity, product.stock) } : item,
      ),
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const getCartTotal = () => {
    return items.reduce((total, item) => {
      const product = getProduct(item.productId)
      return total + (product?.price || 0) * item.quantity
    }, 0)
  }

  const getCartCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0)
  }

  return (
    <CartContext.Provider
      value={{
        items,
        products,
        isLoading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        getProduct,
        getStockWarning,
        refreshProducts,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
