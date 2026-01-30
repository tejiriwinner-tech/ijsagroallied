<?php
// Prevent any output before JSON
ob_start();

require_once __DIR__ . '/../../../config/cors.php';
require_once __DIR__ . '/../../../config/database.php';

// Clear any previous output
ob_clean();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "error" => "Method not allowed"]);
    exit;
}

try {
    $database = new Database();
    $pdo = $database->getConnection();

    $data = json_decode(file_get_contents("php://input"), true);

    $token = $data['token'] ?? '';
    $newPassword = $data['password'] ?? '';

    if (empty($token) || empty($newPassword)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Token and password are required"]);
        exit;
    }

    // Validate password strength
    if (strlen($newPassword) < 6) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Password must be at least 6 characters long"]);
        exit;
    }

    // Verify token and check if it's not expired
    $stmt = $pdo->prepare("
        SELECT pr.user_id, pr.email, u.name 
        FROM password_resets pr 
        JOIN users u ON pr.user_id = u.id 
        WHERE pr.token = ? AND pr.expires_at > NOW()
    ");
    $stmt->execute([$token]);
    $resetData = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$resetData) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Invalid or expired reset token"]);
        exit;
    }

    // Hash the new password
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

    // Update user password
    $stmt = $pdo->prepare("UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?");
    $stmt->execute([$hashedPassword, $resetData['user_id']]);

    // Delete the used reset token
    $stmt = $pdo->prepare("DELETE FROM password_resets WHERE token = ?");
    $stmt->execute([$token]);

    echo json_encode([
        "success" => true, 
        "message" => "Password has been reset successfully. You can now log in with your new password."
    ]);

} catch (Exception $e) {
    error_log("Password reset error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Server error: " . $e->getMessage()]);
}
?>