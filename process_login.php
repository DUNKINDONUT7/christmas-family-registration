<?php
session_start();
require 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: login.php');
    exit;
}

$email = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';

$stmt = $conn->prepare("SELECT id, family_id, family_name, password, status FROM families WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    $_SESSION['error'] = 'Invalid email or password';
    header('Location: login.php');
    exit;
}

$family = $result->fetch_assoc();

if (!password_verify($password, $family['password'])) {
    $_SESSION['error'] = 'Invalid email or password';
    header('Location: login.php');
    exit;
}

if ($family['status'] !== 'approved') {
    $_SESSION['error'] = 'Your registration is still pending approval';
    header('Location: login.php');
    exit;
}

$_SESSION['user_id'] = $family['id'];
$_SESSION['user_family_id'] = $family['family_id'];
$_SESSION['family_name'] = $family['family_name'];
$_SESSION['email'] = $email;

$stmt->close();
header('Location: user_dashboard.php');
exit;
?>
