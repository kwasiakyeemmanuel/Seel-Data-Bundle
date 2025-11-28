<?php
require_once(__DIR__ . '/../../config/session.php');

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $username = trim($data['username'] ?? '');
    $password = $data['password'] ?? '';
    
    if ($username === ADMIN_USERNAME && password_verify($password, ADMIN_PASSWORD)) {
        $_SESSION['is_admin'] = true;
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['user_name'] = 'Administrator';
        
        echo json_encode([
            'status' => 'success',
            'message' => 'Admin login successful'
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'Invalid credentials'
        ]);
    }
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid request method'
    ]);
}
?>
