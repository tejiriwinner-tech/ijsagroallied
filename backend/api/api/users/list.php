<?php
/**
 * User List Endpoint with Filters
 * 
 * Returns all users with filtering by role and search capabilities.
 * Requires admin authentication.
 * 
 * Method: GET
 * Auth: Required (Admin only)
 * 
 * Query Parameters:
 * - role: Filter by user role (admin, user)
 * - search: Search by user name or email
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": "user-123",
 *       "name": "John Doe",
 *       "email": "john@example.com",
 *       "role": "user",
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
    $roleFilter = isset($_GET['role']) ? trim($_GET['role']) : null;
    $searchQuery = isset($_GET['search']) ? trim($_GET['search']) : null;
    
    // Validate role filter if provided
    $validRoles = ['admin', 'user'];
    if ($roleFilter && !in_array($roleFilter, $validRoles)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid role filter. Valid values: ' . implode(', ', $validRoles)
        ]);
        exit;
    }
    
    // Build the query
    $sql = "
        SELECT 
            id,
            name,
            email,
            role,
            created_at
        FROM users
        WHERE 1=1
    ";
    
    $params = [];
    
    // Add role filter if provided
    if ($roleFilter) {
        $sql .= " AND role = :role";
        $params[':role'] = $roleFilter;
    }
    
    // Add search filter if provided (search in name or email)
    if ($searchQuery) {
        $sql .= " AND (name LIKE :search OR email LIKE :search)";
        $params[':search'] = '%' . $searchQuery . '%';
    }
    
    // Order by created_at descending (newest first)
    $sql .= " ORDER BY created_at DESC";
    
    // Execute the query
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Return success response
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => $users
    ]);
    
} catch (Exception $e) {
    // Log the error for debugging
    logMessage('ERROR', 'User list error: ' . $e->getMessage());
    
    // Return generic error to client (don't expose internal details)
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred while fetching users'
    ]);
}
?>