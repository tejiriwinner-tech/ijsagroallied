<?php
/**
 * Generate Password Hash
 * 
 * This script generates a bcrypt password hash for testing purposes
 */

$password = 'admin123';
$hash = password_hash($password, PASSWORD_BCRYPT);

echo "Password: $password\n";
echo "Hash: $hash\n";
echo "\nSQL Statement:\n";
echo "INSERT INTO users (name, email, password, role, created_at) VALUES\n";
echo "('Test Admin', 'admin@test.com', '$hash', 'admin', NOW());\n";
?>
