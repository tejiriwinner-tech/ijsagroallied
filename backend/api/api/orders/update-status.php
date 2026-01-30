<?php
/**
 * Order Status Update Endpoint
 * 
 * Updates the status of an existing order and returns the updated order.
 * Requires admin authentication.
 * 
 * Method: PUT
 * Auth: Required (Admin only)
 * 
 * Request Body:
 * {
 *   "id": "order-123",
 *   "status": "processing"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "id": "order-123",
 *     "user_id": "user-456",
 *     "customer_name": "John Doe",
 *     "customer_email": "john@example.com",
 *     "total_amount": 25000.00,
 *     "status": "processing",
 *     "created_at": "2026-01-19 10:30:00"
 *   }
 * }
 */

require_once __DIR__ . '/../../../config/cors.php';
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../config/api.php';

// Only allow PUT requests
if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
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
    
    // Get request data
    $data = json_decode(file_get_contents("php://input"), true);
    
    $orderId = $data['id'] ?? null;
    $status = $data['status'] ?? null;
    
    // Validate required fields
    if (!$orderId || !$status) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Order ID and status are required'
        ]);
        exit;
    }
    
    // Validate status value
    $validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!in_array($status, $validStatuses)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid status. Valid values: ' . implode(', ', $validStatuses)
        ]);
        exit;
    }
    
    // Check if order exists
    $checkSql = "SELECT id FROM orders WHERE id = :id";
    $stmt = $db->prepare($checkSql);
    $stmt->execute([':id' => $orderId]);
    
    if (!$stmt->fetch()) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Order not found'
        ]);
        exit;
    }
    
    // Update order status and updated_at timestamp
    $updateSql = "UPDATE orders SET status = :status WHERE id = :id";
    $stmt = $db->prepare($updateSql);
    $result = $stmt->execute([':status' => $status, ':id' => $orderId]);
    
    if (!$result) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to update order status'
        ]);
        exit;
    }
    
    // Get updated order with customer details
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
        WHERE o.id = :id
    ";
    
    $stmt = $db->prepare($orderSql);
    $stmt->execute([':id' => $orderId]);
    $order = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Convert numeric fields to proper types
    $order['total_amount'] = (float) $order['total_amount'];
    
    // Return success response with updated order
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => $order
    ]);
    
} catch (Exception $e) {
    // Log the error for debugging
    logMessage('ERROR', 'Order status update error: ' . $e->getMessage());
    
    // Return generic error to client (don't expose internal details)
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred while updating order status'
    ]);
}
?>
