<?php
/**
 * User Orders Endpoint
 * 
 * Returns all orders for a specific user, sorted by created_at descending.
 * Requires admin authentication.
 * 
 * Method: GET
 * Auth: Required (Admin only)
 * 
 * Query Parameters:
 * - user_id: User ID (required)
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": "order-123",
 *       "user_id": "user-456",
 *       "customer_name": "John Doe",
 *       "customer_email": "john@example.com",
 *       "total_amount": 25000.00,
 *       "status": "pending",
 *       "created_at": "2026-01-19 10:30:00"
 *     }
 *   ]
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
    
    // Get user ID from query parameter
    $userId = isset($_GET['user_id']) ? trim($_GET['user_id']) : null;
    
    if (!$userId) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'User ID is required'
        ]);
        exit;
    }
    
    // Check if user exists
    $userCheckSql = "SELECT id, name, email FROM users WHERE id = :user_id";
    $stmt = $db->prepare($userCheckSql);
    $stmt->execute([':user_id' => $userId]);
    $userExists = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$userExists) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'User not found'
        ]);
        exit;
    }
    
    // Get all orders for the user with customer details
    $ordersSql = "
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
        WHERE o.user_id = :user_id
        ORDER BY o.created_at DESC
    ";
    
    $stmt = $db->prepare($ordersSql);
    $stmt->execute([':user_id' => $userId]);
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Convert numeric fields to proper types
    foreach ($orders as &$order) {
        $order['total_amount'] = (float) $order['total_amount'];
    }
    
    // Return success response
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => $orders
    ]);
    
} catch (Exception $e) {
    // Log the error for debugging
    logMessage('ERROR', 'User orders error: ' . $e->getMessage());
    
    // Return generic error to client (don't expose internal details)
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred while fetching user orders'
    ]);
}
?>