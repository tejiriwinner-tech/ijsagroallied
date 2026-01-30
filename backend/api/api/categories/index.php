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

$stmt = $db->prepare("SELECT * FROM categories");
$stmt->execute();
$categories = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Get subcategories for each category
foreach ($categories as &$category) {
    $stmt = $db->prepare("SELECT id, name, slug FROM subcategories WHERE category_id = :category_id");
    $stmt->execute([':category_id' => $category['id']]);
    $category['subcategories'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
}

echo json_encode(["success" => true, "data" => $categories]);
?>
