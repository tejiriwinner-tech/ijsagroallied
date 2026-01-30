<?php
/**
 * API Testing Utility
 * 
 * Unified testing utility for all backend API endpoints.
 * Automatically handles authentication and provides detailed test results.
 * 
 * Usage:
 *   Test all endpoints:
 *     php scripts/api-tester.php --all
 * 
 *   Test specific modules:
 *     php scripts/api-tester.php --module=auth
 *     php scripts/api-tester.php --module=categories
 *     php scripts/api-tester.php --module=subcategories
 *     php scripts/api-tester.php --module=products
 *     php scripts/api-tester.php --module=bookings
 *     php scripts/api-tester.php --module=payments
 * 
 *   Custom base URL:
 *     php scripts/api-tester.php --all --url=http://localhost:8080
 */

// Configuration
$baseUrl = 'http://localhost:8000';
$adminEmail = 'admin@ijs.com';
$adminPassword = 'admin123';

// Test results tracking
$testResults = [
    'passed' => 0,
    'failed' => 0,
    'total' => 0,
    'details' => []
];

// Color output helpers
function colorText($text, $color)
{
    $colors = [
        'red' => "\033[31m",
        'green' => "\033[32m",
        'yellow' => "\033[33m",
        'blue' => "\033[34m",
        'cyan' => "\033[36m",
        'magenta' => "\033[35m",
        'reset' => "\033[0m"
    ];

    $colorCode = $colors[$color] ?? $colors['reset'];
    return $colorCode . $text . $colors['reset'];
}

/**
 * Make HTTP request
 */
function makeRequest($url, $method = 'GET', $data = null, $token = null)
{
    $ch = curl_init();

    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HEADER, false);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

    // Set headers
    $headers = [
        'Content-Type: application/json',
        'Accept: application/json'
    ];

    if ($token) {
        $headers[] = 'Authorization: Bearer ' . $token;
    }

    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    // Set method and data
    switch (strtoupper($method)) {
        case 'POST':
            curl_setopt($ch, CURLOPT_POST, true);
            if ($data) {
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            }
            break;
        case 'PUT':
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
            if ($data) {
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            }
            break;
        case 'DELETE':
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
            if ($data) {
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            }
            break;
    }

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);

    curl_close($ch);

    if ($error) {
        return [
            'success' => false,
            'error' => $error,
            'code' => 0,
            'body' => null
        ];
    }

    return [
        'success' => true,
        'code' => $httpCode,
        'body' => json_decode($response, true)
    ];
}

/**
 * Run a test and record results
 */
function runTest($name, $expectedCode, $actualCode, $details = '')
{
    global $testResults;

    $testResults['total']++;
    $passed = ($expectedCode === $actualCode);

    if ($passed) {
        $testResults['passed']++;
        echo colorText("✓", 'green') . " $name ";
        echo colorText("(Expected: $expectedCode, Got: $actualCode)", 'cyan') . "\n";
    } else {
        $testResults['failed']++;
        echo colorText("✗", 'red') . " $name ";
        echo colorText("(Expected: $expectedCode, Got: $actualCode)", 'yellow') . "\n";
        if ($details) {
            echo "  " . colorText($details, 'yellow') . "\n";
        }
    }

    $testResults['details'][] = [
        'name' => $name,
        'passed' => $passed,
        'expected' => $expectedCode,
        'actual' => $actualCode,
        'details' => $details
    ];
}

/**
 * Print section header
 */
function printSection($title)
{
    echo "\n";
    echo colorText("═══════════════════════════════════════════", 'cyan') . "\n";
    echo colorText("  $title", 'cyan') . "\n";
    echo colorText("═══════════════════════════════════════════", 'cyan') . "\n";
    echo "\n";
}

/**
 * Login and get admin token
 */
function loginAdmin($baseUrl, $email, $password)
{
    echo colorText("Logging in as admin...", 'blue') . "\n";

    $result = makeRequest($baseUrl . '/api/api/auth/login.php', 'POST', [
        'email' => $email,
        'password' => $password
    ]);

    if ($result['success'] && $result['code'] === 200 && isset($result['body']['data']['token'])) {
        echo colorText("✓ Successfully logged in", 'green') . "\n";
        return $result['body']['data']['token'];
    }

    echo colorText("✗ Failed to login", 'red') . "\n";
    if (isset($result['body']['message'])) {
        echo "  Error: " . $result['body']['message'] . "\n";
    }
    return null;
}

/**
 * Test Authentication Endpoints
 */
function testAuth($baseUrl)
{
    printSection("Testing Authentication Endpoints");

    // Test 1: Valid login
    $result = makeRequest($baseUrl . '/api/api/auth/login.php', 'POST', [
        'email' => 'admin@ijs.com',
        'password' => 'admin123'
    ]);
    runTest("Valid login", 200, $result['code']);

    // Test 2: Invalid credentials
    $result = makeRequest($baseUrl . '/api/api/auth/login.php', 'POST', [
        'email' => 'admin@ijs.com',
        'password' => 'wrongpassword'
    ]);
    runTest("Invalid credentials", 401, $result['code']);

    // Test 3: Missing fields
    $result = makeRequest($baseUrl . '/api/api/auth/login.php', 'POST', [
        'email' => 'admin@ijs.com'
    ]);
    runTest("Missing password field", 422, $result['code']);
}

/**
 * Test Category Endpoints
 */
function testCategories($baseUrl, $token)
{
    printSection("Testing Category Endpoints");

    // Test 1: List categories
    $result = makeRequest($baseUrl . '/api/api/categories/list.php', 'GET', null, $token);
    runTest("List categories", 200, $result['code']);

    // Test 2: Create valid category
    $testSlug = 'test-category-' . time();
    $result = makeRequest($baseUrl . '/api/api/categories/create.php', 'POST', [
        'name' => 'Test Category',
        'slug' => $testSlug,
        'description' => 'Test category description'
    ], $token);
    runTest("Create valid category", 201, $result['code']);

    $createdCategoryId = null;
    if ($result['code'] === 201 && isset($result['body']['data']['id'])) {
        $createdCategoryId = $result['body']['data']['id'];
    }

    // Test 3: Create category with missing name
    $result = makeRequest($baseUrl . '/api/api/categories/create.php', 'POST', [
        'slug' => 'test-no-name'
    ], $token);
    runTest("Create category without name", 422, $result['code']);

    // Test 4: Create category with invalid slug
    $result = makeRequest($baseUrl . '/api/api/categories/create.php', 'POST', [
        'name' => 'Test Category',
        'slug' => 'Invalid Slug With Spaces'
    ], $token);
    runTest("Create category with invalid slug", 422, $result['code']);

    // Test 5: Update category
    if ($createdCategoryId) {
        $result = makeRequest($baseUrl . '/api/api/categories/update.php', 'PUT', [
            'id' => $createdCategoryId,
            'name' => 'Updated Test Category',
            'slug' => $testSlug,
            'description' => 'Updated description'
        ], $token);
        runTest("Update category", 200, $result['code']);
    }

    // Test 6: Check products for category
    if ($createdCategoryId) {
        $result = makeRequest($baseUrl . '/api/api/categories/check-products.php?id=' . $createdCategoryId, 'GET', null, $token);
        runTest("Check products for category", 200, $result['code']);
    }

    // Test 7: Delete category
    if ($createdCategoryId) {
        $result = makeRequest($baseUrl . '/api/api/categories/delete.php', 'DELETE', [
            'id' => $createdCategoryId
        ], $token);
        runTest("Delete category", 200, $result['code']);
    }

    // Test 8: Delete non-existent category
    $result = makeRequest($baseUrl . '/api/api/categories/delete.php', 'DELETE', [
        'id' => 'non-existent-category'
    ], $token);
    runTest("Delete non-existent category", 404, $result['code']);
}

/**
 * Test Subcategory Endpoints
 */
function testSubcategories($baseUrl, $token)
{
    printSection("Testing Subcategory Endpoints");

    // Test 1: Create valid subcategory
    $testSlug = 'test-subcategory-' . time();
    $result = makeRequest($baseUrl . '/api/api/subcategories/create.php', 'POST', [
        'category_id' => 'chicken-feeds',
        'name' => 'Test Subcategory',
        'slug' => $testSlug
    ], $token);
    runTest("Create valid subcategory", 201, $result['code']);

    $createdSubcategoryId = null;
    if ($result['code'] === 201 && isset($result['body']['data']['id'])) {
        $createdSubcategoryId = $result['body']['data']['id'];
    }

    // Test 2: Create subcategory with missing name
    $result = makeRequest($baseUrl . '/api/api/subcategories/create.php', 'POST', [
        'category_id' => 'chicken-feeds',
        'slug' => 'test-no-name'
    ], $token);
    runTest("Create subcategory without name", 422, $result['code']);

    // Test 3: Create subcategory with invalid parent
    $result = makeRequest($baseUrl . '/api/api/subcategories/create.php', 'POST', [
        'category_id' => 'non-existent-category',
        'name' => 'Test Subcategory',
        'slug' => 'test-invalid-parent'
    ], $token);
    runTest("Create subcategory with invalid parent", 422, $result['code']);

    // Test 4: Update subcategory
    if ($createdSubcategoryId) {
        $result = makeRequest($baseUrl . '/api/api/subcategories/update.php', 'PUT', [
            'id' => $createdSubcategoryId,
            'category_id' => 'chicken-feeds',
            'name' => 'Updated Test Subcategory',
            'slug' => $testSlug
        ], $token);
        runTest("Update subcategory", 200, $result['code']);
    }

    // Test 5: Delete subcategory
    if ($createdSubcategoryId) {
        $result = makeRequest($baseUrl . '/api/api/subcategories/delete.php', 'DELETE', [
            'id' => $createdSubcategoryId
        ], $token);
        runTest("Delete subcategory", 200, $result['code']);
    }
}

/**
 * Test Product Endpoints
 */
function testProducts($baseUrl, $token)
{
    printSection("Testing Product Endpoints");

    // Test 1: List products
    $result = makeRequest($baseUrl . '/api/api/products/list.php', 'GET', null, $token);
    runTest("List products", 200, $result['code']);

    // Test 2: Get products by category
    $result = makeRequest($baseUrl . '/api/api/products/list.php?category=chicken-feeds', 'GET', null, $token);
    runTest("Get products by category", 200, $result['code']);
}

/**
 * Print test summary
 */
function printSummary()
{
    global $testResults;

    echo "\n";
    echo colorText("═══════════════════════════════════════════", 'magenta') . "\n";
    echo colorText("  TEST SUMMARY", 'magenta') . "\n";
    echo colorText("═══════════════════════════════════════════", 'magenta') . "\n";
    echo "\n";

    echo "Total Tests: " . colorText($testResults['total'], 'cyan') . "\n";
    echo "Passed: " . colorText($testResults['passed'], 'green') . "\n";
    echo "Failed: " . colorText($testResults['failed'], 'red') . "\n";

    $passRate = $testResults['total'] > 0
        ? round(($testResults['passed'] / $testResults['total']) * 100, 2)
        : 0;

    echo "Pass Rate: " . colorText($passRate . "%", $passRate >= 80 ? 'green' : 'yellow') . "\n";
    echo "\n";

    if ($testResults['failed'] > 0) {
        echo colorText("Failed Tests:", 'red') . "\n";
        foreach ($testResults['details'] as $test) {
            if (!$test['passed']) {
                echo "  • " . $test['name'] . "\n";
                if ($test['details']) {
                    echo "    " . $test['details'] . "\n";
                }
            }
        }
        echo "\n";
    }
}

// Main execution
try {
    // Parse command-line arguments
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

    // Override base URL if provided
    if (isset($args['url'])) {
        $baseUrl = rtrim($args['url'], '/');
    }

    // Display header
    echo "\n";
    echo colorText("═══════════════════════════════════════════", 'cyan') . "\n";
    echo colorText("  API Testing Utility", 'cyan') . "\n";
    echo colorText("  Base URL: $baseUrl", 'cyan') . "\n";
    echo colorText("═══════════════════════════════════════════", 'cyan') . "\n";

    // Login as admin
    $adminToken = loginAdmin($baseUrl, $adminEmail, $adminPassword);

    if (!$adminToken) {
        echo "\n";
        echo colorText("Failed to login. Please ensure:", 'red') . "\n";
        echo "  1. Backend server is running on $baseUrl\n";
        echo "  2. Admin user exists with email: $adminEmail\n";
        echo "  3. Admin password is: $adminPassword\n";
        echo "\n";
        exit(1);
    }

    // Determine which tests to run
    $runAll = isset($args['all']);
    $module = $args['module'] ?? null;

    if (!$runAll && !$module) {
        echo "\n";
        echo colorText("Usage:", 'yellow') . "\n";
        echo "  php scripts/api-tester.php --all\n";
        echo "  php scripts/api-tester.php --module=auth\n";
        echo "  php scripts/api-tester.php --module=categories\n";
        echo "  php scripts/api-tester.php --module=subcategories\n";
        echo "  php scripts/api-tester.php --module=products\n";
        echo "\n";
        exit(0);
    }

    // Run tests
    if ($runAll || $module === 'auth') {
        testAuth($baseUrl);
    }

    if ($runAll || $module === 'categories') {
        testCategories($baseUrl, $adminToken);
    }

    if ($runAll || $module === 'subcategories') {
        testSubcategories($baseUrl, $adminToken);
    }

    if ($runAll || $module === 'products') {
        testProducts($baseUrl, $adminToken);
    }

    // Print summary
    printSummary();

    // Exit with appropriate code
    exit($testResults['failed'] > 0 ? 1 : 0);

} catch (Exception $e) {
    echo colorText("Error: " . $e->getMessage(), 'red') . "\n";
    exit(1);
}
?>