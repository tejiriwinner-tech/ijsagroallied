<?php
/**
 * Category Delete Endpoint
 * 
 * Deletes a category from the database.
 * Requires admin authentication.
 * 
 * Method: DELETE
 * Auth: Required (Admin only)
 * 
 * Request Body:
 * {
 *   "id": "cat-123"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Category deleted successfully"
 * }
 */

// Prevent any output before JSON
ob_start();

require_once __DIR__ . '/../../../config/cors.php';
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../config/api.php';

// Clear any previous output
ob_clean();

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
    
    // Validate required fields
    if (!isset($data['id']) || empty(trim($data['id']))) {
        http_response_code(422);
        echo json_encode([
            'success' => false,
            'message' => 'Category ID is required'
        ]);
        exit;
    }
    
    $categoryId = trim($data['id']);
    
    // Check if category exists
    $stmt = $db->prepare("SELECT id, name FROM categories WHERE id = :id");
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
    
    // Check for associated products
    $stmt = $db->prepare("SELECT COUNT(*) as product_count FROM products WHERE category = :category_id");
    $stmt->execute([':category_id' => $categoryId]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    $productCount = (int) $result['product_count'];
    
    if ($productCount > 0) {
        http_response_code(422);
        echo json_encode([
            'success' => false,
            'message' => "Cannot delete category. It has {$productCount} associated products.",
            'has_products' => true,
            'product_count' => $productCount
        ]);
        exit;
    }
    
    // Begin transaction
    $db->beginTransaction();
    
    try {
        // Delete the category (subcategories will be deleted automatically due to CASCADE)
        $stmt = $db->prepare("DELETE FROM categories WHERE id = :id");
        $result = $stmt->execute([':id' => $categoryId]);
        
        if (!$result) {
            throw new Exception('Failed to delete category');
        }
        
        // Check if any rows were affected
        if ($stmt->rowCount() === 0) {
            throw new Exception('Category not found or already deleted');
        }
        
        // Commit transaction
        $db->commit();
        
        // Log success
        logMessage('INFO', "Category deleted: {$categoryId} ({$category['name']}) by user {$user['user_id']}");
        
        // Return success response
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Category deleted successfully'
        ]);
        
    } catch (Exception $e) {
        // Rollback transaction on error
        $db->rollBack();
        throw $e;
    }
    
} catch (PDOException $e) {
    // Log the error for debugging
    logMessage('ERROR', 'Category delete database error: ' . $e->getMessage());
    
    // Return generic error to client (don't expose internal details)
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred while deleting the category'
    ]);
} catch (Exception $e) {
    // Log the error for debugging
    logMessage('ERROR', 'Category delete error: ' . $e->getMessage());
    
    // Return generic error to client (don't expose internal details)
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred while deleting the category'
    ]);
}
?>