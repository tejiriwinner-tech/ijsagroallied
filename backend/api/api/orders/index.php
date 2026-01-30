<?php
require_once '../../../config/cors.php';
require_once '../../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

// Get authorization token
$headers = getallheaders();
$token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : null;

switch($method) {
    case 'GET':
        // Get orders for user or all orders for admin
        $userId = isset($_GET['user_id']) ? $_GET['user_id'] : null;
        
        if ($userId) {
            $stmt = $db->prepare("SELECT * FROM orders WHERE user_id = :user_id ORDER BY created_at DESC");
            $stmt->execute([':user_id' => $userId]);
        } else {
            $stmt = $db->prepare("SELECT * FROM orders ORDER BY created_at DESC");
            $stmt->execute();
        }
        
        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Get order items for each order
        foreach ($orders as &$order) {
            $stmt = $db->prepare("SELECT * FROM order_items WHERE order_id = :order_id");
            $stmt->execute([':order_id' => $order['id']]);
            $order['items'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
        
        echo json_encode(["success" => true, "data" => $orders]);
        break;
        
    case 'POST':
        // Create new order
        $data = json_decode(file_get_contents("php://input"), true);
        
        $orderId = uniqid('order-');
        
        $stmt = $db->prepare("INSERT INTO orders (id, user_id, total, status, created_at) VALUES (:id, :user_id, :total, 'pending', NOW())");
        $result = $stmt->execute([
            ':id' => $orderId,
            ':user_id' => $data['userId'],
            ':total' => $data['total']
        ]);
        
        if ($result && isset($data['items'])) {
            // Insert order items
            foreach ($data['items'] as $item) {
                $stmt = $db->prepare("INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase, product_name) VALUES (:order_id, :product_id, :quantity, :price, :name)");
                $stmt->execute([
                    ':order_id' => $orderId,
                    ':product_id' => $item['productId'],
                    ':quantity' => $item['quantity'],
                    ':price' => $item['priceAtPurchase'],
                    ':name' => $item['productName']
                ]);
                
                // Update product stock (skip day-old chick batch items)
                if (strpos($item['productId'], 'batch-') !== 0) {
                    $stmt = $db->prepare("UPDATE products SET stock = stock - :qty WHERE id = :id");
                    $stmt->execute([':qty' => $item['quantity'], ':id' => $item['productId']]);
                }
            }
            
            http_response_code(201);
            echo json_encode(["success" => true, "orderId" => $orderId, "message" => "Order created successfully"]);
        } else {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Failed to create order"]);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
}
?>
