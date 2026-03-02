<?php
require_once '../../config/database.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    exit;
}

// Retrieve the request's body and parse it as JSON
$input = file_get_contents('php://input');
$event = json_decode($input);

// Paystack sends its signature in the X-Paystack-Signature header
$paystackSignature = isset($_SERVER['HTTP_X_PAYSTACK_SIGNATURE']) ? $_SERVER['HTTP_X_PAYSTACK_SIGNATURE'] : '';
$computedSignature = hash_hmac('sha512', $input, PAYSTACK_SECRET_KEY);

if (!$paystackSignature || $paystackSignature !== $computedSignature) {
    // This request is not from Paystack or signature mismatch
    http_response_code(401);
    exit;
}

http_response_code(200); // Acknowledge receipt immediately

// Handle the event
if ($event->event === 'charge.success' && $event->data->status === 'success') {
    $reference = $event->data->reference;
    $amount = $event->data->amount / 100; // Paystack sends amount in kobo

    $database = new Database();
    $db = $database->getConnection();

    // Check if order already exists
    $stmt = $db->prepare("SELECT id FROM orders WHERE payment_reference = :ref");
    $stmt->execute([':ref' => $reference]);
    $order = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$order) {
        // Robustness: Log if order not found (e.g. timeout on redirect)
        error_log("Payment success webhook received for reference: " . $reference . " but order not found.");
    } else {
        // Update status if needed
        $stmt = $db->prepare("UPDATE orders SET status = 'processing' WHERE id = :id AND status = 'pending'");
        $stmt->execute([':id' => $order['id']]);
    }
}
?>