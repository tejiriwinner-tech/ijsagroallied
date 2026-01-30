<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../config/flutterwave.php';

$database = new Database();
$db = $database->getConnection();
$flutterwave = new Flutterwave();

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['email']) || !isset($data['amount']) || !isset($data['callback_url'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing required fields"]);
    exit;
}

$email = $data['email'];
$amount = $data['amount'];
$callback_url = $data['callback_url'];
$metadata = isset($data['metadata']) ? $data['metadata'] : [];

$result = $flutterwave->initializeTransaction($email, $amount, $callback_url, $metadata);

if ($result && isset($result['status']) && $result['status']) {
    echo json_encode([
        "success" => true,
        "data" => $result['data']
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => isset($result['message']) ? $result['message'] : "Failed to initialize transaction"
    ]);
}
?>