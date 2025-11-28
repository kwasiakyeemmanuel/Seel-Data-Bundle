<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $email_or_phone = trim($data['email'] ?? '');
    $password = $data['password'] ?? '';
    
    // Validate input
    if (empty($email_or_phone) || empty($password)) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Email/phone and password are required'
        ]);
        exit;
    }
    
    // Connect to database
    $conn = include(__DIR__ . '/config_database.php');
    
    // Check if user exists by email or phone
    $stmt = $conn->prepare("SELECT id, name, email, phone, password FROM users WHERE email = ? OR phone = ?");
    $stmt->bind_param("ss", $email_or_phone, $email_or_phone);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Invalid email/phone or password'
        ]);
        $stmt->close();
        $conn->close();
        exit;
    }
    
    $user = $result->fetch_assoc();
    $stmt->close();
    
    // Verify password
    if (password_verify($password, $user['password'])) {
        // Remove password from response
        unset($user['password']);
        
        echo json_encode([
            'status' => 'success',
            'message' => 'Login successful',
            'user' => $user
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'Invalid email/phone or password'
        ]);
    }
    
    $conn->close();
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid request method'
    ]);
}
?>
