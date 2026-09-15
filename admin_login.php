<?php
session_start();
if (isset($_SESSION['admin_id'])) {
    header('Location: admin_dashboard.php');
    exit;
}

$error = $_SESSION['error'] ?? '';
unset($_SESSION['error']);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Host Login</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <div class="form-card" style="max-width: 400px;">
            <h1>🎅 Host Login</h1>
            
            <?php if ($error): ?>
                <div class="alert alert-error"><?php echo htmlspecialchars($error); ?></div>
            <?php endif; ?>

            <form method="POST" action="process_admin_login.php">
                <div class="form-group">
                    <label for="username">Username</label>
                    <input type="text" id="username" name="username" required placeholder="admin">
                </div>

                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" required placeholder="Password">
                </div>

                <button type="submit" class="btn btn-admin" style="width: 100%;">Login as Host</button>
            </form>

            <p style="text-align: center; margin-top: 15px; font-size: 12px; color: #666;">
                <strong>Demo Credentials:</strong><br>
                Username: admin | Password: admin123
            </p>

            <p style="text-align: center; margin-top: 15px;">
                <a href="index.php" style="color: #d4af37;">Back to Home</a>
            </p>
        </div>
    </div>
</body>
</html>
