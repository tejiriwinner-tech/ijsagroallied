<?php
require_once __DIR__ . '/../../../config/cors.php';
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../config/api.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    $stmt = $db->query("SELECT `key`, `value` FROM settings");
    $settings = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format settings as a key-value object
    $formattedSettings = [];
    foreach ($settings as $setting) {
        $formattedSettings[$setting['key']] = $setting['value'];
    }

    echo json_encode(["success" => true, "data" => $formattedSettings]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: " . $e->getMessage()]);
}
?>