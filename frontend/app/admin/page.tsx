"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { formatPrice, type Product } from "@/lib/data"
import { authApi, productsApi, categoriesApi, type Category as ApiCategory } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CategoryManager } from "@/components/admin/CategoryManager"
import { OrderManager } from "@/components/admin/OrderManager"
import { UserManager } from "@/components/admin/UserManager"
import { BookingManager } from "@/components/admin/BookingManager"
import { BatchManager } from "@/components/admin/BatchManager"
import { AdminSidebar, MobileSidebarToggle } from "@/components/admin/AdminSidebar"
import { ToastContainer } from "@/components/toast-notification"
import {
  Package,
  Plus,
  Trash2,
  Edit,
  Search,
  DollarSign,
  TrendingUp,
  X,
  Save,
  AlertTriangle,
  Upload,
  User,
  ShieldCheck,
  Phone,
  Camera,
  ShoppingCart,
  Music as Tiktok,
  Facebook,
  Instagram
} from 'lucide-react'
import { settingsApi } from "@/lib/api"

function AdminProfileSettings({ addToast }: { addToast: (m: string, t?: "success" | "error" | "info") => void }) {
  const { user, updateProfile } = useAuth()
  const [isUpdating, setIsUpdating] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    profile_picture: user?.profile_picture || ""
  })

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      addToast("File size must be less than 5MB", "error")
      return
    }

    setIsUploading(true)
    addToast("Uploading profile picture...", "info")

    try {
      const response = await productsApi.uploadImage(file)
      if (response.success && response.data?.url) {
        setProfileData({ ...profileData, profile_picture: response.data.url })
        addToast("Image uploaded successfully", "success")
      } else {
        addToast(response.error || "Failed to upload image", "error")
      }
    } catch (error) {
      addToast("Error uploading image", "error")
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    const success = await updateProfile(profileData)
    if (success) {
      addToast("Profile updated successfully", "success")
    } else {
      addToast("Failed to update profile", "error")
    }
    setIsUpdating(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          Admin Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center mb-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-muted flex items-center justify-center bg-muted relative">
                {isUploading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                  </div>
                )}
                {profileData.profile_picture ? (
                  <img src={profileData.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-muted-foreground" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-white hover:bg-muted border border-border flex items-center justify-center cursor-pointer transition-colors shadow-sm z-20">
                <Camera className="w-4 h-4 text-foreground" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
              </label>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">Click camera to upload</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-name">Full Name</Label>
              <Input id="admin-name" value={profileData.name} onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="admin-phone" className="pl-10" value={profileData.phone} onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email} disabled className="bg-muted" />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isUpdating}>
            {isUpdating ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function AdminPasswordSettings({ addToast }: { addToast: (m: string, t?: any) => void }) {
  const { user } = useAuth()
  const [isUpdating, setIsUpdating] = useState(false)
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordData.new_password !== passwordData.confirm_password) {
      addToast("Passwords do not match", "error")
      return
    }

    setIsUpdating(true)
    try {
      const response = await authApi.changePassword({
        id: user!.id,
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      })

      if (response.success) {
        addToast("Password changed successfully", "success")
        setPasswordData({ current_password: "", new_password: "", confirm_password: "" })
      } else {
        addToast(response.message || "Failed to change password", "error")
      }
    } catch (error) {
      addToast("An error occurred", "error")
    }
    setIsUpdating(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          Security
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-current-password">Current Password</Label>
            <Input id="admin-current-password" type="password" value={passwordData.current_password} onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-new-password">New Password</Label>
            <Input id="admin-new-password" type="password" value={passwordData.new_password} onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-confirm-password">Confirm New Password</Label>
            <Input id="admin-confirm-password" type="password" value={passwordData.confirm_password} onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })} />
          </div>
          <Button type="submit" className="w-full mt-4" disabled={isUpdating}>
            {isUpdating ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
function SocialMediaSettings({ addToast }: { addToast: (m: string, t?: any) => void }) {
  const [links, setLinks] = useState({
    facebook_link: "",
    instagram_link: "",
    tiktok_link: ""
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const response = await settingsApi.getAll()
        if (response.success && response.data) {
          setLinks({
            facebook_link: response.data.facebook_link || "",
            instagram_link: response.data.instagram_link || "",
            tiktok_link: response.data.tiktok_link || ""
          })
        }
      } catch (error) {
        addToast("Failed to load social links", "error")
      } finally {
        setIsLoading(false)
      }
    }
    fetchLinks()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    try {
      const response = await settingsApi.update(links)
      if (response.success) {
        addToast("Social media links updated", "success")
      } else {
        addToast(response.message || "Failed to update links", "error")
      }
    } catch (error) {
      addToast("An error occurred", "error")
    }
    setIsUpdating(false)
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 flex justify-center">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tiktok className="w-5 h-5 text-primary" />
          Social Media Links
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="facebook-link" className="flex items-center gap-2">
              <Facebook className="w-4 h-4 text-blue-600" /> Facebook Link
            </Label>
            <Input
              id="facebook-link"
              placeholder="https://facebook.com/..."
              value={links.facebook_link}
              onChange={(e) => setLinks({ ...links, facebook_link: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instagram-link" className="flex items-center gap-2">
              <Instagram className="w-4 h-4 text-pink-600" /> Instagram Link
            </Label>
            <Input
              id="instagram-link"
              placeholder="https://instagram.com/..."
              value={links.instagram_link}
              onChange={(e) => setLinks({ ...links, instagram_link: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tiktok-link" className="flex items-center gap-2">
              <Tiktok className="w-4 h-4 text-foreground" /> TikTok Link
            </Label>
            <Input
              id="tiktok-link"
              placeholder="https://tiktok.com/@..."
              value={links.tiktok_link}
              onChange={(e) => setLinks({ ...links, tiktok_link: e.target.value })}
            />
          </div>
          <Button type="submit" className="w-full mt-2" disabled={isUpdating}>
            {isUpdating ? "Saving..." : "Save Social Links"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function AdminDashboardContent() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<ApiCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddingProduct, setIsAddingProduct] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // New product form state
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: "",
    description: "",
    price: 0,
    category: "",
    subcategory: "",
    stock: 0,
    unit: "",
    image: "/placeholder.svg?height=400&width=400",
  })

  // Toast notifications
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type?: "success" | "error" | "info" }>>([])

  const addToast = (message: string, type: "success" | "error" | "info" = "success") => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    setToasts(prev => [...prev, { id, message, type }])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const loadCategories = async () => {
    setIsLoadingCategories(true)
    try {
      const response = await categoriesApi.getAll()
      if (response.success && response.data) {
        setCategories(response.data)
      }
    } catch (error) {
      console.error("Error loading categories:", error)
    } finally {
      setIsLoadingCategories(false)
    }
  }

  const loadProducts = async () => {
    setIsLoading(true)
    try {
      const response = await productsApi.getAll()
      if (response.success && response.data) {
        setProducts(response.data)
      } else {
        addToast(response.error || "Failed to load products", "error")
      }
    } catch (error) {
      addToast("Network error loading products", "error")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user && user.role === "admin") {
      loadProducts()
      loadCategories()
    }
  }, [user])

  useEffect(() => {
    if (activeTab === 'products' || activeTab === 'categories') {
      loadCategories()
    }
  }, [activeTab])

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.category || !newProduct.price) {
      addToast("Please fill in all required fields", "error")
      return
    }

    setIsSubmitting(true)
    try {
      const productData = {
        name: newProduct.name!,
        description: newProduct.description || "",
        price: newProduct.price!,
        category: newProduct.category!,
        subcategory: newProduct.subcategory,
        stock: newProduct.stock || 0,
        unit: newProduct.unit || "piece",
        image: newProduct.image || "/placeholder.svg?height=400&width=400",
      }

      const response = await productsApi.create(productData)

      if (response.success) {
        addToast("Product added successfully", "success")
        setIsAddingProduct(false)
        setNewProduct({
          name: "",
          description: "",
          price: 0,
          category: "",
          subcategory: "",
          stock: 0,
          unit: "",
          image: "/placeholder.svg?height=400&width=400",
        })
        loadProducts()
      } else {
        addToast(response.error || "Failed to add product", "error")
      }
    } catch (error) {
      addToast("Error creating product", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateProduct = async () => {
    if (!editingProduct) return
    setIsSubmitting(true)
    try {
      const response = await productsApi.update(editingProduct)
      if (response.success) {
        addToast("Product updated successfully", "success")
        setEditingProduct(null)
        loadProducts()
      } else {
        addToast(response.error || "Failed to update product", "error")
      }
    } catch (error) {
      addToast("Error updating product", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return
    try {
      const response = await productsApi.delete(id)
      if (response.success) {
        addToast("Product deleted successfully", "success")
        loadProducts()
      } else {
        addToast(response.error || "Failed to delete product", "error")
      }
    } catch (error) {
      addToast("Error deleting product", "error")
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      addToast("File size must be less than 5MB", "error")
      return
    }

    try {
      addToast("Uploading image...", "info")
      const response = await productsApi.uploadImage(file)
      if (response.success && response.data?.url) {
        const imageUrl = response.data.url
        if (isEdit && editingProduct) {
          setEditingProduct({ ...editingProduct, image: imageUrl })
        } else {
          setNewProduct({ ...newProduct, image: imageUrl })
        }
        addToast("Image uploaded successfully", "success")
      } else {
        addToast(response.error || "Failed to upload image", "error")
      }
    } catch (error) {
      console.error(error)
      addToast("Error uploading image", "error")
    }
  }

  const filteredProducts = products.filter((p) => {
    const category = categories.find((c) => c.id === p.category)
    const subcategory = category?.subcategories?.find((s) => s.id === p.subcategory)
    const searchLower = searchTerm.toLowerCase()
    return (
      p.name.toLowerCase().includes(searchLower) ||
      (category?.name || p.category).toLowerCase().includes(searchLower) ||
      (subcategory?.name || "").toLowerCase().includes(searchLower)
    )
  })

  const lowStockProducts = products.filter((p) => p.stock <= 10)
  const totalRevenue = products.reduce((sum, p) => sum + p.price * p.stock, 0)

  if (authLoading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-background pt-24 pb-16 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <>
      <MobileSidebarToggle
        isSidebarOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex min-h-screen bg-muted/30">
        <AdminSidebar
          activeSection={activeTab}
          onSectionChange={setActiveTab}
          isSidebarOpen={isSidebarOpen}
          onSidebarClose={() => setIsSidebarOpen(false)}
          lowStockCount={lowStockProducts.length}
        />

        <main id="main-content" className="flex-1 lg:ml-0 p-6 overflow-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-serif text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-foreground">Comprehensive management of products, inventory, and orders</p>
            </div>
            <Button onClick={() => setIsAddingProduct(true)} className="bg-primary hover:bg-primary-dark gap-2">
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-linear-to-br from-primary/10 to-transparent border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <Package className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{products.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Across {categories.length} categories</p>
              </CardContent>
            </Card>

            <Card className="bg-linear-to-br from-accent/10 to-transparent border-accent/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                <AlertTriangle className="w-4 h-4 text-accent-dark" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent-dark">{lowStockProducts.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Require attention soon</p>
              </CardContent>
            </Card>

            <Card className="bg-linear-to-br from-blue-500/10 to-transparent border-blue-500/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
                <DollarSign className="w-4 h-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{formatPrice(totalRevenue)}</div>
                <p className="text-xs text-muted-foreground mt-1">Potential revenue</p>
              </CardContent>
            </Card>

            <Card className="bg-linear-to-br from-green-500/10 to-transparent border-green-500/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
                <TrendingUp className="w-4 h-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{categories.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Active categories</p>
              </CardContent>
            </Card>
          </div>


          {/* Content based on active section */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Quick Access</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => setActiveTab('products')}>
                    <Package className="w-6 h-6" />
                    Manage Products
                  </Button>
                  <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => setActiveTab('orders')}>
                    <ShoppingCart className="w-6 h-6" />
                    View Orders
                  </Button>
                  <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => setActiveTab('categories')}>
                    <Plus className="w-6 h-6" />
                    Add Category
                  </Button>
                  <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => setActiveTab('users')}>
                    <User className="w-6 h-6" />
                    Manage Users
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Database</span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Connected</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">API Status</span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Online</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Low Stock Items</span>
                      <span className={`text-xs ${lowStockProducts.length > 0 ? "bg-accent/20 text-accent-dark" : "bg-green-100 text-green-700"} px-2 py-1 rounded-full`}>
                        {lowStockProducts.length} items
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "categories" && (
            <CategoryManager onNotification={addToast} />
          )}

          {activeTab === "users" && (
            <UserManager />
          )}

          {activeTab === "orders" && (
            <OrderManager />
          )}

          {activeTab === "bookings" && (
            <BookingManager />
          )}

          {activeTab === "batches" && (
            <BatchManager />
          )}

          {activeTab === "products" && (
            <>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative grow max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  {isLoading ? (
                    <div className="flex justify-center p-8">
                      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-left p-4 font-medium text-foreground">Product</th>
                          <th className="text-left p-4 font-medium text-foreground">Category</th>
                          <th className="text-left p-4 font-medium text-foreground">Price</th>
                          <th className="text-left p-4 font-medium text-foreground">Stock</th>
                          <th className="text-left p-4 font-medium text-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map((product) => {
                          const category = categories.find(c => c.id === product.category);
                          const subcategory = category?.subcategories?.find(s => s.id === product.subcategory);
                          return (
                            <tr key={product.id} className="border-t border-border hover:bg-muted/50">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <img src={product.image || "/placeholder.svg"} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                                  <div>
                                    <p className="font-medium">{product.name}</p>
                                    <p className="text-sm text-foreground">{product.unit}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="text-foreground font-medium">{category?.name || product.category}</div>
                                {subcategory && <div className="text-xs text-muted-foreground">{subcategory.name}</div>}
                              </td>
                              <td className="p-4 font-medium">{formatPrice(product.price)}</td>
                              <td className="p-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock <= 10 ? "bg-accent/20 text-accent-dark" : "bg-primary/20 text-primary"}`}>
                                  {product.stock} in stock
                                </span>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <Button size="icon" variant="ghost" onClick={() => setEditingProduct(product)} className="h-8 w-8">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button size="icon" variant="ghost" onClick={() => handleDeleteProduct(product.id)} className="h-8 w-8 text-destructive hover:text-destructive">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === "low-stock" && (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-4 font-medium text-foreground">Product</th>
                      <th className="text-left p-4 font-medium text-foreground">Stock</th>
                      <th className="text-left p-4 font-medium text-foreground">Status</th>
                      <th className="text-left p-4 font-medium text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockProducts.map((product) => (
                      <tr key={product.id} className="border-t border-border hover:bg-muted/50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img src={product.image || "/placeholder.svg"} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                            <p className="font-medium">{product.name}</p>
                          </div>
                        </td>
                        <td className="p-4 font-bold text-accent-dark">{product.stock}</td>
                        <td className="p-4">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-accent/20 text-accent-dark">
                            {product.stock === 0 ? "Out of Stock" : "Low Stock"}
                          </span>
                        </td>
                        <td className="p-4">
                          <Button size="sm" onClick={() => setEditingProduct(product)} className="gap-1">
                            <Edit className="w-3 h-3" />
                            Update Stock
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-8">
                <AdminProfileSettings addToast={addToast} />
                <AdminPasswordSettings addToast={addToast} />
              </div>
              <div className="space-y-8">
                <SocialMediaSettings addToast={addToast} />
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Add Product Modal */}
      {isAddingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-xl font-bold">Add New Product</h2>
              <button onClick={() => setIsAddingProduct(false)} className="p-2 hover:bg-muted rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div><Label>Product Name</Label><Input value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} /></div>
              <div><Label>Description</Label><Textarea value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Price (NGN)</Label><Input type="number" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })} /></div>
                <div><Label>Stock</Label><Input type="number" value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select value={newProduct.category} onValueChange={(v) => setNewProduct({ ...newProduct, category: v, subcategory: "" })}>
                    <SelectTrigger><SelectValue placeholder="Select category">{categories.find(c => c.id === newProduct.category)?.name}</SelectValue></SelectTrigger>
                    <SelectContent>{categories.map((cat) => (<SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Subcategory (Optional)</Label>
                  <Select value={newProduct.subcategory || "none"} onValueChange={(v) => setNewProduct({ ...newProduct, subcategory: v === "none" ? "" : v })}>
                    <SelectTrigger disabled={!newProduct.category || !categories.find(c => c.id === newProduct.category)?.subcategories?.length}>
                      <SelectValue placeholder="Select subcategory">{categories.find(c => c.id === newProduct.category)?.subcategories?.find(s => s.id === newProduct.subcategory)?.name}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {newProduct.category && categories.find(c => c.id === newProduct.category)?.subcategories?.map((sub) => (<SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Unit</Label><Input value={newProduct.unit} onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })} placeholder="e.g., 25kg bag" /></div>
              <div>
                <Label>Product Image</Label>
                <div className="flex items-center gap-4 mt-2">
                  {newProduct.image && (<div className="relative w-16 h-16 rounded-lg overflow-hidden border border-border"><img src={newProduct.image} alt="Preview" className="w-full h-full object-cover" /></div>)}
                  <div className="flex-1">
                    <label className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent h-10 px-4 py-2 w-full gap-2">
                      <Upload className="w-4 h-4" /> Upload Image
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, false)} disabled={isSubmitting} />
                    </label>
                  </div>
                </div>
              </div>
              <Button onClick={handleAddProduct} className="w-full bg-primary hover:bg-primary-dark gap-2" disabled={isSubmitting}>
                {isSubmitting ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Save className="w-4 h-4" />}
                Add Product
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-xl font-bold">Edit Product</h2>
              <button onClick={() => setEditingProduct(null)} className="p-2 hover:bg-muted rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div><Label>Product Name</Label><Input value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} /></div>
              <div><Label>Description</Label><Textarea value={editingProduct.description} onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Price (NGN)</Label><Input type="number" value={editingProduct.price} onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })} /></div>
                <div><Label>Stock</Label><Input type="number" value={editingProduct.stock} onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select value={editingProduct.category} onValueChange={(v) => setEditingProduct({ ...editingProduct, category: v, subcategory: "" })}>
                    <SelectTrigger><SelectValue placeholder="Select category">{categories.find(c => c.id === editingProduct.category)?.name}</SelectValue></SelectTrigger>
                    <SelectContent>{categories.map((cat) => (<SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Subcategory (Optional)</Label>
                  <Select value={editingProduct.subcategory || "none"} onValueChange={(v) => setEditingProduct({ ...editingProduct, subcategory: v === "none" ? "" : v })}>
                    <SelectTrigger disabled={!editingProduct.category || !categories.find(c => c.id === editingProduct.category)?.subcategories?.length}>
                      <SelectValue placeholder="Select subcategory">{categories.find(c => c.id === editingProduct.category)?.subcategories?.find(s => s.id === editingProduct.subcategory)?.name}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {editingProduct.category && categories.find(c => c.id === editingProduct.category)?.subcategories?.map((sub) => (<SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Unit</Label><Input value={editingProduct.unit} onChange={(e) => setEditingProduct({ ...editingProduct, unit: e.target.value })} /></div>
              <div>
                <Label>Product Image</Label>
                <div className="flex items-center gap-4 mt-2">
                  {editingProduct.image && (<div className="relative w-16 h-16 rounded-lg overflow-hidden border border-border"><img src={editingProduct.image} alt="Preview" className="w-full h-full object-cover" /></div>)}
                  <div className="flex-1">
                    <label className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent h-10 px-4 py-2 w-full gap-2">
                      <Upload className="w-4 h-4" /> Upload Image
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, true)} disabled={isSubmitting} />
                    </label>
                  </div>
                </div>
              </div>
              <Button onClick={handleUpdateProduct} className="w-full bg-primary hover:bg-primary-dark gap-2" disabled={isSubmitting}>
                {isSubmitting ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Save className="w-4 h-4" />}
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  )
}

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-muted/30 pt-24">
      <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>}>
        <AdminDashboardContent />
      </Suspense>
    </div>
  )
}
