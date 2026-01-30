<?php
/**
 * Category List Endpoint
 * 
 * Returns all categories with their subcategories in a hierarchical structure.
 * Requires admin authentication.
 * 
 * Method: GET
 * Auth: Required (Admin only)
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": "cat-123",
 *       "name": "Category Name",
 *       "slug": "category-slug",
 *       "description": "Category description",
 *       "image": "/path/to/image.jpg",
 *       "subcategories": [
 *         {
 *           "id": "sub-456",
 *           "category_id": "cat-123",
 *           "name": "Subcategory Name",
 *           "slug": "subcategory-slug"
 *         }
 *       ]
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
    
    // Fetch all categories
    $stmt = $db->prepare("SELECT id, name, slug, description, image FROM categories ORDER BY name ASC");
    $stmt->execute();
    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Fetch subcategories for each category
    foreach ($categories as &$category) {
        $stmt = $db->prepare("
            SELECT id, category_id, name, slug 
            FROM subcategories 
            WHERE category_id = :category_id 
            ORDER BY name ASC
        ");
        $stmt->execute([':category_id' => $category['id']]);
        $category['subcategories'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    // Return success response
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => $categories
    ]);
    
} catch (Exception $e) {
    // Log the error for debugging
    logMessage('ERROR', 'Category list error: ' . $e->getMessage());
    
    // Return generic error to client (don't expose internal details)
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred while fetching categories'
    ]);
}
?>
