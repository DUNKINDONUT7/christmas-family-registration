<?php
session_start();
require 'config.php';

if (!isset($_SESSION['admin_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$family_id = $_POST['family_id'] ?? '';

$stmt = $conn->prepare("DELETE FROM family_members WHERE family_id = ?");
$stmt->bind_param("i", $family_id);
$stmt->execute();
$stmt->close();

$stmt = $conn->prepare("DELETE FROM families WHERE id = ?");
$stmt->bind_param("i", $family_id);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Family deleted']);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to delete family']);
}

$stmt->close();
?>
