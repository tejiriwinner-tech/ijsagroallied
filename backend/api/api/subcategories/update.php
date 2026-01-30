<?php
/**
 * Subcategory Update Endpoint
 * 
 * Updates an existing subcategory with validation.
 * Requires admin authentication.
 * 
 * Method: PUT
 * Auth: Required (Admin only)
 * 
 * Request Body:
 * {
 *   "id": "subcat-123",
 *   "category_id": "cat-123",
 *   "name": "Updated Subcategory Name",
 *   "slug": "updated-subcategory-slug"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "id": "subcat-123",
 *     "category_id": "cat-123",
 *     "name": "Updated Subcategory Name",
 *     "slug": "updated-subcategory-slug"
 *   }
 * }
 */

// Prevent any output before JSON
ob_start();

require_once __DIR__ . '/../../../config/cors.php';
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../config/api.php';

// Clear any previous output
ob_clean();

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
    
    // Validate required fields
    $errors = [];
    
    // Validate ID
    if (!isset($data['id']) || empty(trim($data['id']))) {
        $errors['id'] = 'Subcategory ID is required';
    }
    
    // Validate category_id
    if (!isset($data['category_id']) || empty(trim($data['category_id']))) {
        $errors['category_id'] = 'Parent category ID is required';
    }
    
    // Validate name
    if (!isset($data['name']) || empty(trim($data['name']))) {
        $errors['name'] = 'Name is required';
    } elseif (strlen(trim($data['name'])) > 255) {
        $errors['name'] = 'Name must not exceed 255 characters';
    }
    
    // Validate slug
    if (!isset($data['slug']) || empty(trim($data['slug']))) {
        $errors['slug'] = 'Slug is required';
    } elseif (strlen(trim($data['slug'])) > 255) {
        $errors['slug'] = 'Slug must not exceed 255 characters';
    } elseif (!preg_match('/^[a-z0-9-]+$/', $data['slug'])) {
        $errors['slug'] = 'Slug must contain only lowercase letters, numbers, and hyphens';
    }
    
    // If there are validation errors, return them
    if (!empty($errors)) {
        http_response_code(422);
        echo json_encode([
            'success' => false,
            'message' => 'Validation failed',
            'errors' => $errors
        ]);
        exit;
    }
    
    // Sanitize input
    $id = trim($data['id']);
    $category_id = trim($data['category_id']);
    $name = trim($data['name']);
    $slug = trim($data['slug']);
    
    // Check if subcategory exists
    $stmt = $db->prepare("SELECT id, slug FROM subcategories WHERE id = :id");
    $stmt->execute([':id' => $id]);
    $existingSubcategory = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$existingSubcategory) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Subcategory not found'
        ]);
        exit;
    }
    
    // Validate parent category exists
    $stmt = $db->prepare("SELECT id FROM categories WHERE id = :category_id");
    $stmt->execute([':category_id' => $category_id]);
    if (!$stmt->fetch()) {
        http_response_code(422);
        echo json_encode([
            'success' => false,
            'message' => 'Parent category does not exist',
            'errors' => ['category_id' => 'The specified parent category was not found']
        ]);
        exit;
    }
    
    // Check for duplicate slug (excluding current subcategory)
    $stmt = $db->prepare("SELECT id FROM subcategories WHERE slug = :slug AND id != :id");
    $stmt->execute([':slug' => $slug, ':id' => $id]);
    if ($stmt->fetch()) {
        http_response_code(422);
        echo json_encode([
            'success' => false,
            'message' => 'A subcategory with this slug already exists',
            'errors' => ['slug' => 'This slug is already in use']
        ]);
        exit;
    }
    
    // Begin transaction
    $db->beginTransaction();
    
    try {
        // Update subcategory
        $stmt = $db->prepare("
            UPDATE subcategories 
            SET category_id = :category_id, name = :name, slug = :slug
            WHERE id = :id
        ");
        
        $result = $stmt->execute([
            ':id' => $id,
            ':category_id' => $category_id,
            ':name' => $name,
            ':slug' => $slug
        ]);
        
        if (!$result) {
            throw new Exception('Failed to update subcategory');
        }
        
        // Check if any rows were affected
        if ($stmt->rowCount() === 0) {
            // No changes were made, but this is not necessarily an error
            // Fetch the current subcategory data
            $stmt = $db->prepare("
                SELECT id, category_id, name, slug 
                FROM subcategories 
                WHERE id = :id
            ");
            $stmt->execute([':id' => $id]);
            $subcategory = $stmt->fetch(PDO::FETCH_ASSOC);
        } else {
            // Fetch the updated subcategory
            $stmt = $db->prepare("
                SELECT id, category_id, name, slug 
                FROM subcategories 
                WHERE id = :id
            ");
            $stmt->execute([':id' => $id]);
            $subcategory = $stmt->fetch(PDO::FETCH_ASSOC);
        }
        
        // Commit transaction
        $db->commit();
        
        // Log success
        logMessage('INFO', "Subcategory updated: {$id} by user {$user['user_id']}");
        
        // Return success response
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'data' => $subcategory,
            'message' => 'Subcategory updated successfully'
        ]);
        
    } catch (Exception $e) {
        // Rollback transaction on error
        $db->rollBack();
        throw $e;
    }
    
} catch (PDOException $e) {
    // Log the error for debugging
    logMessage('ERROR', 'Subcategory update database error: ' . $e->getMessage());
    
    // Check for duplicate key error (in case of race condition)
    if ($e->getCode() == 23000 || strpos($e->getMessage(), 'Duplicate entry') !== false) {
        http_response_code(422);
        echo json_encode([
            'success' => false,
            'message' => 'A subcategory with this slug already exists',
            'errors' => ['slug' => 'This slug is already in use']
        ]);
    } else {
        // Return generic error to client (don't expose internal details)
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'An error occurred while updating the subcategory'
        ]);
    }
} catch (Exception $e) {
    // Log the error for debugging
    logMessage('ERROR', 'Subcategory update error: ' . $e->getMessage());
    
    // Return generic error to client (don't expose internal details)
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred while updating the subcategory'
    ]);
}
?>