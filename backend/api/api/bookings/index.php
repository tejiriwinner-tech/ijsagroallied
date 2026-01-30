<?php
require_once '../../../config/cors.php';
require_once '../../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Get all bookings or filter by user
        $userId = isset($_GET['user_id']) ? $_GET['user_id'] : null;

        if ($userId) {
            $stmt = $db->prepare("SELECT cb.*, COALESCE(cb.customer_name, u.name) AS customer_name, COALESCE(cb.customer_email, u.email) AS customer_email, COALESCE(cb.customer_phone, u.phone) AS customer_phone FROM chick_bookings cb LEFT JOIN users u ON cb.user_id = u.id WHERE cb.user_id = :user_id ORDER BY cb.created_at DESC");
            $stmt->execute([':user_id' => $userId]);
        } else {
            $stmt = $db->prepare("SELECT cb.*, COALESCE(cb.customer_name, u.name) AS customer_name, COALESCE(cb.customer_email, u.email) AS customer_email, COALESCE(cb.customer_phone, u.phone) AS customer_phone FROM chick_bookings cb LEFT JOIN users u ON cb.user_id = u.id ORDER BY cb.created_at DESC");
            $stmt->execute();
        }

        $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["success" => true, "data" => $bookings]);
        break;

    case 'POST':
        // Create new booking
        $data = json_decode(file_get_contents("php://input"), true);

        $bookingId = uniqid('booking-');

        $stmt = $db->prepare("INSERT INTO chick_bookings (id, user_id, batch_id, breed, quantity, total_price, customer_name, customer_email, customer_phone, delivery_address, description, pickup_date, status, created_at) VALUES (:id, :user_id, :batch_id, :breed, :quantity, :total, :name, :email, :phone, :address, :description, :pickup, 'pending', NOW())");

        $result = $stmt->execute([
            ':id' => $bookingId,
            ':user_id' => $data['userId'] ?? null,
            ':batch_id' => $data['batchId'],
            ':breed' => $data['breed'],
            ':quantity' => $data['quantity'],
            ':total' => $data['totalPrice'],
            ':name' => $data['customerName'],
            ':email' => $data['customerEmail'],
            ':phone' => $data['customerPhone'],
            ':address' => $data['deliveryAddress'],
            ':description' => $data['description'] ?? null,
            ':pickup' => $data['pickupDate']
        ]);

        if ($result) {
            // Update available quantity
            $stmt = $db->prepare("UPDATE chick_batches SET available_quantity = available_quantity - :qty WHERE id = :id");
            $stmt->execute([':qty' => $data['quantity'], ':id' => $data['batchId']]);

            http_response_code(201);
            echo json_encode(["success" => true, "bookingId" => $bookingId, "message" => "Booking created successfully"]);
        } else {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Failed to create booking"]);
        }
        break;

    case 'PUT':
        // Update booking status
        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['id']) || !isset($data['status'])) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Missing booking ID or status"]);
            exit;
        }

        $stmt = $db->prepare("UPDATE chick_bookings SET status = :status, updated_at = NOW() WHERE id = :id");
        $result = $stmt->execute([
            ':status' => $data['status'],
            ':id' => $data['id']
        ]);

        if ($result) {
            echo json_encode(["success" => true, "message" => "Booking status updated successfully"]);
        } else {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Failed to update booking status"]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
}
?>