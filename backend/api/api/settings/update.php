<?php
require_once __DIR__ . '/../../../config/cors.php';
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../config/api.php';

// Require admin authentication
$user = requireAdmin();

try {
    $database = new Database();
    $db = $database->getConnection();

    $data = json_decode(file_get_contents("php://input"), true);

    if (!is_array($data)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Invalid data format"]);
        exit;
    }

    $db->beginTransaction();

    foreach ($data as $key => $value) {
        $stmt = $db->prepare("INSERT INTO settings (`key`, `value`) VALUES (:key, :value) ON DUPLICATE KEY UPDATE `value` = :value_update");
        $stmt->execute([
            ':key' => $key,
            ':value' => $value,
            ':value_update' => $value
        ]);
    }

    $db->commit();

    echo json_encode(["success" => true, "message" => "Settings updated successfully"]);
} catch (Exception $e) {
    if (isset($db))
        $db->rollBack();
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: " . $e->getMessage()]);
}
?>