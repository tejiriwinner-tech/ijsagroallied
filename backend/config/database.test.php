<?php
// Test Database configuration
// This configuration is used for integration tests
// It should point to a separate test database to avoid affecting production data

define('TEST_DB_HOST', getenv('TEST_DB_HOST') ?: 'localhost');
define('TEST_DB_NAME', getenv('TEST_DB_NAME') ?: 'mv_agricultural_consult_test');
define('TEST_DB_USER', getenv('TEST_DB_USER') ?: 'root');
define('TEST_DB_PASS', getenv('TEST_DB_PASS') ?: '');

class TestDatabase
{
    private $conn;

    public function getConnection()
    {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                "mysql:host=" . TEST_DB_HOST . ";dbname=" . TEST_DB_NAME,
                TEST_DB_USER,
                TEST_DB_PASS,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
                ]
            );
        } catch (PDOException $e) {
            throw new Exception("Test database connection failed: " . $e->getMessage());
        }

        return $this->conn;
    }

    /**
     * Clean all data from test database tables
     * Use this before each test to ensure a clean state
     */
    public function cleanDatabase()
    {
        try {
            $this->conn->exec('SET FOREIGN_KEY_CHECKS = 0');

            // Clean tables in reverse order of dependencies
            $tables = [
                'order_items',
                'orders',
                'products',
                'subcategories',
                'categories',
                'users'
            ];

            foreach ($tables as $table) {
                $this->conn->exec("TRUNCATE TABLE $table");
            }

            $this->conn->exec('SET FOREIGN_KEY_CHECKS = 1');
        } catch (PDOException $e) {
            throw new Exception("Failed to clean test database: " . $e->getMessage());
        }
    }

    /**
     * Reset auto-increment counters for all tables
     */
    public function resetAutoIncrement()
    {
        try {
            $tables = [
                'users',
                'categories',
                'subcategories',
                'products',
                'orders',
                'order_items'
            ];

            foreach ($tables as $table) {
                $this->conn->exec("ALTER TABLE $table AUTO_INCREMENT = 1");
            }
        } catch (PDOException $e) {
            throw new Exception("Failed to reset auto-increment: " . $e->getMessage());
        }
    }
}
?>