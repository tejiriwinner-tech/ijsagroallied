<?php
// Database configuration - Update these values for your production database
define('DB_HOST', 'localhost');
define('DB_NAME', 'mv_agricultural_consult');
define('DB_USER', 'root');
define('DB_PASS', '');

// Paystack Configuration - Replace with your actual keys from Paystack Dashboard
define('PAYSTACK_SECRET_KEY', 'sk_test_your_secret_key_here');
define('PAYSTACK_PUBLIC_KEY', 'pk_test_your_public_key_here');



class Database
{
    private $conn;

    public function getConnection()
    {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME,
                DB_USER,
                DB_PASS,
                [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
            );
        } catch (PDOException $e) {
            echo json_encode(["error" => "Connection failed: " . $e->getMessage()]);
            exit;
        }

        return $this->conn;
    }
}
?>