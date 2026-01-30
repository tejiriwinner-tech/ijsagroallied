<?php
/**
 * Order Details Endpoint
 * 
 * Returns detailed information about a specific order including all order items.
 * Requires admin authentication.
 * 
 * Method: GET
 * Auth: Required (Admin only)
 * 
 * Query Parameters:
 * - id: Order ID (required)
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "order": {
 *       "id": "order-123",
 *       "user_id": "user-456",
 *       "customer_name": "John Doe",
 *       "customer_email": "john@example.com",
 *       "total": "25000.00",
 *       "status": "pending",
 *       "created_at": "2026-01-19 10:30:00"
 *     },
 *     "items": [
 *       {
 *         "id": "1",
 *         "order_id": "order-123",
 *         "product_id": "product-789",
 *         "product_name": "Premium Dog Food",
 *         "quantity": 2,
 *         "price": "12500.00",
 *         "subtotal": "25000.00"
 *       }
 *     ]
 *   }
 * }
 */

require_once __DIR__ . '/../../../config/cors.php';
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../config/api.php';

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ]);
    exit;
}

try {
    // Require admin authentication
    $user = requireAdmin();
    
    // Connect to database
    $database = new Database();
    $db = $database->getConnection();
    
    // Get order ID from query parameter
    $orderId = isset($_GET['id']) ? trim($_GET['id']) : null;
    
    if (!$orderId) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Order ID is required'
        ]);
        exit;
    }
    
    // Get order details with customer information
    $orderSql = "
        SELECT 
            o.id,
            o.user_id,
            u.name as customer_name,
            u.email as customer_email,
            o.total as total_amount,
            o.status,
            o.created_at
        FROM orders o
        INNER JOIN users u ON o.user_id = u.id
        WHERE o.id = :order_id
    ";
    
    $stmt = $db->prepare($orderSql);
    $stmt->execute([':order_id' => $orderId]);
    $order = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$order) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Order not found'
        ]);
        exit;
    }
    
    // Get order items with product information
    $itemsSql = "
        SELECT 
            oi.id,
            oi.order_id,
            oi.product_id,
            oi.product_name,
            oi.quantity,
            oi.price_at_purchase as price,
            (oi.quantity * oi.price_at_purchase) as subtotal
        FROM order_items oi
        WHERE oi.order_id = :order_id
        ORDER BY oi.id ASC
    ";
    
    $stmt = $db->prepare($itemsSql);
    $stmt->execute([':order_id' => $orderId]);
    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Convert numeric fields to proper types
    $order['total_amount'] = (float) $order['total_amount'];
    
    foreach ($items as &$item) {
        $item['quantity'] = (int) $item['quantity'];
        $item['price'] = (float) $item['price'];
        $item['subtotal'] = (float) $item['subtotal'];
    }
    
    // Return success response
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => [
            'order' => $order,
            'items' => $items
        ]
    ]);
    
} catch (Exception $e) {
    // Log the error for debugging
    logMessage('ERROR', 'Order details error: ' . $e->getMessage());
    
    // Return generic error to client (don't expose internal details)
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred while fetching order details'
    ]);
}
?>