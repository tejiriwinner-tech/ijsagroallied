<?php
/**
 * User Role Update Endpoint
 * 
 * Updates the role of an existing user and returns the updated user.
 * Requires admin authentication.
 * 
 * Method: PUT
 * Auth: Required (Admin only)
 * 
 * Request Body:
 * {
 *   "id": "user-123",
 *   "role": "admin"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "id": "user-123",
 *     "name": "John Doe",
 *     "email": "john@example.com",
 *     "role": "admin",
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
    
    $userId = $data['id'] ?? null;
    $role = $data['role'] ?? null;
    
    // Validate required fields
    if (!$userId || !$role) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'User ID and role are required'
        ]);
        exit;
    }
    
    // Validate role value
    $validRoles = ['admin', 'user'];
    if (!in_array($role, $validRoles)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid role. Valid values: ' . implode(', ', $validRoles)
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
    
    // Prevent admin from demoting themselves
    if ($existingUser['id'] === $user['user_id'] && $existingUser['role'] === 'admin' && $role !== 'admin') {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'You cannot change your own admin role'
        ]);
        exit;
    }
    
    // Update user role
    $updateSql = "UPDATE users SET role = :role WHERE id = :id";
    $stmt = $db->prepare($updateSql);
    $result = $stmt->execute([':role' => $role, ':id' => $userId]);
    
    if (!$result) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to update user role'
        ]);
        exit;
    }
    
    // Get updated user details
    $userSql = "
        SELECT 
            id,
            name,
            email,
            role,
            created_at
        FROM users
        WHERE id = :id
    ";
    
    $stmt = $db->prepare($userSql);
    $stmt->execute([':id' => $userId]);
    $updatedUser = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Return success response with updated user
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => $updatedUser
    ]);
    
} catch (Exception $e) {
    // Log the error for debugging
    logMessage('ERROR', 'User role update error: ' . $e->getMessage());
    
    // Return generic error to client (don't expose internal details)
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred while updating user role'
    ]);
}
?>