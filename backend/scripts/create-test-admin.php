<?php
/**
 * Create Test Admin User Script
 * 
 * This script creates a test admin user for integration testing.
 * Run this script before running property-based tests.
 * 
 * Usage: php create-test-admin.php
 */

require_once __DIR__ . '/../config/database.php';

try {
    // Connect to database
    $database = new Database();
    $db = $database->getConnection();
    
    // Test admin user credentials
    $email = 'admin@test.com';
    $password = 'admin123';
    $name = 'Test Admin';
    $role = 'admin';
    
    // Hash the password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
    // Check if user already exists
    $stmt = $db->prepare("SELECT id FROM users WHERE email = :email");
    $stmt->execute([':email' => $email]);
    $existingUser = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($existingUser) {
        echo "✅ Test admin user already exists with ID: " . $existingUser['id'] . "\n";
        echo "📧 Email: $email\n";
        echo "🔑 Password: $password\n";
        echo "👤 Role: $role\n";
        exit(0);
    }
    
    // Create the test admin user
    $stmt = $db->prepare("
        INSERT INTO users (name, email, password, role, created_at, updated_at) 
        VALUES (:name, :email, :password, :role, NOW(), NOW())
    ");
    
    $result = $stmt->execute([
        ':name' => $name,
        ':email' => $email,
        ':password' => $hashedPassword,
        ':role' => $role
    ]);
    
    if ($result) {
        $userId = $db->lastInsertId();
        echo "✅ Test admin user created successfully!\n";
        echo "🆔 User ID: $userId\n";
        echo "📧 Email: $email\n";
        echo "🔑 Password: $password\n";
        echo "👤 Role: $role\n";
        echo "\n";
        echo "🧪 You can now run integration tests with:\n";
        echo "TEST_INTEGRATION=true npm test -- --testPathPattern=category-deletion\n";
    } else {
        echo "❌ Failed to create test admin user\n";
        exit(1);
    }
    
} catch (PDOException $e) {
    echo "❌ Database error: " . $e->getMessage() . "\n";
    exit(1);
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>