<?php
/**
 * User Profile Update Endpoint
 * 
 * Updates user profile details (name, phone, profile_picture).
 * 
 * Method: PUT
 * Auth: Required (User themselves or Admin)
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
    // Require authentication
    $authUser = requireAuth();

    // Connect to database
    $database = new Database();
    $db = $database->getConnection();

    // Get request data
    $data = json_decode(file_get_contents("php://input"), true);

    $userId = $data['id'] ?? null;
    $name = $data['name'] ?? null;
    $phone = $data['phone'] ?? null;
    $profile_picture = $data['profile_picture'] ?? null;

    // Validate required fields
    if (!$userId) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'User ID is required'
        ]);
        exit;
    }

    // Check permission: User can only update their own profile unless they are an admin
    if ($authUser['user_id'] !== $userId && $authUser['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'You do not have permission to update this profile'
        ]);
        exit;
    }

    // Check if user exists
    $checkSql = "SELECT id FROM users WHERE id = :id";
    $stmt = $db->prepare($checkSql);
    $stmt->execute([':id' => $userId]);
    if (!$stmt->fetch()) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'User not found'
        ]);
        exit;
    }

    // Build update query dynamically based on provided fields
    $updateFields = [];
    $params = [':id' => $userId];

    if ($name !== null) {
        $updateFields[] = "name = :name";
        $params[':name'] = $name;
    }
    if ($phone !== null) {
        $updateFields[] = "phone = :phone";
        $params[':phone'] = $phone;
    }
    if ($profile_picture !== null) {
        $updateFields[] = "profile_picture = :profile_picture";
        $params[':profile_picture'] = $profile_picture;
    }

    if (empty($updateFields)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'No fields provided for update'
        ]);
        exit;
    }

    $sql = "UPDATE users SET " . implode(', ', $updateFields) . " WHERE id = :id";
    $stmt = $db->prepare($sql);
    $result = $stmt->execute($params);

    if (!$result) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to update profile'
        ]);
        exit;
    }

    // Get updated user details
    $userSql = "SELECT id, email, name, phone, role, profile_picture FROM users WHERE id = :id";
    $stmt = $db->prepare($userSql);
    $stmt->execute([':id' => $userId]);
    $updatedUser = $stmt->fetch(PDO::FETCH_ASSOC);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Profile updated successfully',
        'data' => [
            'user' => $updatedUser
        ]
    ]);

} catch (Exception $e) {
    logMessage('ERROR', 'Profile update error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred while updating profile: ' . $e->getMessage()
    ]);
}
