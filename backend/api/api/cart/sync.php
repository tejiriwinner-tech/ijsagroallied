<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Prevent any output before JSON
ob_start();

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../config/api.php';

// Clear any previous output
ob_clean();

$database = new Database();
$db = $database->getConnection();

// Secure endpoint
$user_data = requireAuth();
$user_id = $user_data['user_id'];

// Get posted data
$data = json_decode(file_get_contents("php://input"));

if (!isset($data->items) || !is_array($data->items)) {
    sendError("Invalid data format. 'items' array required.", 400);
}

try {
    $db->beginTransaction();

    // 1. Clear existing cart items for this user
    $clear_query = "DELETE FROM cart_items WHERE user_id = :user_id";
    $stmt = $db->prepare($clear_query);
    $stmt->bindParam(':user_id', $user_id);
    $stmt->execute();

    // 2. Insert new items
    if (!empty($data->items)) {
        $insert_query = "INSERT INTO cart_items (user_id, product_id, quantity) VALUES (:user_id, :product_id, :quantity)";
        $stmt = $db->prepare($insert_query);

        foreach ($data->items as $item) {
            if (isset($item->productId) && isset($item->quantity)) {
                $stmt->bindParam(':user_id', $user_id);
                $stmt->bindParam(':product_id', $item->productId);
                $stmt->bindParam(':quantity', $item->quantity);
                $stmt->execute();
            }
        }
    }

    $db->commit();

    echo json_encode([
        "success" => true,
        "message" => "Cart synchronized successfully"
    ]);
} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    sendError("Failed to sync cart: " . $e->getMessage(), 500);
}
?>