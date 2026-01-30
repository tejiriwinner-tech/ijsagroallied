<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$response = array();
$upload_dir = '../../../../frontend/public/uploads/';

// Create upload directory if it doesn't exist
if (!file_exists($upload_dir)) {
    mkdir($upload_dir, 0777, true);
}

if (isset($_FILES['image'])) {
    $file_name = $_FILES['image']['name'];
    $file_size = $_FILES['image']['size'];
    $file_tmp = $_FILES['image']['tmp_name'];
    $file_type = $_FILES['image']['type'];
    $file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));

    $extensions = array("jpeg", "jpg", "png", "webp");

    if (in_array($file_ext, $extensions) === false) {
        $response['success'] = false;
        $response['error'] = "Extension not allowed, please choose a JPEG, JPG, PNG, or WEBP file.";
        echo json_encode($response);
        exit();
    }

    if ($file_size > 5242880) { // 5MB
        $response['success'] = false;
        $response['error'] = "File size must be less than 5MB";
        echo json_encode($response);
        exit();
    }

    // Generate unique filename to prevent overwrites
    $unique_name = uniqid() . '.' . $file_ext;
    $target_file = $upload_dir . $unique_name;

    if (move_uploaded_file($file_tmp, $target_file)) {
        $response['success'] = true;
        $response['message'] = "File uploaded successfully";
        // Return the path relative to the public directory for the frontend to use
        $response['data'] = array('url' => "/uploads/" . $unique_name);
    } else {
        $response['success'] = false;
        $response['error'] = "Failed to move uploaded file";
    }
} else {
    $response['success'] = false;
    $response['error'] = "No image file received";
}

echo json_encode($response);
?>