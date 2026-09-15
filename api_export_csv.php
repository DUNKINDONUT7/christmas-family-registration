<?php
session_start();
require 'config.php';

if (!isset($_SESSION['admin_id'])) {
    header('Location: admin_login.php');
    exit;
}

$query = "SELECT f.id, f.family_name, f.email, f.registered_at, 
          GROUP_CONCAT(fm.member_name SEPARATOR '; ') as members,
          COUNT(fm.id) as member_count
          FROM families f
          LEFT JOIN family_members fm ON f.id = fm.family_id
          WHERE f.status = 'approved'
          GROUP BY f.id
          ORDER BY f.registered_at DESC";

$result = $conn->query($query);

header('Content-Type: text/csv');
header('Content-Disposition: attachment; filename="families_export_' . date('Y-m-d_H-i-s') . '.csv"');

$output = fopen('php://output', 'w');

fputcsv($output, ['Family Name', 'Email', 'Number of Members', 'Member Names', 'Registered At']);

while ($row = $result->fetch_assoc()) {
    fputcsv($output, [
        $row['family_name'],
        $row['email'],
        $row['member_count'] ?? 0,
        $row['members'] ?? '',
        $row['registered_at']
    ]);
}

fclose($output);
exit;
?>
