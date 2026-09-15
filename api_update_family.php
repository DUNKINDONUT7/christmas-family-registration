<?php
session_start();
require 'config.php';

if (!isset($_SESSION['admin_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$family_id = $_POST['family_id'] ?? '';
$family_name = trim($_POST['family_name'] ?? '');
$members = $_POST['members'] ?? [];

$stmt = $conn->prepare("UPDATE families SET family_name = ? WHERE id = ?");
$stmt->bind_param("si", $family_name, $family_id);
$stmt->execute();
$stmt->close();

$stmt = $conn->prepare("DELETE FROM family_members WHERE family_id = ?");
$stmt->bind_param("i", $family_id);
$stmt->execute();
$stmt->close();

foreach (array_filter($members) as $member_name) {
    $stmt = $conn->prepare("INSERT INTO family_members (family_id, member_name) VALUES (?, ?)");
    $stmt->bind_param("is", $family_id, $member_name);
    $stmt->execute();
    $stmt->close();
}

echo json_encode(['success' => true, 'message' => 'Family updated']);
?>
