<?php
/**
 * User Details Endpoint
 * 
 * Returns detailed information about a specific user including their order history.
 * Requires admin authentication.
 * 
 * Method: GET
 * Auth: Required (Admin only)
 * 
 * Query Parameters:
 * - id: User ID (required)
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "id": "user-123",
 *     "name": "John Doe",
 *     "email": "john@example.com",
 *     "role": "user",
 *     "created_at": "2026-01-19 10:30:00",
 *     "orders": [
 *       {
 *         "id": "order-456",
 *         "total_amount": 25000.00,
 *         "status": "delivered",
 *         "created_at": "2026-01-20 14:30:00"
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
    
    // Get user ID from query parameter
    $userId = isset($_GET['id']) ? trim($_GET['id']) : null;
    
    if (!$userId) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'User ID is required'
        ]);
        exit;
    }
    
    // Get user details
    $userSql = "
        SELECT 
            id,
            name,
            email,
            role,
            created_at
        FROM users
        WHERE id = :user_id
    ";
    
    $stmt = $db->prepare($userSql);
    $stmt->execute([':user_id' => $userId]);
    $userDetails = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$userDetails) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'User not found'
        ]);
        exit;
    }
    
    // Get user's order history
    $ordersSql = "
        SELECT 
            id,
            total as total_amount,
            status,
            created_at
        FROM orders
        WHERE user_id = :user_id
        ORDER BY created_at DESC
    ";
    
    $stmt = $db->prepare($ordersSql);
    $stmt->execute([':user_id' => $userId]);
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Convert numeric fields to proper types
    foreach ($orders as &$order) {
        $order['total_amount'] = (float) $order['total_amount'];
    }
    
    // Add orders to user details
    $userDetails['orders'] = $orders;
    
    // Return success response
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => $userDetails
    ]);
    
} catch (Exception $e) {
    // Log the error for debugging
    logMessage('ERROR', 'User details error: ' . $e->getMessage());
    
    // Return generic error to client (don't expose internal details)
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred while fetching user details'
    ]);
}
?>