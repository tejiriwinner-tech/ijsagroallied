<?php
/**
 * Order List Endpoint with Filters
 * 
 * Returns all orders with customer details, supporting status and search filters.
 * Requires admin authentication.
 * 
 * Method: GET
 * Auth: Required (Admin only)
 * 
 * Query Parameters:
 * - status: Filter by order status (pending, processing, shipped, delivered)
 * - search: Search by customer name or email
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
 *       "total": "25000.00",
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
    
    // Get query parameters
    $statusFilter = isset($_GET['status']) ? trim($_GET['status']) : null;
    $searchQuery = isset($_GET['search']) ? trim($_GET['search']) : null;
    
    // Validate status filter if provided
    $validStatuses = ['pending', 'processing', 'shipped', 'delivered'];
    if ($statusFilter && !in_array($statusFilter, $validStatuses)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid status filter. Valid values: ' . implode(', ', $validStatuses)
        ]);
        exit;
    }
    
    // Build the query with joins to get customer details
    $sql = "
        SELECT 
            o.id,
            o.user_id,
            u.name as customer_name,
            u.email as customer_email,
            o.total,
            o.status,
            o.created_at
        FROM orders o
        INNER JOIN users u ON o.user_id = u.id
        WHERE 1=1
    ";
    
    $params = [];
    
    // Add status filter if provided
    if ($statusFilter) {
        $sql .= " AND o.status = :status";
        $params[':status'] = $statusFilter;
    }
    
    // Add search filter if provided (search in customer name or email)
    if ($searchQuery) {
        $sql .= " AND (u.name LIKE :search OR u.email LIKE :search)";
        $params[':search'] = '%' . $searchQuery . '%';
    }
    
    // Order by created_at descending (newest first)
    $sql .= " ORDER BY o.created_at DESC";
    
    // Execute the query
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Return success response
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => $orders
    ]);
    
} catch (Exception $e) {
    // Log the error for debugging
    logMessage('ERROR', 'Order list error: ' . $e->getMessage());
    
    // Return generic error to client (don't expose internal details)
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred while fetching orders'
    ]);
}
?>