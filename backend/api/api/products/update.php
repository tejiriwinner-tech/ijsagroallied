<?php
// Prevent any output before JSON
ob_start();

require_once __DIR__ . '/../../../config/cors.php';
require_once __DIR__ . '/../../../config/database.php';

// Clear any previous output
ob_clean();

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode(["success" => false, "error" => "Method not allowed"]);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    $data = json_decode(file_get_contents("php://input"), true);

    $id = $data['id'] ?? '';
    $name = $data['name'] ?? '';
    $description = $data['description'] ?? '';
    $price = $data['price'] ?? 0;
    $image = $data['image'] ?? '';
    $category = $data['category'] ?? '';
    $subcategory = $data['subcategory'] ?? null;
    $stock = $data['stock'] ?? 0;
    $unit = $data['unit'] ?? '';

    if (empty($id) || empty($name) || empty($category) || $price <= 0) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "ID, name, category, and price are required"]);
        exit;
    }

    $stmt = $db->prepare("UPDATE products SET name = :name, description = :description, price = :price, image = :image, category = :category, subcategory = :subcategory, stock = :stock, unit = :unit WHERE id = :id");
    
    $result = $stmt->execute([
        ':id' => $id,
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
        echo json_encode([
            "success" => true,
            "data" => [
                "id" => $id,
                "name" => $name,
                "description" => $description,
                "price" => (float)$price,
                "image" => $image,
                "category" => $category,
                "subcategory" => $subcategory,
                "stock" => (int)$stock,
                "unit" => $unit
            ],
            "message" => "Product updated successfully"
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Failed to update product"]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Server error: " . $e->getMessage()]);
}
?>
