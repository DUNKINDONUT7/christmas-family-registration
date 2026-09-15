<?php
session_start();
require 'config.php';

if (!isset($_SESSION['admin_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$family_id = $_POST['family_id'] ?? '';

$stmt = $conn->prepare("UPDATE families SET status = 'approved' WHERE id = ?");
$stmt->bind_param("i", $family_id);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Family approved']);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to approve family']);
}

$stmt->close();
?>
