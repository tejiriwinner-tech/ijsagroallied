// PHP API Configuration and Helper Functions
// Update API_BASE_URL to point to your PHP server
// Note: The backend API has been moved from frontend/php-api to backend/api
// The API endpoints are located in backend/api/api/ directory

// IMPORTANT: If you're running XAMPP with the project in htdocs/ijsagroallied,
// the URL should be: http://localhost/ijsagroallied/backend/api/api
const API_BASE_URL = process.env.NEXT_PUBLIC_PHP_API_URL || "http://localhost/ijsagroallied/backend/api/api"

console.log("🌐 API_BASE_URL configured as:", API_BASE_URL)

interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// Generic fetch wrapper with error handling
async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    }

    if (options.body instanceof FormData) {
      delete (headers as any)["Content-Type"]
    }

    const fullUrl = `${API_BASE_URL}${endpoint}`
    console.log("🔍 API Request:", fullUrl)
    console.log("📦 Request body:", options.body)

    const response = await fetch(fullUrl, {
      ...options,
      headers,
    })

    console.log("📡 Response status:", response.status)
    const data = await response.json()
    console.log("📥 Response data:", data)
    return data
  } catch (error) {
    console.error("API Error:", error)
    return { success: false, error: "Network error occurred" }
  }
}

// Products API
export const productsApi = {
  getAll: (category?: string, subcategory?: string, search?: string) => {
    let url = "/products/index.php"
    const params = new URLSearchParams()
    if (category) params.append("category", category)
    if (subcategory) params.append("subcategory", subcategory)
    if (search) params.append("search", search)
    if (params.toString()) url += `?${params.toString()}`
    return fetchApi<Product[]>(url)
  },

  getById: (id: string) => fetchApi<Product>(`/products/single.php?id=${id}`),

  create: (product: Omit<Product, "id">) =>
    fetchApi<{ message: string; data: Product }>("/products/create.php", {
      method: "POST",
      body: JSON.stringify(product),
    }),

  update: (product: Product) =>
    fetchApi<{ message: string; data: Product }>("/products/update.php", {
      method: "PUT",
      body: JSON.stringify(product),
    }),

  delete: (id: string) =>
    fetchApi<{ message: string }>("/products/delete.php", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    }),

  uploadImage: (file: File) => {
    const formData = new FormData()
    formData.append("image", file)
    return fetchApi<{ url: string }>("/upload/index.php", {
      method: "POST",
      body: formData,
    })
  },
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    fetchApi<{ user: User; token: string }>("/auth/login.php", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (email: string, password: string, name: string) =>
    fetchApi<{ user: User; token: string }>("/auth/register.php", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    }),

  forgotPassword: (email: string) =>
    fetchApi<{ message: string; debug_reset_link?: string; debug_note?: string }>("/auth/forgot-password.php", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, password: string) =>
    fetchApi<{ message: string }>("/auth/reset-password.php", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    }),

  updateProfile: (data: { id: string; name: string; phone?: string; profile_picture?: string }) =>
    fetchApi<{ user: User; message: string }>("/users/update.php", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  changePassword: (data: { id: string; current_password: string; new_password: string }) =>
    fetchApi<{ message: string }>("/auth/change-password.php", {
      method: "POST",
      body: JSON.stringify(data),
    }),
}

// Settings API
export const settingsApi = {
  getAll: () => fetchApi<Record<string, string>>("/settings/get.php"),
  update: (settings: Record<string, string>) =>
    fetchApi<{ message: string }>("/settings/update.php", {
      method: "POST",
      body: JSON.stringify(settings),
    }),
}

// Orders API
export const ordersApi = {
  getAll: (userId?: string) => {
    const url = userId ? `/orders/index.php?user_id=${userId}` : "/orders/index.php"
    return fetchApi<Order[]>(url)
  },

  create: (order: CreateOrderRequest) =>
    fetchApi<{ orderId: string; message: string }>("/orders/index.php", {
      method: "POST",
      body: JSON.stringify(order),
    }),

  updateStatus: (orderId: string, status: Order["status"]) =>
    fetchApi<{ message: string }>("/orders/update-status.php", {
      method: "PUT",
      body: JSON.stringify({ orderId, status }),
    }),
}

// Categories API
export const categoriesApi = {
  getAll: () => fetchApi<Category[]>("/categories/index.php"),
}

// Cart API
export const cartApi = {
  get: () => fetchApi<CartItem[]>("/cart/get.php"),
  sync: (items: CartItem[]) => fetchApi<{ message: string }>("/cart/sync.php", {
    method: "POST",
    body: JSON.stringify({ items }),
  }),
}

// Chick Batches API
export const chicksApi = {
  getBatches: () => fetchApi<ChickBatch[]>("/chicks/batches.php"),

  createBooking: (booking: CreateBookingRequest) =>
    fetchApi<{ bookingId: string; message: string }>("/bookings/index.php", {
      method: "POST",
      body: JSON.stringify(booking),
    }),

  getBookings: (userId?: string) => {
    const url = userId ? `/bookings/index.php?user_id=${userId}` : "/bookings/index.php"
    return fetchApi<ChickBooking[]>(url)
  },
}

// Payments API
export const paymentsApi = {
  initialize: (data: { email: string; amount: number; callback_url: string; metadata: any }) =>
    fetchApi<{ authorization_url: string; access_code: string; reference: string }>("/payments/initialize.php", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  verify: (reference: string) =>
    fetchApi<{ orderId: string; message: string }>(`/payments/verify.php?reference=${reference}`),
}

// Types
export interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  subcategory?: string
  stock: number
  unit: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  image: string
  subcategories?: { id: string; name: string; slug: string }[]
}

export interface User {
  id: string
  email: string
  name: string
  phone?: string
  role: "admin" | "user"
  profile_picture?: string
}

export interface Order {
  id: string
  user_id: string
  total: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  created_at: string
  items: OrderItem[]
}

export interface OrderItem {
  product_id: string
  quantity: number
  price_at_purchase: number
  product_name: string
}

export interface CartItem {
  productId: string
  quantity: number
}

export interface ChickBatch {
  id: string
  breed: string
  available_date: string
  price_per_chick: number
  minimum_order: number
  available_quantity: number
  description: string
}

export interface ChickBooking {
  id: string
  batch_id: string
  breed: string
  quantity: number
  total_price: number
  customer_name: string
  customer_email: string
  customer_phone: string
  delivery_address: string
  description?: string
  pickup_date: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
  created_at: string
}

export interface CreateOrderRequest {
  userId: string
  total: number
  items: {
    productId: string
    quantity: number
    priceAtPurchase: number
    productName: string
  }[]
}

export interface CreateBookingRequest {
  userId?: string
  batchId: string
  breed: string
  quantity: number
  totalPrice: number
  customerName: string
  customerEmail: string
  customerPhone: string
  deliveryAddress: string
  description?: string
  pickupDate: string
}

// Admin API
import type {
  Category as AdminCategory,
  Subcategory as AdminSubcategory,
  CategoryInput,
  SubcategoryInput,
  Order as AdminOrder,
  OrderDetails,
  OrderFilters,
  User as AdminUser,
  UserDetails,
  UserFilters,
  CheckProductsResponse,
} from './admin-types'

export class AdminAPI {
  private token?: string

  constructor(token?: string) {
    this.token = token
  }

  private async fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      // Use provided token or get from localStorage
      const authToken = this.token || (typeof window !== "undefined" ? localStorage.getItem("auth_token") : null)

      const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
        ...options.headers,
      }

      const fullUrl = `${API_BASE_URL}${endpoint}`
      console.log("🔍 AdminAPI Request:", fullUrl)
      console.log("🔑 Auth Token:", authToken ? "Present" : "Missing")
      console.log("📦 Request body:", options.body)

      const response = await fetch(fullUrl, {
        ...options,
        headers,
      })

      console.log("📡 Response status:", response.status)
      const data = await response.json()
      console.log("📥 Response data:", data)

      // Handle authentication errors
      if (response.status === 401 || response.status === 403) {
        // Clear invalid token
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth_token")
          localStorage.removeItem("user")
        }
        throw new Error("Authentication failed. Please log in again.")
      }

      return data
    } catch (error) {
      console.error("AdminAPI Error:", error)
      if (error instanceof Error) {
        return { success: false, error: error.message }
      }
      return { success: false, error: "Network error occurred" }
    }
  }

  // Categories
  async getCategories(): Promise<AdminCategory[]> {
    const response = await this.fetchApi<AdminCategory[]>('/categories/list.php')
    if (!response.success) {
      throw new Error(response.error || response.message || 'Failed to fetch categories')
    }

    // Map 'image' field to 'image_url' for consistency
    const categories = (response.data || []).map(category => ({
      ...category,
      image_url: category.image || category.image_url
    }))

    return categories
  }

  async createCategory(data: CategoryInput): Promise<AdminCategory> {
    const response = await this.fetchApi<AdminCategory>('/categories/create.php', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    if (!response.success) {
      throw new Error(response.error || response.message || 'Failed to create category')
    }

    // Map 'image' field to 'image_url' for consistency
    const category = {
      ...response.data!,
      image_url: response.data!.image || response.data!.image_url
    }

    return category
  }

  async updateCategory(id: string, data: CategoryInput): Promise<AdminCategory> {
    const response = await this.fetchApi<AdminCategory>('/categories/update.php', {
      method: 'PUT',
      body: JSON.stringify({ id, ...data }),
    })
    if (!response.success) {
      throw new Error(response.error || response.message || 'Failed to update category')
    }

    // Map 'image' field to 'image_url' for consistency
    const category = {
      ...response.data!,
      image_url: response.data!.image || response.data!.image_url
    }

    return category
  }

  async deleteCategory(id: string): Promise<void> {
    const response = await this.fetchApi<void>('/categories/delete.php', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    })
    if (!response.success) {
      throw new Error(response.error || response.message || 'Failed to delete category')
    }
  }

  async checkCategoryProducts(id: string): Promise<CheckProductsResponse> {
    const response = await this.fetchApi<CheckProductsResponse>(`/categories/check-products.php?id=${id}`)
    if (!response.success) {
      throw new Error(response.error || response.message || 'Failed to check category products')
    }
    return response.data!
  }

  // Subcategories
  async createSubcategory(data: SubcategoryInput): Promise<AdminSubcategory> {
    const response = await this.fetchApi<AdminSubcategory>('/subcategories/create.php', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    if (!response.success) {
      throw new Error(response.error || response.message || 'Failed to create subcategory')
    }
    return response.data!
  }

  async updateSubcategory(id: string, data: SubcategoryInput): Promise<AdminSubcategory> {
    const response = await this.fetchApi<AdminSubcategory>('/subcategories/update.php', {
      method: 'PUT',
      body: JSON.stringify({ id, ...data }),
    })
    if (!response.success) {
      throw new Error(response.error || response.message || 'Failed to update subcategory')
    }
    return response.data!
  }

  async deleteSubcategory(id: string): Promise<void> {
    const response = await this.fetchApi<void>('/subcategories/delete.php', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    })
    if (!response.success) {
      throw new Error(response.error || response.message || 'Failed to delete subcategory')
    }
  }

  // Orders
  async getOrders(filters?: OrderFilters): Promise<AdminOrder[]> {
    let url = '/orders/list.php'
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.search) params.append('search', filters.search)
    if (params.toString()) url += `?${params.toString()}`

    const response = await this.fetchApi<AdminOrder[]>(url)
    if (!response.success) {
      throw new Error(response.error || response.message || 'Failed to fetch orders')
    }
    return response.data || []
  }

  async getOrderDetails(id: string): Promise<OrderDetails> {
    const response = await this.fetchApi<OrderDetails>(`/orders/details.php?id=${id}`)
    if (!response.success) {
      throw new Error(response.error || response.message || 'Failed to fetch order details')
    }
    return response.data!
  }

  async updateOrderStatus(id: string, status: string): Promise<AdminOrder> {
    const response = await this.fetchApi<AdminOrder>('/orders/update-status.php', {
      method: 'PUT',
      body: JSON.stringify({ id, status }),
    })
    if (!response.success) {
      throw new Error(response.error || response.message || 'Failed to update order status')
    }
    return response.data!
  }

  async getUserOrders(userId: string): Promise<AdminOrder[]> {
    const response = await this.fetchApi<AdminOrder[]>(`/orders/by-user.php?user_id=${userId}`)
    if (!response.success) {
      throw new Error(response.error || response.message || 'Failed to fetch user orders')
    }
    return response.data || []
  }

  // Users
  async getUsers(filters?: UserFilters): Promise<AdminUser[]> {
    let url = '/users/list.php'
    const params = new URLSearchParams()
    if (filters?.role) params.append('role', filters.role)
    if (filters?.search) params.append('search', filters.search)
    if (params.toString()) url += `?${params.toString()}`

    const response = await this.fetchApi<AdminUser[]>(url)
    if (!response.success) {
      throw new Error(response.error || response.message || 'Failed to fetch users')
    }
    return response.data || []
  }

  async getUserDetails(id: string): Promise<UserDetails> {
    const response = await this.fetchApi<UserDetails>(`/users/details.php?id=${id}`)
    if (!response.success) {
      throw new Error(response.error || response.message || 'Failed to fetch user details')
    }
    return response.data!
  }

  async updateUserRole(id: string, role: string): Promise<AdminUser> {
    const response = await this.fetchApi<AdminUser>('/users/update-role.php', {
      method: 'PUT',
      body: JSON.stringify({ id, role }),
    })
    if (!response.success) {
      throw new Error(response.error || response.message || 'Failed to update user role')
    }
    return response.data!
  }

  async deleteUser(id: string): Promise<void> {
    const response = await this.fetchApi<void>('/users/delete.php', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    })
    if (!response.success) {
      throw new Error(response.error || response.message || 'Failed to delete user')
    }
  }

  // Chick Bookings
  async getBookings(): Promise<ChickBooking[]> {
    const response = await this.fetchApi<ChickBooking[]>('/bookings/index.php')
    if (!response.success) {
      throw new Error(response.error || response.message || 'Failed to fetch bookings')
    }
    const bookings = response.data || []
    return bookings.map((b) => ({
      ...b,
      quantity: Number((b as any).quantity),
      total_price: Number((b as any).total_price),
      customer_name: (b as any).customer_name || '',
      customer_email: (b as any).customer_email || '',
      customer_phone: (b as any).customer_phone || '',
    }))
  }

  async updateBookingStatus(id: string, status: string): Promise<void> {
    const response = await this.fetchApi<void>('/bookings/index.php', {
      method: 'PUT',
      body: JSON.stringify({ id, status }),
    })
    if (!response.success) {
      throw new Error(response.error || response.message || 'Failed to update booking status')
    }
  }

  // Chick Batches
  async getBatches(): Promise<ChickBatch[]> {
    const response = await this.fetchApi<ChickBatch[]>('/chicks/batches.php')
    if (!response.success) {
      throw new Error(response.error || response.message || 'Failed to fetch batches')
    }
    return response.data || []
  }
}

// Export a singleton instance
export const adminApi = new AdminAPI()
