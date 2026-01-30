import {
    LayoutDashboard,
    FolderTree,
    ShoppingCart,
    Calendar,
    Bird,
    Users,
    Package,
    AlertTriangle,
    Settings,
    type LucideIcon
} from "lucide-react"

export interface NavigationItem {
    id: string
    label: string
    icon: LucideIcon
    badge?: number
    description?: string
}

export const createNavigationItems = (lowStockCount: number): NavigationItem[] => [
    {
        id: "overview",
        label: "Overview",
        icon: LayoutDashboard,
        description: "Dashboard overview and quick stats"
    },
    {
        id: "categories",
        label: "Categories",
        icon: FolderTree,
        description: "Manage product categories and subcategories"
    },
    {
        id: "orders",
        label: "Orders",
        icon: ShoppingCart,
        description: "View and manage customer orders"
    },
    {
        id: "bookings",
        label: "Bookings",
        icon: Calendar,
        description: "Manage day-old chick bookings"
    },
    {
        id: "batches",
        label: "Chick Batches",
        icon: Bird,
        description: "Manage chick batch inventory"
    },
    {
        id: "users",
        label: "Users",
        icon: Users,
        description: "Manage user accounts and roles"
    },
    {
        id: "products",
        label: "All Products",
        icon: Package,
        description: "View and manage all products"
    },
    {
        id: "low-stock",
        label: "Low Stock",
        icon: AlertTriangle,
        badge: lowStockCount > 0 ? lowStockCount : undefined,
        description: "Products requiring attention"
    },
    {
        id: "settings",
        label: "Settings",
        icon: Settings,
        description: "Admin profile and security settings"
    }
]

export const getNavigationItemById = (id: string, lowStockCount: number): NavigationItem | undefined => {
    return createNavigationItems(lowStockCount).find(item => item.id === id)
}

export const validateNavigationItemId = (id: string): boolean => {
    const validIds = ['overview', 'categories', 'orders', 'bookings', 'batches', 'users', 'products', 'low-stock', 'settings']
    return validIds.includes(id)
}