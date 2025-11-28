<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: PUT');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'PUT' || $_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $order_id = intval($data['order_id'] ?? 0);
    $status = trim($data['status'] ?? '');
    
    $valid_statuses = ['pending', 'processing', 'completed', 'failed'];
    
    if (empty($order_id) || !in_array($status, $valid_statuses)) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Invalid order ID or status'
        ]);
        exit;
    }
    
    // Connect to database
    $conn = include(__DIR__ . '/../../config/database.php');
    
    // Update order status
    $stmt = $conn->prepare("UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
    $stmt->bind_param("si", $status, $order_id);
    
    if ($stmt->execute()) {
        echo json_encode([
            'status' => 'success',
            'message' => 'Order status updated successfully'
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'Failed to update order status'
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
