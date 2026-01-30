<?php
/**
 * API Configuration
 * 
 * Central configuration file for API settings, constants, and utilities
 */

// API Version
define('API_VERSION', '1.0.0');

// API Base Path
define('API_BASE_PATH', '/api');

// Pagination Defaults
define('DEFAULT_PAGE_SIZE', 50);
define('MAX_PAGE_SIZE', 100);

// File Upload Settings
define('MAX_UPLOAD_SIZE', 5242880); // 5MB in bytes
define('ALLOWED_IMAGE_TYPES', ['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
define('UPLOAD_PATH', __DIR__ . '/../uploads/');

// Security Settings
define('JWT_SECRET', getenv('JWT_SECRET') ?: 'change-this-secret-key-in-production');
define('JWT_EXPIRATION', 3600); // 1 hour in seconds
define('PASSWORD_MIN_LENGTH', 8);
define('MAX_LOGIN_ATTEMPTS', 5);
define('LOGIN_LOCKOUT_TIME', 900); // 15 minutes in seconds

// Rate Limiting (requests per minute)
define('RATE_LIMIT_ANONYMOUS', 60);
define('RATE_LIMIT_AUTHENTICATED', 120);
define('RATE_LIMIT_ADMIN', 300);

// Email Settings
define('SMTP_HOST', getenv('SMTP_HOST') ?: 'smtp.gmail.com');
define('SMTP_PORT', getenv('SMTP_PORT') ?: 587);
define('SMTP_USER', getenv('SMTP_USER') ?: '');
define('SMTP_PASS', getenv('SMTP_PASS') ?: '');
define('SMTP_FROM', getenv('SMTP_FROM') ?: 'noreply@ijsagroallied.com');

// Application Settings
define('APP_NAME', 'Ijs Agroallied API');
define('APP_ENV', getenv('APP_ENV') ?: 'development');
define('APP_DEBUG', getenv('APP_DEBUG') === 'true' || APP_ENV === 'development');
define('APP_URL', getenv('APP_URL') ?: 'http://localhost:8000');

// Logging
define('LOG_PATH', __DIR__ . '/../logs/');
define('LOG_LEVEL', APP_DEBUG ? 'DEBUG' : 'ERROR');

// Cache Settings
define('CACHE_ENABLED', getenv('CACHE_ENABLED') === 'true');
define('CACHE_TTL', 3600); // 1 hour

// Business Logic Constants
define('MIN_CHICK_ORDER', 50);
define('CURRENCY', 'NGN');
define('CURRENCY_SYMBOL', '₦');

/**
 * Helper Functions
 */

/**
 * Generate a UUID v4
 */
function generateUUID() {
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

/**
 * Log message to file
 */
function logMessage($level, $message, $context = []) {
    if (!APP_DEBUG && $level === 'DEBUG') {
        return;
    }
    
    $logFile = LOG_PATH . date('Y-m-d') . '.log';
    $timestamp = date('Y-m-d H:i:s');
    $contextStr = !empty($context) ? json_encode($context) : '';
    $logEntry = "[$timestamp] [$level] $message $contextStr" . PHP_EOL;
    
    if (!file_exists(LOG_PATH)) {
        mkdir(LOG_PATH, 0755, true);
    }
    
    file_put_contents($logFile, $logEntry, FILE_APPEND);
}

/**
 * Send JSON response
 */
function sendResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}

/**
 * Send error response
 */
function sendError($message, $statusCode = 400, $code = null) {
    $response = ['error' => $message];
    if ($code) {
        $response['code'] = $code;
    }
    sendResponse($response, $statusCode);
}

/**
 * Validate required fields
 */
function validateRequired($data, $requiredFields) {
    $missing = [];
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            $missing[] = $field;
        }
    }
    
    if (!empty($missing)) {
        sendError('Missing required fields: ' . implode(', ', $missing), 400, 'MISSING_FIELDS');
    }
}

/**
 * Sanitize input
 */
function sanitizeInput($data) {
    if (is_array($data)) {
        return array_map('sanitizeInput', $data);
    }
    return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
}

/**
 * Validate email
 */
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Hash password
 */
function hashPassword($password) {
    return password_hash($password, PASSWORD_BCRYPT);
}

/**
 * Verify password
 */
function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

/**
 * Generate JWT token (simplified - use a proper JWT library in production)
 */
function generateToken($userId, $role) {
    $header = base64_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $payload = base64_encode(json_encode([
        'user_id' => $userId,
        'role' => $role,
        'exp' => time() + JWT_EXPIRATION
    ]));
    $signature = hash_hmac('sha256', "$header.$payload", JWT_SECRET);
    
    return "$header.$payload.$signature";
}

/**
 * Verify JWT token
 */
function verifyToken($token) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return false;
    }
    
    list($header, $payload, $signature) = $parts;
    $validSignature = hash_hmac('sha256', "$header.$payload", JWT_SECRET);
    
    if ($signature !== $validSignature) {
        return false;
    }
    
    $payloadData = json_decode(base64_decode($payload), true);
    if ($payloadData['exp'] < time()) {
        return false; // Token expired
    }
    
    return $payloadData;
}

/**
 * Get authorization token from header
 */
function getAuthToken() {
    $headers = getallheaders();
    if (isset($headers['Authorization'])) {
        $auth = $headers['Authorization'];
        if (preg_match('/Bearer\s+(.*)$/i', $auth, $matches)) {
            return $matches[1];
        }
    }
    return null;
}

/**
 * Require authentication
 */
function requireAuth() {
    $token = getAuthToken();
    if (!$token) {
        sendError('Authentication required', 401, 'AUTH_REQUIRED');
    }
    
    $payload = verifyToken($token);
    if (!$payload) {
        sendError('Invalid or expired token', 401, 'INVALID_TOKEN');
    }
    
    return $payload;
}

/**
 * Require admin role
 */
function requireAdmin() {
    $user = requireAuth();
    if ($user['role'] !== 'admin') {
        sendError('Admin access required', 403, 'FORBIDDEN');
    }
    return $user;
}

/**
 * Format price for display
 */
function formatPrice($amount) {
    return CURRENCY_SYMBOL . number_format($amount, 2);
}

/**
 * Validate image upload
 */
function validateImageUpload($file) {
    if ($file['error'] !== UPLOAD_ERR_OK) {
        return ['valid' => false, 'error' => 'Upload failed'];
    }
    
    if ($file['size'] > MAX_UPLOAD_SIZE) {
        return ['valid' => false, 'error' => 'File too large'];
    }
    
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);
    
    if (!in_array($mimeType, ALLOWED_IMAGE_TYPES)) {
        return ['valid' => false, 'error' => 'Invalid file type'];
    }
    
    return ['valid' => true];
}

/**
 * Handle file upload
 */
function handleFileUpload($file, $directory = 'products') {
    $validation = validateImageUpload($file);
    if (!$validation['valid']) {
        sendError($validation['error'], 400, 'UPLOAD_ERROR');
    }
    
    $uploadDir = UPLOAD_PATH . $directory . '/';
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = generateUUID() . '.' . $extension;
    $filepath = $uploadDir . $filename;
    
    if (!move_uploaded_file($file['tmp_name'], $filepath)) {
        sendError('Failed to save file', 500, 'UPLOAD_FAILED');
    }
    
    return '/' . $directory . '/' . $filename;
}

// Initialize error logging
if (APP_DEBUG) {
    ini_set('display_errors', 1);
    error_reporting(E_ALL);
} else {
    ini_set('display_errors', 0);
    error_reporting(0);
}

// Set timezone
date_default_timezone_set('Africa/Lagos');

?>
