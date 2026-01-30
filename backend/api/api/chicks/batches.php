<?php
require_once '../../../config/cors.php';
require_once '../../../config/database.php';

$database = new Database();
$db = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

$stmt = $db->prepare("SELECT * FROM chick_batches WHERE available_quantity > 0 ORDER BY available_date ASC");
$stmt->execute();
$batches = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode(["success" => true, "data" => $batches]);
?>
