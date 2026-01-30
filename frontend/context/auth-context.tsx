"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { authApi, ordersApi, type User, type Order } from "@/lib/api"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name: string) => Promise<boolean>
  logout: () => void
  orders: Order[]
  fetchOrders: () => Promise<void>
  addOrder: (orderData: {
    userId: string
    items: {
      productId: string
      quantity: number
      priceAtPurchase: number
      productName: string
    }[]
    total: number
    status: string
  }) => Promise<void>
  updateProfile: (data: { name: string; phone?: string; profile_picture?: string }) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log("🔐 AuthContext: Starting login for", email)
      const response = await authApi.login(email, password)
      console.log("📥 AuthContext: Received response", response)

      if (response.success && response.data) {
        const { user: userData, token } = response.data
        console.log("✅ AuthContext: Login successful, user:", userData)
        setUser(userData)
        localStorage.setItem("user", JSON.stringify(userData))
        localStorage.setItem("auth_token", token)
        console.log("💾 AuthContext: Saved to localStorage")
        return true
      }
      console.log("❌ AuthContext: Login failed - no success or data in response")
      return false
    } catch (error) {
      console.error("❌ AuthContext: Login error:", error)
      return false
    }
  }

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const response = await authApi.register(email, password, name)

      if (response.success && response.data) {
        const { user: userData, token } = response.data
        setUser(userData)
        localStorage.setItem("user", JSON.stringify(userData))
        localStorage.setItem("auth_token", token)
        return true
      }
      return false
    } catch (error) {
      console.error("Registration error:", error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    setOrders([])
    localStorage.removeItem("user")
    localStorage.removeItem("auth_token")
  }

  const fetchOrders = async () => {
    if (!user) return

    try {
      const response = await ordersApi.getAll(user.id)
      if (response.success && response.data) {
        setOrders(response.data)
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error)
    }
  }

  const addOrder = async (orderData: {
    userId: string
    items: {
      productId: string
      quantity: number
      priceAtPurchase: number
      productName: string
    }[]
    total: number
    status: string
  }) => {
    try {
      const response = await ordersApi.create({
        userId: orderData.userId,
        total: orderData.total,
        items: orderData.items,
      })

      if (response.success) {
        // Refresh orders after creating a new one
        await fetchOrders()
      }
    } catch (error) {
      console.error("Failed to create order:", error)
      throw error
    }
  }

  const updateProfile = async (data: { name: string; phone?: string; profile_picture?: string }): Promise<boolean> => {
    if (!user) return false
    try {
      const response = await authApi.updateProfile({ ...data, id: user.id })
      if (response.success && response.data?.user) {
        const updatedUser = response.data.user
        setUser(updatedUser)
        localStorage.setItem("user", JSON.stringify(updatedUser))
        return true
      }
      return false
    } catch (error) {
      console.error("Failed to update profile:", error)
      return false
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, orders, fetchOrders, addOrder, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
