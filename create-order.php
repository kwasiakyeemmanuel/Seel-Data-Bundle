<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $user_id = intval($data['user_id'] ?? 0);
    $service_name = trim($data['service_name'] ?? '');
    $phone_number = trim($data['phone_number'] ?? '');
    $bundle_size = trim($data['bundle_size'] ?? '');
    $payment_method = trim($data['payment_method'] ?? '');
    $email = trim($data['email'] ?? '');
    $payment_reference = trim($data['payment_reference'] ?? '');
    
    // Validate input
    if (empty($user_id) || empty($service_name) || empty($phone_number) || empty($bundle_size) || empty($payment_method)) {
        echo json_encode([
            'status' => 'error',
            'message' => 'All required fields must be filled'
        ]);
        exit;
    }
    
    // Connect to database
    $conn = include(__DIR__ . '/config_database.php');
    
    // Verify user exists
    $stmt = $conn->prepare("SELECT id FROM users WHERE id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Invalid user'
        ]);
        $stmt->close();
        $conn->close();
        exit;
    }
    $stmt->close();
    
    // Insert order
    $stmt = $conn->prepare("INSERT INTO orders (user_id, service_name, phone_number, bundle_size, payment_method, email, payment_reference, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')");
    $stmt->bind_param("issssss", $user_id, $service_name, $phone_number, $bundle_size, $payment_method, $email, $payment_reference);
    
    if ($stmt->execute()) {
        $order_id = $stmt->insert_id;
        
        echo json_encode([
            'status' => 'success',
            'message' => 'Order created successfully',
            'order_id' => $order_id
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'Failed to create order'
        ]);
    }
    
    $stmt->close();
    $conn->close();
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid request method'
    ]);
}
?>
