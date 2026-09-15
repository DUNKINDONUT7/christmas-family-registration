<?php
session_start();
require 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: register.php');
    exit;
}

$family_name = trim($_POST['family_name'] ?? '');
$email = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';
$color_theme = $_POST['color_theme'] ?? 'christmas-red';
$members = $_POST['members'] ?? [];

if (empty($family_name) || empty($email) || empty($password) || count($members) === 0) {
    $_SESSION['error'] = 'All fields are required';
    header('Location: register.php');
    exit;
}

if (strlen($password) < 6) {
    $_SESSION['error'] = 'Password must be at least 6 characters';
    header('Location: register.php');
    exit;
}

$stmt = $conn->prepare("SELECT id FROM families WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $_SESSION['error'] = 'Email already registered';
    header('Location: register.php');
    exit;
}

$gift_ticket = generateGiftTicket($conn);

$family_id = uniqid('fam_');
$hashed_password = password_hash($password, PASSWORD_DEFAULT);
$status = 'pending';

$stmt = $conn->prepare("INSERT INTO families (family_id, family_name, email, password, status, color_theme, gift_ticket) VALUES (?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("sssssss", $family_id, $family_name, $email, $hashed_password, $status, $color_theme, $gift_ticket);

if ($stmt->execute()) {
    $family_db_id = $conn->insert_id;
    
    foreach (array_filter($members) as $member_name) {
        $stmt_member = $conn->prepare("INSERT INTO family_members (family_id, member_name) VALUES (?, ?)");
        $stmt_member->bind_param("is", $family_db_id, $member_name);
        $stmt_member->execute();
    }
    
    $_SESSION['success'] = 'Registration successful! Your Gift Ticket: ' . $gift_ticket;
    $_SESSION['gift_ticket'] = $gift_ticket;
    $_SESSION['family_name'] = $family_name;
    header('Location: registration_success.php');
} else {
    $_SESSION['error'] = 'Registration failed. Please try again.';
    header('Location: register.php');
}

$stmt->close();

function generateGiftTicket($conn) {
    $prefixes = ['XMAS', 'BELL', 'JOY', 'NOEL', 'HOLLY', 'STAR', 'CAROLE'];
    $year = date('Y');
    
    do {
        $prefix = $prefixes[array_rand($prefixes)];
        $number = str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
        $ticket = $prefix . '-' . $year . '-' . $number;
        
        $check = $conn->query("SELECT gift_ticket FROM families WHERE gift_ticket = '$ticket'");
    } while ($check->num_rows > 0);
    
    return $ticket;
}
?>
