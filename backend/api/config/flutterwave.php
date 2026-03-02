<?php
require_once 'database.php';

class Flutterwave
{
    private $secret_key;

    public function __construct()
    {
        $this->secret_key = FLUTTERWAVE_SECRET_KEY;
    }

    /**
     * Initialize transaction
     */
    public function initializeTransaction($email, $amount, $callback_url, $metadata = [])
    {
        $url = "https://api.flutterwave.com/v3/payments";

        $fields = [
            'tx_ref' => uniqid('tx-'),
            'amount' => $amount,
            'currency' => 'NGN',
            'redirect_url' => $callback_url,
            'customer' => [
                'email' => $email,
            ],
            'meta' => $metadata,
            'customizations' => [
                'title' => 'MV Agricultural Consult',
                'description' => 'Payment for items in cart',
                'logo' => 'https://placeholder.svg'
            ]
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

        $response = json_decode($result, true);

        // Map Flutterwave response to the format expected by our frontend
        if (isset($response['status']) && $response['status'] === 'success') {
            return [
                'status' => true,
                'data' => [
                    'authorization_url' => $response['data']['link'],
                    'reference' => $fields['tx_ref']
                ]
            ];
        }

        return $response;
    }

    /**
     * Verify transaction
     */
    public function verifyTransaction($transaction_id)
    {
        // Note: Flutterwave verification usually uses the transaction ID from the redirect
        $url = "https://api.flutterwave.com/v3/transactions/" . $transaction_id . "/verify";

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

        $response = json_decode($result, true);

        // Map Flutterwave response to match Paystack-like response for minimal verify.php changes
        if (isset($response['status']) && $response['status'] === 'success') {
            return [
                'status' => true,
                'data' => [
                    'status' => $response['data']['status'], // 'successful'
                    'amount' => $response['data']['amount'],
                    'metadata' => $response['data']['meta']
                ]
            ];
        }

        return $response;
    }
}
?>