// Shared TypeScript interfaces for Admin Dashboard Features

export interface Category {
    id: string;
    name: string;
    slug: string;
    description: string;
    image_url: string | null;
    image?: string | null; // For backward compatibility with backend responses
    created_at: string;
    updated_at?: string;
    subcategories?: Subcategory[];
}

export interface Subcategory {
    id: string;
    category_id: string;
    name: string;
    slug: string;
    description: string;
    created_at: string;
    updated_at?: string;
}

export interface CategoryInput {
    name: string;
    slug: string;
    description: string;
    image_url?: string | null;
}

export interface SubcategoryInput {
    category_id: string;
    name: string;
    slug: string;
    description: string;
}

export interface Order {
    id: string;
    user_id: string;
    customer_name: string;
    customer_email: string;
    total_amount: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    created_at: string;
    updated_at: string;
}

export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string;
    product_name: string;
    quantity: number;
    price: number;
    subtotal: number;
}

export interface OrderDetails {
    order: Order;
    items: OrderItem[];
}

export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: 'admin' | 'user';
    profile_picture?: string | null;
    created_at: string;
    updated_at?: string;
}

export interface UserDetails extends User {
    orders?: Order[];
}

export interface OrderFilters {
    status?: string;
    search?: string;
}

export interface UserFilters {
    role?: string;
    search?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: Record<string, string>;
}

export interface CheckProductsResponse {
    hasProducts: boolean;
    count: number;
}

export interface ChickBatch {
    id: string;
    breed: string;
    available_date: string;
    price_per_chick: number;
    minimum_order: number;
    available_quantity: number;
    description: string;
    created_at: string;
}

export interface ChickBooking {
    id: string;
    batch_id: string;
    breed: string;
    quantity: number;
    total_price: number;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    delivery_address: string;
    pickup_date: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    created_at: string;
}
