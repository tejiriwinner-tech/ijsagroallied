<?php
require_once '../config/database.php';

try {
    $pdo = getConnection();
    
    // Create password_resets table
    $sql = "
    CREATE TABLE IF NOT EXISTS password_resets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        email VARCHAR(255) NOT NULL,
        token VARCHAR(64) NOT NULL UNIQUE,
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_token (token),
        INDEX idx_email (email),
        INDEX idx_expires_at (expires_at)
    )";
    
    $pdo->exec($sql);
    
    echo "✅ Password reset table created successfully!\n";
    echo "📧 Password reset functionality is now ready to use.\n";
    echo "\n";
    echo "📝 Next steps:\n";
    echo "1. Configure your server's email settings (SMTP)\n";
    echo "2. Update the email sender address in the PHP files\n";
    echo "3. Test the forgot password functionality\n";
    
} catch (Exception $e) {
    echo "❌ Error creating password reset table: " . $e->getMessage() . "\n";
}
?>