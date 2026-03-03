-- ============================================================================
-- MV Agricultural Consult - Complete Database Schema
-- ============================================================================
-- This is the MASTER schema file - all other schema files are deprecated
-- Run this SQL to set up your complete MySQL database with all tables and data
-- 
-- Usage:
--   mysql -u root < backend/database/schema.sql
--   OR
--   C:\xampp\mysql\bin\mysql.exe -u root < c:\xampp\htdocs\ijsagroallied\backend\database\schema.sql
-- ============================================================================


-- ============================================================================
-- CREATE TABLES
-- ============================================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    phone VARCHAR(20),
    profile_picture VARCHAR(500),
    auth_token VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    image VARCHAR(500),
    INDEX idx_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Subcategories table
CREATE TABLE IF NOT EXISTS subcategories (
    id VARCHAR(50) PRIMARY KEY,
    category_id VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    INDEX idx_category (category_id),
    INDEX idx_slug (slug),
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(12, 2) NOT NULL,
    image VARCHAR(500),
    category VARCHAR(50) NOT NULL,
    subcategory VARCHAR(50),
    stock INT DEFAULT 0,
    unit VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_subcategory (subcategory),
    INDEX idx_stock (stock)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    total DECIMAL(12, 2) NOT NULL,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    payment_reference VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_created (created_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    price_at_purchase DECIMAL(12, 2) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    INDEX idx_order (order_id),
    INDEX idx_product (product_id),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Day old chicks batches table
CREATE TABLE IF NOT EXISTS chick_batches (
    id VARCHAR(50) PRIMARY KEY,
    breed VARCHAR(255) NOT NULL,
    available_date DATE NOT NULL,
    price_per_chick DECIMAL(10, 2) NOT NULL,
    minimum_order INT DEFAULT 50,
    available_quantity INT NOT NULL,
    description TEXT,
    INDEX idx_available_date (available_date),
    INDEX idx_breed (breed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Chick bookings table
CREATE TABLE IF NOT EXISTS chick_bookings (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50),
    batch_id VARCHAR(50) NOT NULL,
    breed VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    total_price DECIMAL(12, 2) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    delivery_address TEXT,
    description TEXT,
    pickup_date DATE NOT NULL,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user (user_id),
    INDEX idx_batch (batch_id),
    INDEX idx_status (status),
    INDEX idx_pickup_date (pickup_date),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (batch_id) REFERENCES chick_batches(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Contact messages table
CREATE TABLE IF NOT EXISTS contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_created (created_at),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Cart items table for persistence
CREATE TABLE IF NOT EXISTS cart_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Password resets table for handling password reset tokens
CREATE TABLE IF NOT EXISTS password_resets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(64) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_email (email),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- INSERT SAMPLE DATA
-- ============================================================================

-- Insert default admin user (password: admin123)
INSERT IGNORE INTO users (id, email, password, name, role) VALUES 
('admin-1', 'admin@mvagriculturalconsult.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'admin');

-- Insert test user for password reset testing (password: testpass123)
INSERT IGNORE INTO users (id, email, password, name, role) VALUES 
('test-user-1', 'tejiriwinner@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Test User', 'user');

-- Insert categories
INSERT IGNORE INTO categories (id, name, slug, description, image) VALUES 
('chicken-feeds', 'Chicken Feeds', 'chicken-feeds', 'Premium quality feeds for healthy and productive poultry', '/chicken-feed-bags-agricultural.jpg'),
('dog-feeds', 'Dog Feed & Accessories', 'dog-feeds', 'Quality nutrition and accessories for your canine companions', '/dog-food-and-accessories.jpg'),
('drugs-vaccines', 'Drugs & Chicken Vaccines', 'drugs-vaccines', 'Veterinary drugs and vaccines for healthy livestock', '/veterinary-medicine-vaccines-poultry.jpg'),
('fish-feeds', 'Fish Feeds', 'fish-feeds', 'High-protein floating and sinking fish feeds for optimal aquaculture growth', '/FISH FEED.png');

-- Insert subcategories
INSERT IGNORE INTO subcategories (id, category_id, name, slug) VALUES 
('chikun-feeds', 'chicken-feeds', 'Chikun Feeds', 'chikun-feeds'),
('ultima-feeds', 'chicken-feeds', 'Ultima Feeds', 'ultima-feeds'),
('happy-chicken-feeds', 'chicken-feeds', 'Happy Chicken Feeds', 'happy-chicken-feeds'),
('blue-crown', 'fish-feeds', 'Blue Crown', 'blue-crown'),
('eco-float', 'fish-feeds', 'Eco Float', 'eco-float');

-- Insert sample products (limited set - add more as needed)
INSERT IGNORE INTO products (id, name, description, price, image, category, subcategory, stock, unit) VALUES 
('chikun-starter', 'Chikun Starter Mash', 'Premium starter feed for day-old chicks to 4 weeks. High protein formula for optimal growth.', 12500.00, '/chicken-starter-feed-bag.jpg', 'chicken-feeds', 'chikun-feeds', 45, '25kg bag'),
('chikun-grower', 'Chikun Grower Mash', 'Balanced nutrition for pullets and broilers from 5 weeks until maturity.', 11800.00, '/chicken-grower-feed-pellets.jpg', 'chicken-feeds', 'chikun-feeds', 38, '25kg bag'),
('chikun-layer', 'Chikun Layer Mash', 'Optimized calcium and phosphorus levels for consistent high-quality egg production.', 13200.00, '/layer-feed-for-chickens.jpg', 'chicken-feeds', 'chikun-feeds', 8, '25kg bag'),
('ultima-starter', 'Ultima Premium Starter', 'Ultra-premium starter feed with added vitamins and minerals for rapid early growth.', 14500.00, '/premium-poultry-feed-bag.jpg', 'chicken-feeds', 'ultima-feeds', 25, '25kg bag'),
('ultima-finisher', 'Ultima Broiler Finisher', 'High-energy feed for broilers to achieve maximum market weight efficiently.', 15000.00, '/broiler-finisher-feed.jpg', 'chicken-feeds', 'ultima-feeds', 15, '25kg bag'),
('dog-premium-adult', 'Premium Adult Dog Food', 'Complete nutrition for adult dogs of all breeds. High in protein and essential vitamins.', 18500.00, '/premium-dog-food-bag.png', 'dog-feeds', NULL, 20, '15kg bag'),
('blue-crown-floating', 'Blue Crown Floating Fish Feed', 'High-protein floating pellets for optimal fish growth and health.', 8500.00, '/FISH FEED.png', 'fish-feeds', 'blue-crown', 30, '15kg bag'),
('blue-crown-sinking', 'Blue Crown Sinking Fish Feed', 'Nutrient-rich sinking pellets for bottom-feeding fish species.', 8200.00, '/FISH FEED.png', 'fish-feeds', 'blue-crown', 25, '15kg bag'),
('eco-float-premium', 'Eco Float Premium Fish Feed', 'Eco-friendly floating feed with enhanced nutrition for sustainable aquaculture.', 9200.00, '/FISH FEED.png', 'fish-feeds', 'eco-float', 18, '20kg bag'),
('newcastle-vaccine', 'Newcastle Disease Vaccine', 'Live vaccine for prevention of Newcastle disease in poultry.', 2500.00, '/placeholder.svg?height=400&width=400', 'drugs-vaccines', NULL, 100, '100 doses');

-- Insert chick batches
INSERT IGNORE INTO chick_batches (id, breed, available_date, price_per_chick, minimum_order, available_quantity, description) VALUES 
('batch-broiler-jan', 'Broiler', '2026-02-01', 850.00, 50, 2000, 'Fast-growing Cobb 500 broiler chicks'),
('batch-layer-jan', 'Layer (Point of Lay)', '2026-02-05', 1200.00, 50, 1500, 'Isa Brown layers - excellent egg producers'),
('batch-cockerel-jan', 'Cockerel', '2026-02-10', 450.00, 100, 3000, 'Hardy local cockerels for meat production'),
('batch-noiler-jan', 'Noiler', '2026-02-15', 650.00, 50, 1000, 'Dual-purpose Noiler birds - meat and eggs');

INSERT IGNORE INTO products (id, name, description, price, image, category, subcategory, stock, unit) VALUES 
('batch-broiler-jan', 'Day-Old Chicks - Broiler', 'Fast-growing Cobb 500 broiler chicks', 850.00, '/broiler.png', 'day-old-chicks', NULL, 1000000, 'chicks'),
('batch-layer-jan', 'Day-Old Chicks - Layer (Point of Lay)', 'Isa Brown layers - excellent egg producers', 1200.00, '/layer.png', 'day-old-chicks', NULL, 1000000, 'chicks'),
('batch-cockerel-jan', 'Day-Old Chicks - Cockerel', 'Hardy local cockerels for meat production', 450.00, '/cockerel.png', 'day-old-chicks', NULL, 1000000, 'chicks'),
('batch-noiler-jan', 'Day-Old Chicks - Noiler', 'Dual-purpose Noiler birds - meat and eggs', 650.00, '/noiler.png', 'day-old-chicks', NULL, 1000000, 'chicks');


-- ============================================================================
-- DONE!
-- ============================================================================
-- DONE!
-- ============================================================================
-- Your database is now ready to use!
-- 
-- Default Admin Login:
-- Email: admin@mvagriculturalconsult.com
-- Password: admin123
-- ============================================================================
