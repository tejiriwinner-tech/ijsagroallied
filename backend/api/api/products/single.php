<?php
require_once '../../../config/cors.php';
require_once '../../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? $_GET['id'] : null;

if (!$id) {
    http_response_code(400);
    echo json_encode(["error" => "Product ID is required"]);
    exit;
}

switch($method) {
    case 'GET':
        $stmt = $db->prepare("SELECT * FROM products WHERE id = :id");
        $stmt->execute([':id' => $id]);
        $product = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($product) {
            echo json_encode(["success" => true, "data" => $product]);
        } else {
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "Product not found"]);
        }
        break;
        
    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        
        $query = "UPDATE products SET 
                  name = :name, 
                  description = :description, 
                  price = :price, 
                  image = :image, 
                  category = :category, 
                  subcategory = :subcategory, 
                  stock = :stock, 
                  unit = :unit 
                  WHERE id = :id";
        
        $stmt = $db->prepare($query);
        $result = $stmt->execute([
            ':id' => $id,
            ':name' => $data['name'],
            ':description' => $data['description'],
            ':price' => $data['price'],
            ':image' => $data['image'],
            ':category' => $data['category'],
            ':subcategory' => $data['subcategory'] ?? null,
            ':stock' => $data['stock'],
            ':unit' => $data['unit']
        ]);
        
        if ($result) {
            echo json_encode(["success" => true, "message" => "Product updated successfully"]);
        } else {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Failed to update product"]);
        }
        break;
        
    case 'DELETE':
        $stmt = $db->prepare("DELETE FROM products WHERE id = :id");
        $result = $stmt->execute([':id' => $id]);
        
        if ($result) {
            echo json_encode(["success" => true, "message" => "Product deleted successfully"]);
        } else {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Failed to delete product"]);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
}
?>
