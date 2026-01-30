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

    $name = $data['name'] ?? '';
    $description = $data['description'] ?? '';
    $price = $data['price'] ?? 0;
    $image = $data['image'] ?? '';
    $category = $data['category'] ?? '';
    $subcategory = $data['subcategory'] ?? null;
    $stock = $data['stock'] ?? 0;
    $unit = $data['unit'] ?? '';

    if (empty($name) || empty($category) || $price <= 0) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Name, category, and price are required"]);
        exit;
    }

    $productId = uniqid('product-');

    $stmt = $db->prepare("INSERT INTO products (id, name, description, price, image, category, subcategory, stock, unit) VALUES (:id, :name, :description, :price, :image, :category, :subcategory, :stock, :unit)");
    
    $result = $stmt->execute([
        ':id' => $productId,
        ':name' => $name,
        ':description' => $description,
        ':price' => $price,
        ':image' => $image,
        ':category' => $category,
        ':subcategory' => $subcategory,
        ':stock' => $stock,
        ':unit' => $unit
    ]);

    if ($result) {
        http_response_code(201);
        echo json_encode([
            "success" => true,
            "data" => [
                "id" => $productId,
                "name" => $name,
                "description" => $description,
                "price" => (float)$price,
                "image" => $image,
                "category" => $category,
                "subcategory" => $subcategory,
                "stock" => (int)$stock,
                "unit" => $unit
            ],
            "message" => "Product created successfully"
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Failed to create product"]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Server error: " . $e->getMessage()]);
}
?>
