<?php
// Prevent any output before JSON
ob_start();

require_once __DIR__ . '/../../../config/cors.php';
require_once __DIR__ . '/../../../config/database.php';

// Clear any previous output
ob_clean();

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(["success" => false, "error" => "Method not allowed"]);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    $data = json_decode(file_get_contents("php://input"), true);
    $id = $data['id'] ?? '';

    if (empty($id)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Product ID is required"]);
        exit;
    }

    $stmt = $db->prepare("DELETE FROM products WHERE id = :id");
    $result = $stmt->execute([':id' => $id]);

    if ($result) {
        echo json_encode([
            "success" => true,
            "message" => "Product deleted successfully"
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Failed to delete product"]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Server error: " . $e->getMessage()]);
}
?>
