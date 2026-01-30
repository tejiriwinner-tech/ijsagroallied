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
    $db = $database->getConnection();

    $data = json_decode(file_get_contents("php://input"), true);

    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';
    $name = $data['name'] ?? '';

    if (empty($email) || empty($password) || empty($name)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "All fields are required"]);
        exit;
    }

    // Check if user already exists
    $stmt = $db->prepare("SELECT id FROM users WHERE email = :email");
    $stmt->execute([':email' => $email]);

    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(["success" => false, "message" => "Email already registered"]);
        exit;
    }

    // Create new user
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
    $userId = uniqid('user-');
    $token = bin2hex(random_bytes(32));

    $stmt = $db->prepare("INSERT INTO users (id, email, password, name, role, auth_token) VALUES (:id, :email, :password, :name, 'user', :token)");
    $result = $stmt->execute([
        ':id' => $userId,
        ':email' => $email,
        ':password' => $hashedPassword,
        ':name' => $name,
        ':token' => $token
    ]);

    if ($result) {
        http_response_code(201);
        echo json_encode([
            "success" => true,
            "data" => [
                "user" => [
                    "id" => $userId,
                    "email" => $email,
                    "name" => $name,
                    "role" => "user"
                ],
                "token" => $token
            ]
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Registration failed"]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Server error: " . $e->getMessage()]);
}
?>
