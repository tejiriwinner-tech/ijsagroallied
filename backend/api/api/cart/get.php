<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
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

try {
    $query = "SELECT c.product_id as productId, c.quantity FROM cart_items c 
              JOIN products p ON c.product_id = p.id 
              WHERE c.user_id = :user_id";

    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user_id);
    $stmt->execute();

    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Convert numeric strings to actual numbers
    foreach ($items as &$item) {
        $item['quantity'] = (int) $item['quantity'];
    }

    echo json_encode([
        "success" => true,
        "data" => $items
    ]);
} catch (Exception $e) {
    sendError("Failed to fetch cart: " . $e->getMessage(), 500);
}
?>