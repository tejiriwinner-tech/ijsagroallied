<?php
/**
 * Category Check Products Endpoint
 * 
 * Checks if a category has associated products before deletion.
 * Requires admin authentication.
 * 
 * Method: GET
 * Auth: Required (Admin only)
 * 
 * Query Parameters:
 * - id: Category ID to check
 * 
 * Response:
 * {
 *   "success": true,
 *   "has_products": true,
 *   "product_count": 5
 * }
 */

// Prevent any output before JSON
ob_start();

require_once __DIR__ . '/../../../config/cors.php';
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../config/api.php';

// Clear any previous output
ob_clean();

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
    
    // Get category ID from query parameters
    $categoryId = isset($_GET['id']) ? trim($_GET['id']) : '';
    
    // Validate category ID
    if (empty($categoryId)) {
        http_response_code(422);
        echo json_encode([
            'success' => false,
            'message' => 'Category ID is required'
        ]);
        exit;
    }
    
    // Check if category exists
    $stmt = $db->prepare("SELECT id FROM categories WHERE id = :id");
    $stmt->execute([':id' => $categoryId]);
    $category = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$category) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Category not found'
        ]);
        exit;
    }
    
    // Count products associated with this category
    $stmt = $db->prepare("SELECT COUNT(*) as product_count FROM products WHERE category = :category_id");
    $stmt->execute([':category_id' => $categoryId]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    $productCount = (int) $result['product_count'];
    $hasProducts = $productCount > 0;
    
    // Log the check
    logMessage('INFO', "Category products check: {$categoryId} has {$productCount} products by user {$user['user_id']}");
    
    // Return success response
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => [
            'hasProducts' => $hasProducts,
            'count' => $productCount
        ]
    ]);
    
} catch (Exception $e) {
    // Log the error for debugging
    logMessage('ERROR', 'Category check products error: ' . $e->getMessage());
    
    // Return generic error to client (don't expose internal details)
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred while checking category products'
    ]);
}
?>