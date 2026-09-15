<?php
session_start();
require 'config.php';

if (!isset($_SESSION['admin_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$title = $_POST['title'] ?? '';
$event_date = $_POST['date'] ?? '';
$event_time = $_POST['time'] ?? '';
$venue = $_POST['venue'] ?? '';
$dress_code = $_POST['dress_code'] ?? '';
$notes = $_POST['notes'] ?? '';
$program_lines = array_filter(explode("\n", $_POST['program'] ?? ''), function($item) {
    return trim($item) !== '';
});

$stmt = $conn->prepare("UPDATE itinerary SET title = ?, event_date = ?, event_time = ?, venue = ?, dress_code = ?, notes = ? LIMIT 1");
$stmt->bind_param("ssssss", $title, $event_date, $event_time, $venue, $dress_code, $notes);
$stmt->execute();
$stmt->close();

$conn->query("DELETE FROM program");

foreach ($program_lines as $index => $line) {
    $parts = explode(' - ', trim($line), 2);
    $time = trim($parts[0] ?? '');
    $activity = trim($parts[1] ?? trim($line));
    $order = $index + 1;
    
    $stmt = $conn->prepare("INSERT INTO program (time, activity, order_num) VALUES (?, ?, ?)");
    $stmt->bind_param("ssi", $time, $activity, $order);
    $stmt->execute();
    $stmt->close();
}

echo json_encode(['success' => true, 'message' => 'Itinerary saved']);
?>
