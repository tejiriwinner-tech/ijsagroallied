<?php
// CORS headers - Allow Next.js frontend to access this API
$allowedOrigins = getenv('CORS_ALLOWED_ORIGINS') ?: '*';
header("Access-Control-Allow-Origin: $allowedOrigins");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
?>