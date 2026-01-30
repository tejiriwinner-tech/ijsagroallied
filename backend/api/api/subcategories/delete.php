<?php
/**
 * Subcategory Delete Endpoint
 * 
 * Deletes a subcategory from the database.
 * Requires admin authentication.
 * 
 * Method: DELETE
 * Auth: Required (Admin only)
 * 
 * Request Body:
 * {
 *   "id": "subcat-123"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Subcategory deleted successfully"
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
            'message' => 'Subcategory ID is required'
        ]);
        exit;
    }
    
    $subcategoryId = trim($data['id']);
    
    // Check if subcategory exists
    $stmt = $db->prepare("SELECT id, name FROM subcategories WHERE id = :id");
    $stmt->execute([':id' => $subcategoryId]);
    $subcategory = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$subcategory) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Subcategory not found'
        ]);
        exit;
    }
    
    // Check for associated products
    $stmt = $db->prepare("SELECT COUNT(*) as product_count FROM products WHERE subcategory = :subcategory_id");
    $stmt->execute([':subcategory_id' => $subcategoryId]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    $productCount = (int) $result['product_count'];
    
    if ($productCount > 0) {
        http_response_code(422);
        echo json_encode([
            'success' => false,
            'message' => "Cannot delete subcategory. It has {$productCount} associated products.",
            'has_products' => true,
            'product_count' => $productCount
        ]);
        exit;
    }
    
    // Begin transaction
    $db->beginTransaction();
    
    try {
        // Delete the subcategory
        $stmt = $db->prepare("DELETE FROM subcategories WHERE id = :id");
        $result = $stmt->execute([':id' => $subcategoryId]);
        
        if (!$result) {
            throw new Exception('Failed to delete subcategory');
        }
        
        // Check if any rows were affected
        if ($stmt->rowCount() === 0) {
            throw new Exception('Subcategory not found or already deleted');
        }
        
        // Commit transaction
        $db->commit();
        
        // Log success
        logMessage('INFO', "Subcategory deleted: {$subcategoryId} ({$subcategory['name']}) by user {$user['user_id']}");
        
        // Return success response
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Subcategory deleted successfully'
        ]);
        
    } catch (Exception $e) {
        // Rollback transaction on error
        $db->rollBack();
        throw $e;
    }
    
} catch (PDOException $e) {
    // Log the error for debugging
    logMessage('ERROR', 'Subcategory delete database error: ' . $e->getMessage());
    
    // Return generic error to client (don't expose internal details)
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred while deleting the subcategory'
    ]);
} catch (Exception $e) {
    // Log the error for debugging
    logMessage('ERROR', 'Subcategory delete error: ' . $e->getMessage());
    
    // Return generic error to client (don't expose internal details)
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred while deleting the subcategory'
    ]);
}
?>