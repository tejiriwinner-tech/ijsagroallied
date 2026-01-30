<?php
/**
 * User Delete Endpoint
 * 
 * Deletes a user from the database. Handles foreign key constraints with orders.
 * Requires admin authentication.
 * 
 * Method: DELETE
 * Auth: Required (Admin only)
 * 
 * Request Body:
 * {
 *   "id": "user-123"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "User deleted successfully"
 * }
 */

require_once __DIR__ . '/../../../config/cors.php';
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../config/api.php';

// Only allow DELETE requests
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
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
    
    $userId = $data['id'] ?? null;
    
    // Validate required fields
    if (!$userId) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'User ID is required'
        ]);
        exit;
    }
    
    // Check if user exists
    $checkSql = "SELECT id, name, email, role FROM users WHERE id = :id";
    $stmt = $db->prepare($checkSql);
    $stmt->execute([':id' => $userId]);
    $existingUser = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$existingUser) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'User not found'
        ]);
        exit;
    }
    
    // Prevent admin from deleting themselves
    if ($existingUser['id'] === $user['user_id']) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'You cannot delete your own account'
        ]);
        exit;
    }
    
    // Check if user has orders (foreign key constraint)
    $orderCheckSql = "SELECT COUNT(*) as order_count FROM orders WHERE user_id = :user_id";
    $stmt = $db->prepare($orderCheckSql);
    $stmt->execute([':user_id' => $userId]);
    $orderCount = $stmt->fetch(PDO::FETCH_ASSOC)['order_count'];
    
    if ($orderCount > 0) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => "Cannot delete user. User has {$orderCount} associated orders. Please handle orders first."
        ]);
        exit;
    }
    
    // Delete user
    $deleteSql = "DELETE FROM users WHERE id = :id";
    $stmt = $db->prepare($deleteSql);
    $result = $stmt->execute([':id' => $userId]);
    
    if (!$result) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to delete user'
        ]);
        exit;
    }
    
    // Return success response
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'User deleted successfully'
    ]);
    
} catch (Exception $e) {
    // Log the error for debugging
    logMessage('ERROR', 'User delete error: ' . $e->getMessage());
    
    // Return generic error to client (don't expose internal details)
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred while deleting user'
    ]);
}
?>