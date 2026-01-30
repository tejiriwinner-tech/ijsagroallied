<?php
// Database configuration - Update these values for your production database
define('DB_HOST', 'localhost');
define('DB_NAME', 'ijs_agroallied');
define('DB_USER', 'root');
define('DB_PASS', '');

// Paystack Configuration - Replace with your actual keys from Paystack Dashboard
define('PAYSTACK_SECRET_KEY', 'sk_test_your_secret_key_here');
define('PAYSTACK_PUBLIC_KEY', 'pk_test_your_public_key_here');

// Flutterwave Configuration - Replace with your actual keys from Flutterwave Dashboard
define('FLUTTERWAVE_SECRET_KEY', 'FLWSECK_TEST-d7eb6f0594a9e5bd786c2622e08a4f4a-X');
define('FLUTTERWAVE_PUBLIC_KEY', 'FLWPUBK_TEST-5d018d22b4c61a682c70242f76109ba5-X');
define('FLUTTERWAVE_ENCRYPTION_KEY', 'FLWSECK_TEST51b0bd9d7de0');

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