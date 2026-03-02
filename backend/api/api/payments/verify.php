<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../config/paystack.php';

$database = new Database();
$db = $database->getConnection();
$paystack = new Paystack();

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'GET') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

$transaction_id = isset($_GET['reference']) ? $_GET['reference'] : (isset($_GET['transaction_id']) ? $_GET['transaction_id'] : null);

if (!$transaction_id) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing transaction reference"]);
    exit;
}

$result = $paystack->verifyTransaction($transaction_id);

if ($result && isset($result['status']) && $result['status'] && $result['data']['status'] === 'success') {
    $metadata = $result['data']['metadata'];
    $userId = $metadata['userId'];
    $items = $metadata['items'];
    $total = $result['data']['amount'] / 100; // Paystack returns amount in kobo, convert to naira

    // Create order in database
    try {
        $db->beginTransaction();

        $orderId = uniqid('order-');
        $stmt = $db->prepare("INSERT INTO orders (id, user_id, total, status, payment_reference, created_at) VALUES (:id, :user_id, :total, 'processing', :ref, NOW())");
        $stmt->execute([
            ':id' => $orderId,
            ':user_id' => $userId,
            ':total' => $total,
            ':ref' => $transaction_id
        ]);

        foreach ($items as $item) {
            $stmt = $db->prepare("INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase, product_name) VALUES (:order_id, :product_id, :quantity, :price, :name)");
            $stmt->execute([
                ':order_id' => $orderId,
                ':product_id' => $item['productId'],
                ':quantity' => $item['quantity'],
                ':price' => $item['priceAtPurchase'],
                ':name' => $item['productName']
            ]);

            // Update stock (skip day-old chick batch items)
            if (strpos($item['productId'], 'batch-') !== 0) {
                $stmt = $db->prepare("UPDATE products SET stock = stock - :qty WHERE id = :id");
                $stmt->execute([':qty' => $item['quantity'], ':id' => $item['productId']]);
            }
        }

        $db->commit();

        echo json_encode([
            "success" => true,
            "message" => "Payment verified and order created",
            "orderId" => $orderId
        ]);
    } catch (Exception $e) {
        $db->rollBack();
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "failed to save order: " . $e->getMessage()]);
    }
} else {
    echo json_encode([
        "success" => false,
        "message" => "Payment verification failed or payment not successful"
    ]);
}
?>