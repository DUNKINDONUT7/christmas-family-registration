<?php
session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: admin_login.php');
    exit;
}

$username = $_POST['username'] ?? '';
$password = $_POST['password'] ?? '';

// Simple hardcoded admin credentials (can be moved to config file)
$ADMIN_USERNAME = 'admin';
$ADMIN_PASSWORD = 'admin123';

if ($username === $ADMIN_USERNAME && $password === $ADMIN_PASSWORD) {
    $_SESSION['admin_id'] = 'admin_' . time();
    $_SESSION['admin_name'] = 'Host Administrator';
    header('Location: admin_dashboard.php');
    exit;
}

$_SESSION['error'] = 'Invalid credentials';
header('Location: admin_login.php');
exit;
