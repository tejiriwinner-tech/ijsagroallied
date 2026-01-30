"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { authApi, chicksApi, type ChickBooking, type Order } from "@/lib/api"
import { formatPrice } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Clock,
  Package,
  Truck,
  Check,
  ShoppingBag,
  User,
  Calendar,
  CreditCard,
  Settings,
  History,
  LayoutDashboard,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Phone,
  Camera,
  Save,
  Menu,
  X,
  Upload,
  XCircle,
  AlertCircle
} from "lucide-react"
import { productsApi } from "@/lib/api"

// Utility function for consistent date formatting
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

function ChickBookingCard({ booking }: { booking: ChickBooking }) {
  const statusKey = booking.status as keyof typeof bookingStatusLabels
  const label = bookingStatusLabels[statusKey] || booking.status
  const statusColorClass = bookingStatusColors[statusKey] || "bg-gray-100 text-gray-700"

  return (
    <div className="p-6 hover:bg-muted/30 transition-all border-b border-border last:border-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className={`hidden sm:flex w-14 h-14 rounded-2xl items-center justify-center shrink-0 ${statusColorClass} shadow-xs`}>
            <Package className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-lg">Booking #{booking.id.slice(-8).toUpperCase()}</span>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColorClass}`}>
                {label}
              </span>
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(booking.created_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-8">
          <div className="text-left sm:text-right">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Quantity</p>
            <p className="font-black text-lg">{Number((booking as any).quantity)} chicks</p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Breed</p>
            <p className="font-black text-lg">{booking.breed}</p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Pickup Date</p>
            <p className="font-black text-lg">{formatDate((booking as any).pickup_date)}</p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total</p>
            <p className="font-black text-xl text-primary">{formatPrice(Number((booking as any).total_price))}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

const statusIcons = {
  pending: Clock,
  processing: Package,
  shipped: Truck,
  delivered: Check,
  cancelled: XCircle,
}

const statusColors = {
  pending: "bg-accent/20 text-accent-dark",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-primary/20 text-primary",
  cancelled: "bg-red-100 text-red-700",
}

const bookingStatusLabels = {
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Delivered",
  cancelled: "Cancelled",
}

const bookingStatusColors = {
  pending: "bg-accent/20 text-accent-dark",
  confirmed: "bg-blue-100 text-blue-700",
  completed: "bg-primary/20 text-primary",
  cancelled: "bg-red-100 text-red-700",
}

function UserDashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoading, orders, logout, updateProfile, fetchOrders } = useAuth()
  const [activeTab, setActiveTab] = useState(user?.role === "admin" ? "settings" : "overview")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const [chickBookings, setChickBookings] = useState<ChickBooking[]>([])
  const [isLoadingBookings, setIsLoadingBookings] = useState(false)
  const [bookingsError, setBookingsError] = useState<string | null>(null)

  // Settings form state
  const [profileData, setProfileData] = useState({
    name: "",
    phone: "",
    profile_picture: ""
  })
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: ""
  })
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [message, setMessage] = useState({ text: "", type: "" })

  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab) {
      if (user?.role === "admin" && (tab === "overview" || tab === "orders")) {
        setActiveTab("settings")
      } else {
        setActiveTab(tab)
      }
    }
  }, [searchParams, user])

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login?redirect=/dashboard")
    }
    if (user) {
      setProfileData({
        name: user.name || "",
        phone: user.phone || "",
        profile_picture: user.profile_picture || ""
      })
      fetchOrders()

      ;(async () => {
        setIsLoadingBookings(true)
        setBookingsError(null)
        try {
          const response = await chicksApi.getBookings(user.id)
          if (!response.success) {
            throw new Error(response.error || response.message || "Failed to load day-old chick bookings")
          }
          setChickBookings(response.data || [])
        } catch (err) {
          setBookingsError(err instanceof Error ? err.message : "Failed to load day-old chick bookings")
          setChickBookings([])
        } finally {
          setIsLoadingBookings(false)
        }
      })()
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-16 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  const userOrders = orders.filter((o) => o.user_id === user.id)
  const totalSpent = userOrders.reduce((sum, o) => sum + o.total, 0)
  const userChickBookings = chickBookings
    .filter((b) => (b as any).user_id === user.id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdatingProfile(true)
    setMessage({ text: "", type: "" })

    const success = await updateProfile({
      name: profileData.name,
      phone: profileData.phone,
      profile_picture: profileData.profile_picture
    })

    if (success) {
      setMessage({ text: "Profile updated successfully!", type: "success" })
    } else {
      setMessage({ text: "Failed to update profile.", type: "error" })
    }
    setIsUpdatingProfile(false)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordData.new_password !== passwordData.confirm_password) {
      setMessage({ text: "New passwords do not match.", type: "error" })
      return
    }

    setIsUpdatingPassword(true)
    setMessage({ text: "", type: "" })

    try {
      const response = await authApi.changePassword({
        id: user.id,
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      })

      if (response.success) {
        setMessage({ text: "Password changed successfully!", type: "success" })
        setPasswordData({ current_password: "", new_password: "", confirm_password: "" })
      } else {
        setMessage({ text: response.message || "Failed to change password.", type: "error" })
      }
    } catch (error) {
      setMessage({ text: "An error occurred.", type: "error" })
    }
    setIsUpdatingPassword(false)
  }

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Basic validation
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ text: "File size must be less than 5MB", type: "error" })
      return
    }

    setIsUploadingImage(true)
    setMessage({ text: "Uploading image...", type: "info" })

    try {
      const response = await productsApi.uploadImage(file)
      if (response.success && response.data?.url) {
        setProfileData({ ...profileData, profile_picture: response.data.url })
        setMessage({ text: "Image uploaded! Don't forget to save.", type: "success" })
      } else {
        setMessage({ text: response.error || "Failed to upload image", type: "error" })
      }
    } catch (error) {
      setMessage({ text: "An error occurred during upload.", type: "error" })
    } finally {
      setIsUploadingImage(false)
    }
  }

  const sidebarLinks = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "orders", label: "Order History", icon: History },
    { id: "settings", label: "Settings", icon: Settings },
  ].filter(link => {
    if (user?.role === "admin") {
      return link.id === "settings";
    }
    return true;
  })

  return (
    <div className="min-h-screen bg-muted/30 pt-20">
      <div className="flex flex-col lg:flex-row min-h-[calc(100-5rem)]">
        {/* Mobile Sidebar Toggle */}
        <div className="lg:hidden bg-card border-b border-border p-4 flex items-center justify-between">
          <h1 className="font-serif font-bold text-lg text-primary">DASHBOARD</h1>
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <X /> : <Menu />}
          </Button>
        </div>

        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-0 z-40 bg-card border-r border-border transition-transform duration-300 lg:translate-x-0 w-64
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}>
          <div className="p-6">
            <h1 className="hidden lg:block font-serif font-bold text-2xl text-primary mb-8 ml-2">DASHBOARD</h1>

            <nav className="space-y-1">
              {sidebarLinks.map((link) => {
                const Icon = link.icon
                return (
                  <button
                    key={link.id}
                    onClick={() => {
                      setActiveTab(link.id)
                      setIsSidebarOpen(false)
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                      ${activeTab === link.id
                        ? "bg-primary text-white shadow-md shadow-primary/20"
                        : "text-foreground hover:bg-muted"}
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{link.label}</span>
                  </button>
                )
              })}
            </nav>

            <div className="mt-8 pt-8 border-t border-border">
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Backdrop for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 lg:p-8">
          <div className="container mx-auto max-w-5xl">
            {/* Header / Welcome */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-serif font-bold text-foreground capitalize">
                    {activeTab === 'overview' ? `Welcome back, ${user.name}!` : activeTab.replace('-', ' ')}
                  </h2>
                  <p className="text-muted-foreground"> {user.email} </p>
                </div>

                {activeTab === 'overview' && (
                  <div className="flex items-center gap-2 text-sm bg-primary/10 text-primary px-4 py-2 rounded-full font-medium">
                    <ShieldCheck className="w-4 h-4" />
                    Verified Account
                  </div>
                )}
              </div>
            </div>

            {/* Notification Message */}
            {message.text && (
              <div className={`mb-6 p-4 rounded-xl border ${message.type === 'success' ? 'bg-green-100 border-green-200 text-green-700' : 'bg-red-100 border-red-200 text-red-700'
                }`}>
                {message.text}
              </div>
            )}

            {/* Tabs Content */}
            <div className="animate-fade-up">
              {activeTab === "overview" && (
                <div className="space-y-8">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <Card className="hover:shadow-md transition-shadow">
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Orders</CardTitle>
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                          <ShoppingBag className="w-4 h-4" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">{userOrders.length}</div>
                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                          <span className="text-green-500 font-bold">↑</span> From your first purchase
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Invested</CardTitle>
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                          <CreditCard className="w-4 h-4" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-primary">{formatPrice(totalSpent)}</div>
                        <p className="text-xs text-muted-foreground mt-2">Quality agricultural products</p>
                      </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Member Since</CardTitle>
                        <div className="p-2 bg-accent/10 rounded-lg text-accent-dark">
                          <Calendar className="w-4 h-4" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">Jan 2026</div>
                        <p className="text-xs text-muted-foreground mt-2">Growing together</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Orders Preview */}
                  <Card>
                    <CardHeader className="border-b border-border">
                      <div className="flex items-center justify-between">
                        <CardTitle>Recent Activity</CardTitle>
                        <Button variant="outline" size="sm" onClick={() => setActiveTab('orders')}>
                          View All
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      {userOrders.length === 0 ? (
                        <div className="p-12 text-center text-muted-foreground">
                          No recent orders.
                        </div>
                      ) : (
                        <div className="divide-y divide-border">
                          {userOrders.slice(0, 3).map((order) => (
                            <div key={order.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                              <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-full ${statusColors[order.status as keyof typeof statusColors] || "bg-gray-100 text-gray-700"}`}>
                                  {(() => {
                                    const Icon = statusIcons[order.status as keyof typeof statusIcons] || AlertCircle
                                    return <Icon className="w-5 h-5" />
                                  })()}
                                </div>
                                <div>
                                  <p className="font-bold">Order #{order.id.slice(-8).toUpperCase()}</p>
                                  <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-primary">{formatPrice(order.total)}</p>
                                <p className="text-xs capitalize">{order.status}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === "orders" && (
                <div className="space-y-6">
                  <div className="bg-card rounded-2xl border border-border overflow-hidden">
                    <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-serif text-xl font-bold">Cart History</h3>
                        <p className="text-sm text-muted-foreground">Detailed history of all items you've purchased</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Filter:</span>
                        <select className="bg-muted border-none rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-primary outline-none">
                          <option>All Orders</option>
                          <option>Delivered</option>
                          <option>Processing</option>
                        </select>
                      </div>
                    </div>

                    {userOrders.length === 0 ? (
                      <div className="p-16 text-center">
                        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                          <ShoppingBag className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">No orders in your history</h3>
                        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                          You haven't made any purchases yet. Explore our wide range of agricultural products!
                        </p>
                        <Link href="/products/chicken-feeds">
                          <Button className="bg-primary hover:bg-primary-dark rounded-xl px-8 h-12 shadow-lg shadow-primary/20">
                            Start Shopping
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="divide-y divide-border">
                        {userOrders
                          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                          .map((order) => (
                            <OrderCard key={order.id} order={order} />
                          ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-card rounded-2xl border border-border overflow-hidden">
                    <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-serif text-xl font-bold">Day-Old Chick Bookings</h3>
                        <p className="text-sm text-muted-foreground">Bookings you have placed for day-old chicks</p>
                      </div>
                    </div>

                    {bookingsError && (
                      <div className="p-6">
                        <div className="p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
                          {bookingsError}
                        </div>
                      </div>
                    )}

                    {isLoadingBookings ? (
                      <div className="p-16 text-center">
                        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                      </div>
                    ) : userChickBookings.length === 0 ? (
                      <div className="p-16 text-center">
                        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                          <Package className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">No day-old chick bookings yet</h3>
                        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                          You haven't booked any day-old chicks yet.
                        </p>
                        <Link href="/day-old-chicks">
                          <Button className="bg-primary hover:bg-primary-dark rounded-xl px-8 h-12 shadow-lg shadow-primary/20">
                            Book Day-Old Chicks
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="divide-y divide-border">
                        {userChickBookings.map((booking) => (
                          <ChickBookingCard key={booking.id} booking={booking} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "settings" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Profile Settings */}
                  <Card className="rounded-2xl overflow-hidden shadow-sm">
                    <CardHeader className="bg-muted/50 border-b border-border">
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" />
                        Personal Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <form onSubmit={handleUpdateProfile} className="space-y-6">
                        <div className="flex flex-col items-center mb-8">
                          <div className="relative group">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-muted flex items-center justify-center bg-muted relative">
                              {isUploadingImage && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                                  <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
                                </div>
                              )}
                              {profileData.profile_picture ? (
                                <img
                                  src={profileData.profile_picture}
                                  alt="Profile"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User className="w-16 h-16 text-muted-foreground" />
                              )}
                            </div>
                            <label className="absolute bottom-0 right-0 rounded-full shadow-lg h-10 w-10 bg-white hover:bg-muted border border-border flex items-center justify-center cursor-pointer transition-colors hover:scale-105 active:scale-95 z-20">
                              <Camera className="w-4 h-4 text-foreground" />
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleProfilePictureUpload}
                                disabled={isUploadingImage}
                              />
                            </label>
                          </div>
                          <p className="text-xs text-muted-foreground mt-4">Upload from your computer (JPEG, PNG, WEBP)</p>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                              id="name"
                              value={profileData.name}
                              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                              className="rounded-xl h-12 focus-visible:ring-primary"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                id="phone"
                                placeholder="+234 800 000 0000"
                                value={profileData.phone}
                                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                className="pl-10 rounded-xl h-12 focus-visible:ring-primary"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Email Address</Label>
                            <Input
                              value={user.email}
                              disabled
                              className="bg-muted text-muted-foreground rounded-xl h-12 border-none"
                            />
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                              <ShieldCheck className="w-3 h-3" />
                              Email cannot be changed for security reasons
                            </p>
                          </div>
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-primary hover:bg-primary-dark rounded-xl h-12 gap-2 shadow-lg shadow-primary/20"
                          disabled={isUpdatingProfile}
                        >
                          {isUpdatingProfile ? "Saving..." : <><Save className="w-4 h-4" /> Save Changes</>}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>

                  {/* Security Settings */}
                  <Card className="rounded-2xl overflow-hidden shadow-sm self-start">
                    <CardHeader className="bg-muted/50 border-b border-border">
                      <CardTitle className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-primary" />
                        Security & Password
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <form onSubmit={handleChangePassword} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="current-password">Current Password</Label>
                          <Input
                            id="current-password"
                            type="password"
                            value={passwordData.current_password}
                            onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                            className="rounded-xl h-12 focus-visible:ring-primary"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="new-password">New Password</Label>
                          <Input
                            id="new-password"
                            type="password"
                            value={passwordData.new_password}
                            onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                            className="rounded-xl h-12 focus-visible:ring-primary"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirm-password">Confirm New Password</Label>
                          <Input
                            id="confirm-password"
                            type="password"
                            value={passwordData.confirm_password}
                            onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                            className="rounded-xl h-12 focus-visible:ring-primary"
                          />
                        </div>

                        <div className="pt-4">
                          <Button
                            type="submit"
                            variant="default"
                            className="w-full bg-accent hover:bg-accent-dark text-white rounded-xl h-12 gap-2 shadow-lg shadow-accent/20"
                            disabled={isUpdatingPassword}
                          >
                            {isUpdatingPassword ? "Updating..." : "Update Password"}
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function OrderCard({ order }: { order: Order }) {
  const StatusIcon = statusIcons[order.status as keyof typeof statusIcons] || AlertCircle
  const statusColorClass = statusColors[order.status as keyof typeof statusColors] || "bg-gray-100 text-gray-700"
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="p-6 hover:bg-muted/30 transition-all border-b border-border last:border-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className={`hidden sm:flex w-14 h-14 rounded-2xl items-center justify-center shrink-0 ${statusColorClass} shadow-xs`}>
            <StatusIcon className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-lg">Order #{order.id.slice(-8).toUpperCase()}</span>
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColorClass}`}
              >
                {order.status}
              </span>
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(order.created_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-8">
          <div className="text-left sm:text-right">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Amount</p>
            <p className="font-black text-xl text-primary">{formatPrice(order.total)}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-full transition-transform duration-300 ${isOpen ? 'rotate-90 text-primary bg-primary/10' : ''}`}
            onClick={() => setIsOpen(!isOpen)}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {isOpen && (
        <div className="mt-8 pt-6 border-t border-border animate-fade-down">
          <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Items Purchased</h4>
          <div className="bg-muted/50 rounded-2xl p-6 space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-card rounded-lg flex items-center justify-center font-bold text-primary border border-border group-hover:bg-primary group-hover:text-white transition-colors">
                    {item.quantity}
                  </div>
                  <div>
                    <span className="font-semibold block">{item.product_name}</span>
                    <span className="text-xs text-muted-foreground">{formatPrice(item.price_at_purchase)} per unit</span>
                  </div>
                </div>
                <span className="font-bold">{formatPrice(item.price_at_purchase * item.quantity)}</span>
              </div>
            ))}
            <div className="pt-4 border-t border-border flex justify-between items-center">
              <span className="font-bold text-muted-foreground">Order Total</span>
              <span className="font-black text-lg">{formatPrice(order.total)}</span>
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <Button variant="outline" size="sm" className="rounded-lg gap-2">
              <Package className="w-4 h-4" />
              Track Order
            </Button>
            <Button variant="outline" size="sm" className="rounded-lg gap-2">
              <CreditCard className="w-4 h-4" />
              View Invoice
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function UserDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background pt-24 pb-16 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    }>
      <UserDashboardContent />
    </Suspense>
  )
}
