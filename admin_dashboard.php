<?php
session_start();
require 'config.php';

if (!isset($_SESSION['admin_id'])) {
    header('Location: admin_login.php');
    exit;
}

$families_result = $conn->query("SELECT id, family_id, family_name, email, status, color_theme, gift_ticket FROM families ORDER BY registered_at DESC");
$families = [];
while ($row = $families_result->fetch_assoc()) {
    $families[] = $row;
}

$stats_result = $conn->query("SELECT 
    (SELECT COUNT(*) FROM families WHERE status = 'approved') as approved_families,
    (SELECT COUNT(*) FROM families WHERE status = 'pending') as pending_families,
    (SELECT COUNT(*) FROM families) as total_families,
    (SELECT COUNT(*) FROM family_members) as total_members
");
$stats = $stats_result->fetch_assoc();

$itinerary_result = $conn->query("SELECT * FROM itinerary LIMIT 1");
$itinerary = $itinerary_result->fetch_assoc();

$program_result = $conn->query("SELECT time, activity FROM program ORDER BY order_num ASC");
$program_items = [];
while ($row = $program_result->fetch_assoc()) {
    $program_items[] = $row['time'] . ' - ' . $row['activity'];
}

$message = $_SESSION['message'] ?? '';
unset($_SESSION['message']);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="navbar">
        <div class="navbar-content">
            <h2>🎅 Host Control Center</h2>
            <a href="logout.php" class="btn btn-small">Logout</a>
        </div>
    </div>

    <div class="container">
        <div class="stats-container">
            <div class="stat-card">
                <span class="icon">👨‍👩‍👧‍👦</span>
                <div class="number"><?php echo $stats['total_families']; ?></div>
                <div class="label">Total Families</div>
            </div>
            <div class="stat-card">
                <span class="icon">✅</span>
                <div class="number"><?php echo $stats['approved_families']; ?></div>
                <div class="label">Approved</div>
            </div>
            <div class="stat-card">
                <span class="icon">⏳</span>
                <div class="number"><?php echo $stats['pending_families']; ?></div>
                <div class="label">Pending Review</div>
            </div>
            <div class="stat-card">
                <span class="icon">👥</span>
                <div class="number"><?php echo $stats['total_members']; ?></div>
                <div class="label">Total Members</div>
            </div>
        </div>

        <?php if ($message): ?>
            <div class="alert alert-success"><?php echo htmlspecialchars($message); ?></div>
        <?php endif; ?>

        <div class="admin-tabs">
            <button class="tab-btn active" onclick="switchTab('families')">👨‍👩‍👧‍👦 Families</button>
            <button class="tab-btn" onclick="switchTab('raffle')">🎫 Gift Tickets</button>
            <button class="tab-btn" onclick="switchTab('itinerary')">📅 Itinerary</button>
        </div>

        <!-- Families Tab -->
        <div id="families" class="tab-content active">
            <div class="search-box">
                <input type="text" id="searchInput" placeholder="Search by family name or email...">
                <a href="api_export_csv.php" class="btn btn-secondary">📥 Export CSV</a>
            </div>

            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Family Name</th>
                        <th>Email</th>
                        <th>Members</th>
                        <th>Status</th>
                        <th>Theme Color</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="familiesTable">
                    <?php foreach ($families as $family): ?>
                        <?php
                        $member_stmt = $conn->prepare("SELECT member_name FROM family_members WHERE family_id = ? ORDER BY id ASC");
                        $member_stmt->bind_param("i", $family['id']);
                        $member_stmt->execute();
                        $member_result = $member_stmt->get_result();
                        $members = [];
                        while ($m = $member_result->fetch_assoc()) {
                            $members[] = $m['member_name'];
                        }
                        $member_stmt->close();
                        
                        $colorClass = 'theme-' . $family['color_theme'];
                        ?>
                        <tr class="family-row" data-family-id="<?php echo $family['id']; ?>">
                            <td><strong><?php echo htmlspecialchars($family['family_name']); ?></strong></td>
                            <td><?php echo htmlspecialchars($family['email']); ?></td>
                            <td>
                                <div class="member-list">
                                    <?php foreach ($members as $member): ?>
                                        <span class="member-tag"><?php echo htmlspecialchars($member); ?></span>
                                    <?php endforeach; ?>
                                </div>
                            </td>
                            <td>
                                <span class="status-badge status-<?php echo $family['status']; ?>">
                                    <?php echo ucfirst($family['status']); ?>
                                </span>
                            </td>
                            <td>
                                <!-- Display color theme -->
                                <div class="theme-badge theme-<?php echo $family['color_theme']; ?>">
                                    <?php 
                                    $colorLabels = [
                                        'christmas-red' => '🎀 Red',
                                        'pine-green' => '🎄 Green',
                                        'metallic-gold' => '✨ Gold',
                                        'snow-white' => '❄️ White'
                                    ];
                                    echo $colorLabels[$family['color_theme']] ?? 'Theme';
                                    ?>
                                </div>
                            </td>
                            <td>
                                <button class="btn btn-small" onclick="openEditModal(<?php echo $family['id']; ?>, '<?php echo htmlspecialchars($family['family_name']); ?>')">Edit</button>
                                <?php if ($family['status'] === 'pending'): ?>
                                    <button class="btn btn-small btn-success" onclick="approveFamily(<?php echo $family['id']; ?>)">Approve</button>
                                <?php endif; ?>
                                <button class="btn btn-small btn-danger" onclick="deleteFamily(<?php echo $family['id']; ?>)">Delete</button>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>

        <!-- Gift Tickets Tab -->
        <div id="raffle" class="tab-content">
            <div class="raffle-header">
                <h3>🎫 All Gift Tickets for Raffle</h3>
                <p>Use these tickets for raffle draws during the event</p>
            </div>
            
            <div class="tickets-grid">
                <?php foreach ($families as $family): 
                    if ($family['status'] !== 'approved') continue;
                    ?>
                    <div class="raffle-ticket">
                        <div class="ticket-header-raffle">🎁</div>
                        <div class="ticket-family-name"><?php echo htmlspecialchars($family['family_name']); ?></div>
                        <div class="ticket-number-raffle"><?php echo htmlspecialchars($family['gift_ticket']); ?></div>
                        <div class="ticket-members">
                            <?php
                            $member_stmt = $conn->prepare("SELECT COUNT(*) as count FROM family_members WHERE family_id = ?");
                            $member_stmt->bind_param("i", $family['id']);
                            $member_stmt->execute();
                            $count_result = $member_stmt->get_result();
                            $count_row = $count_result->fetch_assoc();
                            $member_stmt->close();
                            echo $count_row['count'] . ' member' . ($count_row['count'] > 1 ? 's' : '');
                            ?>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>

        <!-- Itinerary Tab -->
        <div id="itinerary" class="tab-content">
            <form id="itineraryForm" onsubmit="saveItinerary(event)">
                <div class="form-group">
                    <label>Event Title</label>
                    <input type="text" name="title" value="<?php echo htmlspecialchars($itinerary['title'] ?? ''); ?>" required>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Date</label>
                        <input type="date" name="date" value="<?php echo htmlspecialchars($itinerary['event_date'] ?? ''); ?>" required>
                    </div>
                    <div class="form-group">
                        <label>Time</label>
                        <input type="time" name="time" value="<?php echo htmlspecialchars($itinerary['event_time'] ?? ''); ?>" required>
                    </div>
                </div>

                <div class="form-group">
                    <label>Venue</label>
                    <input type="text" name="venue" value="<?php echo htmlspecialchars($itinerary['venue'] ?? ''); ?>" required>
                </div>

                <div class="form-group">
                    <label>Dress Code</label>
                    <input type="text" name="dress_code" value="<?php echo htmlspecialchars($itinerary['dress_code'] ?? ''); ?>">
                </div>

                <div class="form-group">
                    <label>Program Flow (one per line)</label>
                    <textarea name="program" rows="6" required><?php echo htmlspecialchars(implode("\n", $program_items)); ?></textarea>
                </div>

                <div class="form-group">
                    <label>Notes</label>
                    <textarea name="notes" rows="4"><?php echo htmlspecialchars($itinerary['notes'] ?? ''); ?></textarea>
                </div>

                <button type="submit" class="btn btn-primary">Save Itinerary</button>
            </form>
        </div>
    </div>

    <!-- Edit Modal -->
    <div id="editModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeEditModal()">&times;</span>
            <h2>Edit Family Details</h2>
            <form id="editForm" onsubmit="saveFamily(event)">
                <input type="hidden" id="editFamilyId" name="family_id">
                
                <div class="form-group">
                    <label>Family Name</label>
                    <input type="text" id="editFamilyName" name="family_name" required>
                </div>

                <div class="form-group">
                    <label>Number of Members</label>
                    <input type="number" id="editMemberCount" name="member_count" min="1" max="20" required>
                    <div id="editMembersContainer" style="margin-top: 15px;"></div>
                </div>

                <button type="submit" class="btn btn-primary">Save Changes</button>
            </form>
        </div>
    </div>

    <script src="script.js"></script>
</body>
</html>
