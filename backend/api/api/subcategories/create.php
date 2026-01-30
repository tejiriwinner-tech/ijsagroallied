<?php
/**
 * Subcategory Create Endpoint
 * 
 * Creates a new subcategory with validation.
 * Requires admin authentication.
 * 
 * Method: POST
 * Auth: Required (Admin only)
 * 
 * Request Body:
 * {
 *   "category_id": "cat-123",
 *   "name": "Subcategory Name",
 *   "slug": "subcategory-slug",
 *   "description": "Subcategory description"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "id": "subcat-123",
 *     "category_id": "cat-123",
 *     "name": "Subcategory Name",
 *     "slug": "subcategory-slug",
 *     "description": "Subcategory description"
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

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
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
    $category_id = trim($data['category_id']);
    $name = trim($data['name']);
    $slug = trim($data['slug']);
    
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
    
    // Check for duplicate slug
    $stmt = $db->prepare("SELECT id FROM subcategories WHERE slug = :slug");
    $stmt->execute([':slug' => $slug]);
    if ($stmt->fetch()) {
        http_response_code(422);
        echo json_encode([
            'success' => false,
            'message' => 'A subcategory with this slug already exists',
            'errors' => ['slug' => 'This slug is already in use']
        ]);
        exit;
    }
    
    // Generate unique ID
    $subcategoryId = uniqid('subcat-');
    
    // Begin transaction
    $db->beginTransaction();
    
    try {
        // Insert subcategory
        $stmt = $db->prepare("
            INSERT INTO subcategories (id, category_id, name, slug) 
            VALUES (:id, :category_id, :name, :slug)
        ");
        
        $result = $stmt->execute([
            ':id' => $subcategoryId,
            ':category_id' => $category_id,
            ':name' => $name,
            ':slug' => $slug
        ]);
        
        if (!$result) {
            throw new Exception('Failed to insert subcategory');
        }
        
        // Fetch the created subcategory
        $stmt = $db->prepare("
            SELECT id, category_id, name, slug 
            FROM subcategories 
            WHERE id = :id
        ");
        $stmt->execute([':id' => $subcategoryId]);
        $subcategory = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Commit transaction
        $db->commit();
        
        // Log success
        logMessage('INFO', "Subcategory created: {$subcategoryId} by user {$user['user_id']}");
        
        // Return success response
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'data' => $subcategory,
            'message' => 'Subcategory created successfully'
        ]);
        
    } catch (Exception $e) {
        // Rollback transaction on error
        $db->rollBack();
        throw $e;
    }
    
} catch (PDOException $e) {
    // Log the error for debugging
    logMessage('ERROR', 'Subcategory create database error: ' . $e->getMessage());
    
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
            'message' => 'An error occurred while creating the subcategory'
        ]);
    }
} catch (Exception $e) {
    // Log the error for debugging
    logMessage('ERROR', 'Subcategory create error: ' . $e->getMessage());
    
    // Return generic error to client (don't expose internal details)
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred while creating the subcategory'
    ]);
}
?>