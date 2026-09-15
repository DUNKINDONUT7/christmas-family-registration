<?php
// Start session and check if user is already logged in
session_start();

// Redirect based on user type
if (isset($_SESSION['user_id'])) {
    header('Location: user_dashboard.php');
    exit;
}
if (isset($_SESSION['admin_id'])) {
    header('Location: admin_dashboard.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Christmas Family Registration</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <div class="hero-section">
            <div class="snowflake">❄️</div>
            <div class="snowflake" style="left: 80%; animation-delay: 2s;">❄️</div>
            <div class="snowflake" style="left: 20%; animation-delay: 4s;">❄️</div>
            
            <h1>Christmas Family Registration</h1>
            <p class="subtitle">Join us for a festive celebration! 🎄</p>
            
            <div class="button-group">
                <a href="register.php" class="btn btn-primary">New Family Registration</a>
                <a href="login.php" class="btn btn-secondary">Family Login</a>
                <a href="admin_login.php" class="btn btn-admin">Host Login</a>
            </div>
        </div>
    </div>
</body>
</html>
