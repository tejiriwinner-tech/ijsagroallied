<?php
require_once 'database.php';

class Paystack
{
    private $secret_key;

    public function __construct()
    {
        $this->secret_key = PAYSTACK_SECRET_KEY;
    }

    /**
     * Initialize transaction
     */
    public function initializeTransaction($email, $amount, $callback_url, $metadata = [])
    {
        $url = "https://api.paystack.co/transaction/initialize";

        $fields = [
            'email' => $email,
            'amount' => $amount * 100, // Paystack expects amount in kobo
            'callback_url' => $callback_url,
            'metadata' => $metadata
        ];

        $fields_string = json_encode($fields);

        $ch = curl_init();

        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $fields_string);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array(
            "Authorization: Bearer " . $this->secret_key,
            "Cache-Control: no-cache",
            "Content-Type: application/json"
        ));

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $result = curl_exec($ch);
        $err = curl_error($ch);
        curl_close($ch);

        if ($err) {
            return ["success" => false, "message" => "Curl Error: " . $err];
        }

        return json_decode($result, true);
    }

    /**
     * Verify transaction
     */
    public function verifyTransaction($reference)
    {
        $url = "https://api.paystack.co/transaction/verify/" . rawurlencode($reference);

        $ch = curl_init();

        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array(
            "Authorization: Bearer " . $this->secret_key,
            "Cache-Control: no-cache",
        ));

        $result = curl_exec($ch);
        $err = curl_error($ch);
        curl_close($ch);

        if ($err) {
            return ["success" => false, "message" => "Curl Error: " . $err];
        }

        return json_decode($result, true);
    }
}
?>