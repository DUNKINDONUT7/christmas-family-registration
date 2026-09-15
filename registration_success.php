<?php
session_start();

if (!isset($_SESSION['gift_ticket'])) {
    header('Location: register.php');
    exit;
}

$ticket = $_SESSION['gift_ticket'];
$family_name = $_SESSION['family_name'];
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registration Successful!</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <div class="success-card">
            <div class="success-animation">
                <div class="confetti"></div>
                <div class="success-icon">🎉</div>
            </div>
            
            <h1>Welcome to Christmas Celebration!</h1>
            <p class="success-subtitle">Your registration has been submitted successfully</p>
            
            <!-- Animated gift ticket reveal -->
            <div class="ticket-reveal">
                <div class="ticket-card">
                    <div class="ticket-header">🎁 Official Gift Ticket 🎁</div>
                    <div class="ticket-family"><?php echo htmlspecialchars($family_name); ?></div>
                    <div class="ticket-display"><?php echo htmlspecialchars($ticket); ?></div>
                    <div class="ticket-footer">Your Raffle Number for Event Night</div>
                </div>
            </div>
            
            <div class="success-message">
                <p><strong>What's Next?</strong></p>
                <ul>
                    <li>✅ Your family registration is pending approval from the host</li>
                    <li>🎫 Save your Gift Ticket: <span class="ticket-highlight"><?php echo htmlspecialchars($ticket); ?></span></li>
                    <li>📧 You'll receive an email when your registration is approved</li>
                    <li>🎄 Once approved, login to view the complete event itinerary</li>
                </ul>
            </div>
            
            <div class="button-group">
                <a href="login.php" class="btn btn-primary">Back to Login</a>
                <a href="index.php" class="btn btn-secondary">Return Home</a>
            </div>
        </div>
    </div>

    <style>
        .success-card {
            background: white;
            padding: 50px 40px;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
            max-width: 700px;
            margin: 40px auto;
            text-align: center;
            animation: slideUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .success-icon {
            font-size: 4em;
            animation: bounce 0.8s ease-out;
        }

        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
        }

        .success-card h1 {
            color: #0f5c2e;
            text-shadow: none;
            margin: 20px 0;
        }

        .success-subtitle {
            color: #666;
            font-size: 1.1em;
            margin-bottom: 30px;
        }

        .ticket-reveal {
            margin: 35px 0;
            animation: slideDown 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both;
        }

        .ticket-card {
            background: linear-gradient(135deg, #d4af37 0%, #e5c158 100%);
            border: 3px dashed rgba(255, 255, 255, 0.5);
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(212, 175, 55, 0.3);
            transform: perspective(1000px) rotateY(0);
        }

        .ticket-header {
            color: #0f5c2e;
            font-weight: 700;
            font-size: 1.1em;
            margin-bottom: 12px;
        }

        .ticket-family {
            color: #0f5c2e;
            font-size: 1.2em;
            font-weight: 600;
            margin: 12px 0;
        }

        .ticket-display {
            background: rgba(255, 255, 255, 0.3);
            color: #0f5c2e;
            padding: 15px;
            border-radius: 8px;
            font-size: 2em;
            font-weight: 700;
            letter-spacing: 2px;
            margin: 15px 0;
            font-family: 'Courier New', monospace;
            box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.1);
        }

        .ticket-footer {
            color: #0f5c2e;
            font-size: 0.9em;
            font-weight: 600;
        }

        .success-message {
            text-align: left;
            background: #f8f8f8;
            padding: 25px;
            border-radius: 10px;
            margin: 25px 0;
            border-left: 5px solid #d4af37;
        }

        .success-message p {
            color: #0f5c2e;
            font-weight: 700;
            margin-bottom: 15px;
        }

        .success-message ul {
            list-style: none;
            padding: 0;
        }

        .success-message li {
            color: #555;
            margin: 10px 0;
            padding-left: 0;
        }

        .ticket-highlight {
            background: linear-gradient(135deg, #d4af37 0%, #e5c158 100%);
            color: #0f5c2e;
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: 700;
            font-family: 'Courier New', monospace;
        }

        @media (max-width: 768px) {
            .success-card {
                padding: 30px 20px;
            }

            .success-icon {
                font-size: 3em;
            }

            .ticket-display {
                font-size: 1.5em;
                letter-spacing: 1px;
            }
        }
    </style>
</body>
</html>
