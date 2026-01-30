<?php
require_once '../../../config/cors.php';
require_once '../../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        // Get all products or filter by category
        $category = isset($_GET['category']) ? $_GET['category'] : null;
        $subcategory = isset($_GET['subcategory']) ? $_GET['subcategory'] : null;
        $search = isset($_GET['search']) ? trim($_GET['search']) : null;
        
        $query = "SELECT * FROM products WHERE 1=1";
        $params = [];
        
        if ($category) {
            $query .= " AND category = :category";
            $params[':category'] = $category;
        }
        
        if ($subcategory) {
            $query .= " AND subcategory = :subcategory";
            $params[':subcategory'] = $subcategory;
        }

        if ($search !== null && $search !== '') {
            $query .= " AND (name LIKE :search OR description LIKE :search OR category LIKE :search OR subcategory LIKE :search)";
            $params[':search'] = '%' . $search . '%';
        }
        
        $stmt = $db->prepare($query);
        $stmt->execute($params);
        
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["success" => true, "data" => $products]);
        break;
        
    case 'POST':
        // Add new product (admin only)
        $data = json_decode(file_get_contents("php://input"), true);
        
        $query = "INSERT INTO products (id, name, description, price, image, category, subcategory, stock, unit) 
                  VALUES (:id, :name, :description, :price, :image, :category, :subcategory, :stock, :unit)";
        
        $stmt = $db->prepare($query);
        $result = $stmt->execute([
            ':id' => uniqid('prod-'),
            ':name' => $data['name'],
            ':description' => $data['description'],
            ':price' => $data['price'],
            ':image' => $data['image'] ?? '/placeholder.svg?height=400&width=400',
            ':category' => $data['category'],
            ':subcategory' => $data['subcategory'] ?? null,
            ':stock' => $data['stock'],
            ':unit' => $data['unit']
        ]);
        
        if ($result) {
            http_response_code(201);
            echo json_encode(["success" => true, "message" => "Product created successfully"]);
        } else {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Failed to create product"]);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
}
?>
