<?php
/**
 * Clean up duplicate categories
 * KEEP the one with the MIN ID.
 */
require_once __DIR__ . '/../../../config/cors.php';
require_once __DIR__ . '/../../../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    // Find duplicates based on slug
    // We want to keep the one with MIN(id)
    $sql = "
        DELETE c1 FROM categories c1
        INNER JOIN categories c2 
        WHERE c1.id > c2.id AND c1.slug = c2.slug
    ";
    
    $stmt = $db->prepare($sql);
    $stmt->execute();
    
    $deleted = $stmt->rowCount();

    echo json_encode([
        'success' => true,
        'message' => "Cleaned up $deleted duplicate categories."
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
