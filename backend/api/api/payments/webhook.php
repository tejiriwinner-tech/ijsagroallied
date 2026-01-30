<?php
require_once '../../config/database.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    exit;
}

// Retrieve the request's body and parse it as JSON
$input = file_get_contents('php://input');
$event = json_decode($input);

// Flutterwave sends a secret hash in the header to verify the request
$secretHash = FLUTTERWAVE_SECRET_KEY; // Or a custom hash set in Flutterwave dashboard
$headerHash = isset($_SERVER['HTTP_VERIF_HASH']) ? $_SERVER['HTTP_VERIF_HASH'] : '';

if (!$headerHash || $headerHash !== $secretHash) {
    // This request is not from Flutterwave or hash mismatch
    http_response_code(401);
    exit;
}

http_response_code(200); // Acknowledge receipt immediately

// Handle the event
if ($event->event === 'charge.completed' && $event->data->status === 'successful') {
    $reference = $event->data->tx_ref;
    $amount = $event->data->amount;

    $database = new Database();
    $db = $database->getConnection();

    // Check if order already exists
    $stmt = $db->prepare("SELECT id FROM orders WHERE payment_reference = :ref");
    $stmt->execute([':ref' => $reference]);
    $order = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$order) {
        // Robustness: Create order if it doesn't exist (e.g. timeout on redirect)
        error_log("Payment success webhook received for reference: " . $reference . " but order not found.");
    } else {
        // Update status if needed
        $stmt = $db->prepare("UPDATE orders SET status = 'processing' WHERE id = :id AND status = 'pending'");
        $stmt->execute([':id' => $order['id']]);
    }
}
?>