<?php
require_once(__DIR__ . '/../../config/session.php');

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
    echo json_encode([
        'status' => 'success',
        'is_admin' => true
    ]);
} else {
    echo json_encode([
        'status' => 'error',
        'is_admin' => false
    ]);
}
?>
