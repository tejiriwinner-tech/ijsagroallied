<?php
/**
 * Admin User Creation Utility
 * 
 * Production-ready utility for creating admin and regular users.
 * Can be run interactively or with command-line arguments.
 * 
 * Usage:
 *   Interactive mode:
 *     php scripts/create-admin.php
 * 
 *   Command-line mode:
 *     php scripts/create-admin.php --email=admin@example.com --password=SecurePass123 --name="Admin User" --role=admin
 *     php scripts/create-admin.php --email=user@example.com --password=UserPass123 --name="Regular User" --role=user
 * 
 *   Update existing user password:
 *     php scripts/create-admin.php --email=admin@example.com --password=NewPass123 --update
 */

require_once __DIR__ . '/../config/database.php';

// Color output helpers
function colorOutput($text, $color = 'default')
{
    $colors = [
        'red' => "\033[31m",
        'green' => "\033[32m",
        'yellow' => "\033[33m",
        'blue' => "\033[34m",
        'cyan' => "\033[36m",
        'reset' => "\033[0m"
    ];

    $colorCode = $colors[$color] ?? $colors['reset'];
    return $colorCode . $text . $colors['reset'];
}

function success($message)
{
    echo colorOutput("✅ " . $message, 'green') . "\n";
}

function error($message)
{
    echo colorOutput("❌ " . $message, 'red') . "\n";
}

function info($message)
{
    echo colorOutput("ℹ️  " . $message, 'blue') . "\n";
}

function warning($message)
{
    echo colorOutput("⚠️  " . $message, 'yellow') . "\n";
}

/**
 * Parse command-line arguments
 */
function parseArguments($argv)
{
    $args = [];
    foreach ($argv as $arg) {
        if (strpos($arg, '--') === 0) {
            $arg = substr($arg, 2);
            if (strpos($arg, '=') !== false) {
                list($key, $value) = explode('=', $arg, 2);
                $args[$key] = $value;
            } else {
                $args[$arg] = true;
            }
        }
    }
    return $args;
}

/**
 * Validate email format
 */
function validateEmail($email)
{
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Validate password strength
 */
function validatePassword($password)
{
    $errors = [];

    if (strlen($password) < 8) {
        $errors[] = "Password must be at least 8 characters long";
    }

    if (!preg_match('/[A-Z]/', $password)) {
        $errors[] = "Password must contain at least one uppercase letter";
    }

    if (!preg_match('/[a-z]/', $password)) {
        $errors[] = "Password must contain at least one lowercase letter";
    }

    if (!preg_match('/[0-9]/', $password)) {
        $errors[] = "Password must contain at least one number";
    }

    return $errors;
}

/**
 * Prompt user for input
 */
function prompt($message, $default = null)
{
    if ($default !== null) {
        echo $message . " [" . $default . "]: ";
    } else {
        echo $message . ": ";
    }

    $handle = fopen("php://stdin", "r");
    $line = trim(fgets($handle));
    fclose($handle);

    return empty($line) && $default !== null ? $default : $line;
}

/**
 * Prompt for password (hidden input)
 */
function promptPassword($message)
{
    echo $message . ": ";

    // Disable echo
    if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
        // Windows
        $password = stream_get_line(STDIN, 1024, PHP_EOL);
    } else {
        // Unix/Linux/Mac
        system('stty -echo');
        $password = trim(fgets(STDIN));
        system('stty echo');
    }

    echo "\n";
    return $password;
}

/**
 * Create or update user
 */
function createOrUpdateUser($db, $email, $password, $name, $role, $update = false)
{
    try {
        // Check if user exists
        $stmt = $db->prepare("SELECT id, name, role FROM users WHERE email = :email");
        $stmt->execute([':email' => $email]);
        $existingUser = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($existingUser && !$update) {
            warning("User already exists:");
            info("  ID: " . $existingUser['id']);
            info("  Name: " . $existingUser['name']);
            info("  Email: $email");
            info("  Role: " . $existingUser['role']);
            echo "\n";
            echo "Use --update flag to update the password.\n";
            return false;
        }

        // Hash the password
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

        if ($existingUser && $update) {
            // Update existing user
            $stmt = $db->prepare("
                UPDATE users 
                SET password = :password, name = :name, role = :role, updated_at = NOW() 
                WHERE email = :email
            ");

            $result = $stmt->execute([
                ':password' => $hashedPassword,
                ':name' => $name,
                ':role' => $role,
                ':email' => $email
            ]);

            if ($result) {
                success("User updated successfully!");
                info("  ID: " . $existingUser['id']);
                info("  Name: $name");
                info("  Email: $email");
                info("  Role: $role");
                info("  Password: Updated");
                return true;
            } else {
                error("Failed to update user");
                return false;
            }
        } else {
            // Create new user
            $userId = uniqid('user-');

            $stmt = $db->prepare("
                INSERT INTO users (id, name, email, password, role, created_at, updated_at) 
                VALUES (:id, :name, :email, :password, :role, NOW(), NOW())
            ");

            $result = $stmt->execute([
                ':id' => $userId,
                ':name' => $name,
                ':email' => $email,
                ':password' => $hashedPassword,
                ':role' => $role
            ]);

            if ($result) {
                success("User created successfully!");
                info("  ID: $userId");
                info("  Name: $name");
                info("  Email: $email");
                info("  Role: $role");
                return true;
            } else {
                error("Failed to create user");
                return false;
            }
        }
    } catch (PDOException $e) {
        error("Database error: " . $e->getMessage());
        return false;
    }
}

// Main execution
try {
    echo "\n";
    echo colorOutput("=================================", 'cyan') . "\n";
    echo colorOutput("  Admin User Creation Utility", 'cyan') . "\n";
    echo colorOutput("=================================", 'cyan') . "\n";
    echo "\n";

    // Parse command-line arguments
    $args = parseArguments($argv);

    // Determine if running in interactive or CLI mode
    $interactive = !isset($args['email']) || !isset($args['password']) || !isset($args['name']);

    if ($interactive) {
        info("Running in interactive mode...");
        echo "\n";

        // Get user input
        $email = prompt("Email address");
        $name = prompt("Full name");
        $role = prompt("Role (admin/user)", "admin");
        $password = promptPassword("Password");
        $confirmPassword = promptPassword("Confirm password");

        // Validate password confirmation
        if ($password !== $confirmPassword) {
            error("Passwords do not match!");
            exit(1);
        }

        $update = strtolower(prompt("Update if user exists? (yes/no)", "no")) === 'yes';
    } else {
        info("Running in command-line mode...");
        echo "\n";

        $email = $args['email'];
        $password = $args['password'];
        $name = $args['name'];
        $role = $args['role'] ?? 'admin';
        $update = isset($args['update']);
    }

    // Validate email
    if (!validateEmail($email)) {
        error("Invalid email address: $email");
        exit(1);
    }

    // Validate password strength
    $passwordErrors = validatePassword($password);
    if (!empty($passwordErrors)) {
        error("Password validation failed:");
        foreach ($passwordErrors as $err) {
            echo "  • $err\n";
        }
        exit(1);
    }

    // Validate role
    if (!in_array($role, ['admin', 'user'])) {
        error("Invalid role: $role (must be 'admin' or 'user')");
        exit(1);
    }

    // Connect to database
    $database = new Database();
    $db = $database->getConnection();

    // Create or update user
    $success = createOrUpdateUser($db, $email, $password, $name, $role, $update);

    if ($success) {
        echo "\n";
        success("Operation completed successfully!");
        exit(0);
    } else {
        exit(1);
    }

} catch (Exception $e) {
    error("Error: " . $e->getMessage());
    exit(1);
}
?>