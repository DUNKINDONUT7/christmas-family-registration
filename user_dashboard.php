<?php
session_start();
require 'config.php';

if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit;
}

$user_id = $_SESSION['user_id'];

$family_stmt = $conn->prepare("SELECT family_name, color_theme, gift_ticket FROM families WHERE id = ?");
$family_stmt->bind_param("i", $user_id);
$family_stmt->execute();
$family_result = $family_stmt->get_result();
$family = $family_result->fetch_assoc();
$family_stmt->close();

$stmt = $conn->prepare("SELECT member_name FROM family_members WHERE family_id = ? ORDER BY id ASC");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$members_result = $stmt->get_result();

$members = [];
while ($row = $members_result->fetch_assoc()) {
    $members[] = $row['member_name'];
}

$itinerary_result = $conn->query("SELECT * FROM itinerary LIMIT 1");
$itinerary = $itinerary_result->fetch_assoc();

$program_result = $conn->query("SELECT time, activity FROM program ORDER BY order_num ASC");
$program = [];
while ($row = $program_result->fetch_assoc()) {
    $program[] = $row['time'] . ' - ' . $row['activity'];
}

$stmt->close();

$themeClass = 'theme-' . ($family['color_theme'] ?? 'christmas-red');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Family Dashboard</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body class="<?php echo $themeClass; ?>">
    <div class="navbar">
        <div class="navbar-content">
            <h2>🎄 <?php echo htmlspecialchars($family['family_name']); ?></h2>
            <a href="logout.php" class="btn btn-small">Logout</a>
        </div>
    </div>

    <div class="container">
        <!-- Gift Ticket Display Card -->
        <div class="gift-ticket-card">
            <div class="ticket-wrapper">
                <div class="ticket-content">
                    <div class="ticket-icon">🎁</div>
                    <h3>Your Official Gift Ticket</h3>
                    <div class="ticket-number"><?php echo htmlspecialchars($family['gift_ticket']); ?></div>
                    <p class="ticket-subtitle">Valid for raffle draw on event day</p>
                    <button class="btn btn-secondary btn-small" onclick="printTicket()">🖨️ Print Ticket</button>
                </div>
            </div>
        </div>

        <div class="dashboard-grid">
            <!-- Family Members Card -->
            <div class="card">
                <h2>👨‍👩‍👧‍👦 Our Family</h2>
                <div class="members-display">
                    <?php foreach ($members as $member): ?>
                        <div class="member-badge"><?php echo htmlspecialchars($member); ?></div>
                    <?php endforeach; ?>
                </div>
                <div class="member-count">
                    <span class="member-count-text">Total Members:</span>
                    <span class="member-count-number"><?php echo count($members); ?></span>
                </div>
            </div>

            <!-- Itinerary Card -->
            <div class="card">
                <h2>📅 Event Itinerary</h2>
                
                <?php if ($itinerary): ?>
                    <div class="itinerary-display">
                        <h3 class="itinerary-title"><?php echo htmlspecialchars($itinerary['title']); ?></h3>
                        
                        <div class="detail-row">
                            <strong>📆 Date:</strong> <?php echo htmlspecialchars($itinerary['event_date']); ?>
                        </div>
                        
                        <div class="detail-row">
                            <strong>⏰ Time:</strong> <?php echo htmlspecialchars($itinerary['event_time']); ?>
                        </div>
                        
                        <div class="detail-row">
                            <strong>📍 Venue:</strong> <?php echo htmlspecialchars($itinerary['venue']); ?>
                        </div>

                        <?php if (!empty($itinerary['dress_code'])): ?>
                            <div class="detail-row">
                                <strong>👔 Dress Code:</strong> <?php echo htmlspecialchars($itinerary['dress_code']); ?>
                            </div>
                        <?php endif; ?>

                        <div class="detail-row">
                            <strong>📋 Program Flow:</strong>
                            <ul>
                                <?php foreach ($program as $item): ?>
                                    <li><?php echo htmlspecialchars($item); ?></li>
                                <?php endforeach; ?>
                            </ul>
                        </div>

                        <?php if (!empty($itinerary['notes'])): ?>
                            <div class="detail-row">
                                <strong>📝 Notes:</strong><br>
                                <p style="margin: 8px 0 0 0; color: #666;"><?php echo htmlspecialchars($itinerary['notes']); ?></p>
                            </div>
                        <?php endif; ?>
                    </div>
                <?php else: ?>
                    <p style="color: #999; text-align: center; padding: 40px 20px;">Itinerary coming soon! 🎉</p>
                <?php endif; ?>
            </div>
        </div>
    </div>

    <script>
        function printTicket() {
            const ticketContent = document.querySelector('.gift-ticket-card').innerHTML;
            const printWindow = window.open('', '', 'height=400,width=500');
            printWindow.document.write(`
                <html><head><title>Gift Ticket</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
                    .ticket-content { border: 3px dashed #d4af37; padding: 30px; }
                </style>
                </head><body>${ticketContent}</body></html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    </script>
</body>
</html>
