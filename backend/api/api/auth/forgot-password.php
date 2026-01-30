<?php
// Prevent any output before JSON
ob_start();

require_once __DIR__ . '/../../../config/cors.php';
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../config/email.php';

// Try to load PHPMailer if available
if (file_exists(__DIR__ . '/../../../vendor/autoload.php')) {
    require_once __DIR__ . '/../../../vendor/autoload.php';
}

// Clear any previous output
ob_clean();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "error" => "Method not allowed"]);
    exit;
}

try {
    $database = new Database();
    $pdo = $database->getConnection();

    $data = json_decode(file_get_contents("php://input"), true);

    $email = $data['email'] ?? '';

    if (empty($email)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Email is required"]);
        exit;
    }

    $email = filter_var($email, FILTER_VALIDATE_EMAIL);
    if (!$email) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Invalid email format"]);
        exit;
    }

    // Check if user exists
    $stmt = $pdo->prepare("SELECT id, name FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        // Don't reveal if email exists or not for security
        echo json_encode([
            "success" => true, 
            "message" => "If an account with that email exists, a password reset link has been sent."
        ]);
        exit;
    }

    // Check if password_resets table exists
    try {
        $stmt = $pdo->prepare("SHOW TABLES LIKE 'password_resets'");
        $stmt->execute();
        $tableExists = $stmt->fetch();
        
        if (!$tableExists) {
            // Create the table if it doesn't exist
            $createTableSQL = "
                CREATE TABLE password_resets (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id VARCHAR(50) NOT NULL,
                    email VARCHAR(255) NOT NULL,
                    token VARCHAR(64) NOT NULL UNIQUE,
                    expires_at DATETIME NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    INDEX idx_token (token),
                    INDEX idx_email (email),
                    INDEX idx_expires_at (expires_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            ";
            $pdo->exec($createTableSQL);
        }
    } catch (Exception $e) {
        error_log("Table check/creation error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Database table error: " . $e->getMessage()]);
        exit;
    }

    // Generate secure reset token
    $resetToken = bin2hex(random_bytes(32));
    $expiresAt = date('Y-m-d H:i:s', strtotime('+1 hour')); // Token expires in 1 hour

    // Store reset token in database
    try {
        $stmt = $pdo->prepare("
            INSERT INTO password_resets (user_id, email, token, expires_at, created_at) 
            VALUES (?, ?, ?, ?, NOW())
            ON DUPLICATE KEY UPDATE 
            token = VALUES(token), 
            expires_at = VALUES(expires_at), 
            created_at = NOW()
        ");
        $stmt->execute([$user['id'], $email, $resetToken, $expiresAt]);
    } catch (Exception $e) {
        error_log("Token storage error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Failed to store reset token: " . $e->getMessage()]);
        exit;
    }

    // Send password reset email
    $resetLink = "http://localhost:3000/reset-password?token=" . $resetToken;
    $subject = "Password Reset - IJS Agroallied";
    
    $htmlMessage = "
    <html>
    <head>
        <title>Password Reset</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2d5a27; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .button { display: inline-block; background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>IJS Agroallied</h1>
                <h2>Password Reset Request</h2>
            </div>
            <div class='content'>
                <p>Hello {$user['name']},</p>
                <p>You requested a password reset for your IJS Agroallied account.</p>
                <p>Click the button below to reset your password:</p>
                <p style='text-align: center;'>
                    <a href='{$resetLink}' class='button'>Reset Password</a>
                </p>
                <p>Or copy and paste this link in your browser:</p>
                <p style='word-break: break-all; background: #eee; padding: 10px; border-radius: 3px;'>{$resetLink}</p>
                <p><strong>This link will expire in 1 hour.</strong></p>
                <p>If you didn't request this reset, please ignore this email and your password will remain unchanged.</p>
            </div>
            <div class='footer'>
                <p>Best regards,<br>IJS Agroallied Team</p>
                <p>This is an automated message, please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
    ";
    
    $textMessage = "
    Password Reset - IJS Agroallied
    
    Hello {$user['name']},
    
    You requested a password reset for your IJS Agroallied account.
    
    Please visit this link to reset your password:
    {$resetLink}
    
    This link will expire in 1 hour.
    
    If you didn't request this reset, please ignore this email.
    
    Best regards,
    IJS Agroallied Team
    ";

    // Try to send email
    $emailSent = sendEmail($email, $subject, $htmlMessage, $textMessage);
    
    if ($emailSent) {
        echo json_encode([
            "success" => true, 
            "message" => "Password reset link has been sent to your email address."
        ]);
    } else {
        // If email fails, still return success but log the error
        error_log("Failed to send password reset email to: " . $email);
        echo json_encode([
            "success" => true, 
            "message" => "Password reset link has been sent to your email address.",
            "debug_reset_link" => $resetLink, // For development - remove in production
            "debug_note" => "Email sending failed, but token was created. Check console for reset link."
        ]);
    }

} catch (Exception $e) {
    error_log("Password reset error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "error" => "Server error: " . $e->getMessage()]);
}
?>