<?php
/**
 * Category Update Endpoint
 * 
 * Updates an existing category with validation.
 * Requires admin authentication.
 * 
 * Method: PUT
 * Auth: Required (Admin only)
 * 
 * Request Body:
 * {
 *   "id": "cat-123",
 *   "name": "Updated Category Name",
 *   "slug": "updated-category-slug",
 *   "description": "Updated category description",
 *   "image_url": "/path/to/updated-image.jpg"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "id": "cat-123",
 *     "name": "Updated Category Name",
 *     "slug": "updated-category-slug",
 *     "description": "Updated category description",
 *     "image": "/path/to/updated-image.jpg"
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
        $errors['id'] = 'Category ID is required';
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
    
    // Validate description (optional)
    if (isset($data['description']) && strlen($data['description']) > 5000) {
        $errors['description'] = 'Description must not exceed 5000 characters';
    }
    
    // Validate image_url (optional)
    if (isset($data['image_url']) && !empty($data['image_url'])) {
        if (strlen($data['image_url']) > 500) {
            $errors['image_url'] = 'Image URL must not exceed 500 characters';
        }
        // Basic URL validation
        if (!filter_var($data['image_url'], FILTER_VALIDATE_URL) && !preg_match('/^\//', $data['image_url'])) {
            $errors['image_url'] = 'Image URL must be a valid URL or path';
        }
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
    $name = trim($data['name']);
    $slug = trim($data['slug']);
    $description = isset($data['description']) ? trim($data['description']) : '';
    $image_url = isset($data['image_url']) && !empty($data['image_url']) ? trim($data['image_url']) : null;
    
    // Check if category exists
    $stmt = $db->prepare("SELECT id, slug FROM categories WHERE id = :id");
    $stmt->execute([':id' => $id]);
    $existingCategory = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$existingCategory) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Category not found'
        ]);
        exit;
    }
    
    // Check for duplicate slug (excluding current category)
    $stmt = $db->prepare("SELECT id FROM categories WHERE slug = :slug AND id != :id");
    $stmt->execute([':slug' => $slug, ':id' => $id]);
    if ($stmt->fetch()) {
        http_response_code(422);
        echo json_encode([
            'success' => false,
            'message' => 'A category with this slug already exists',
            'errors' => ['slug' => 'This slug is already in use']
        ]);
        exit;
    }
    
    // Begin transaction
    $db->beginTransaction();
    
    try {
        // Update category
        $stmt = $db->prepare("
            UPDATE categories 
            SET name = :name, slug = :slug, description = :description, image = :image
            WHERE id = :id
        ");
        
        $result = $stmt->execute([
            ':id' => $id,
            ':name' => $name,
            ':slug' => $slug,
            ':description' => $description,
            ':image' => $image_url
        ]);
        
        if (!$result) {
            throw new Exception('Failed to update category');
        }
        
        // Check if any rows were affected
        if ($stmt->rowCount() === 0) {
            // No changes were made, but this is not necessarily an error
            // Fetch the current category data
            $stmt = $db->prepare("
                SELECT id, name, slug, description, image 
                FROM categories 
                WHERE id = :id
            ");
            $stmt->execute([':id' => $id]);
            $category = $stmt->fetch(PDO::FETCH_ASSOC);
        } else {
            // Fetch the updated category
            $stmt = $db->prepare("
                SELECT id, name, slug, description, image 
                FROM categories 
                WHERE id = :id
            ");
            $stmt->execute([':id' => $id]);
            $category = $stmt->fetch(PDO::FETCH_ASSOC);
        }
        
        // Commit transaction
        $db->commit();
        
        // Log success
        logMessage('INFO', "Category updated: {$id} by user {$user['user_id']}");
        
        // Return success response
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'data' => $category,
            'message' => 'Category updated successfully'
        ]);
        
    } catch (Exception $e) {
        // Rollback transaction on error
        $db->rollBack();
        throw $e;
    }
    
} catch (PDOException $e) {
    // Log the error for debugging
    logMessage('ERROR', 'Category update database error: ' . $e->getMessage());
    
    // Check for duplicate key error (in case of race condition)
    if ($e->getCode() == 23000 || strpos($e->getMessage(), 'Duplicate entry') !== false) {
        http_response_code(422);
        echo json_encode([
            'success' => false,
            'message' => 'A category with this slug already exists',
            'errors' => ['slug' => 'This slug is already in use']
        ]);
    } else {
        // Return generic error to client (don't expose internal details)
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'An error occurred while updating the category'
        ]);
    }
} catch (Exception $e) {
    // Log the error for debugging
    logMessage('ERROR', 'Category update error: ' . $e->getMessage());
    
    // Return generic error to client (don't expose internal details)
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred while updating the category'
    ]);
}
?>