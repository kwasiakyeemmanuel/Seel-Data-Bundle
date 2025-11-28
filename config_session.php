<?php
// Session management functions
session_start();

// Set session timeout (30 minutes)
$timeout_duration = 1800;

// Check if session has expired
if (isset($_SESSION['LAST_ACTIVITY']) && (time() - $_SESSION['LAST_ACTIVITY']) > $timeout_duration) {
    session_unset();
    session_destroy();
    session_start();
}

$_SESSION['LAST_ACTIVITY'] = time();

// Admin credentials (in production, use database)
define('ADMIN_USERNAME', 'admin');
define('ADMIN_PASSWORD', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'); // password: password

function isLoggedIn() {
    return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
}

function isAdmin() {
    return isset($_SESSION['is_admin']) && $_SESSION['is_admin'] === true;
}

function requireLogin() {
    if (!isLoggedIn()) {
        http_response_code(401);
        echo json_encode([
            'status' => 'error',
            'message' => 'Authentication required'
        ]);
        exit;
    }
}

function requireAdmin() {
    if (!isAdmin()) {
        http_response_code(403);
        echo json_encode([
            'status' => 'error',
            'message' => 'Admin access required'
        ]);
        exit;
    }
}

function getUserId() {
    return $_SESSION['user_id'] ?? null;
}

function setUserSession($user) {
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_email'] = $user['email'];
    $_SESSION['user_name'] = $user['name'];
    $_SESSION['is_admin'] = isset($user['is_admin']) ? $user['is_admin'] : false;
}

function clearUserSession() {
    session_unset();
    session_destroy();
}
?>
