<?php
// Database Configuration
// Change these to match your database credentials

define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', 'password');
define('DB_NAME', 'christmas_registration');

// Create connection
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

// Check connection
if ($conn->connect_error) {
    die('Database Connection Failed: ' . $conn->connect_error);
}

// Set charset
$conn->set_charset('utf8mb4');

// Function to check if table exists
function tableExists($conn, $table) {
    $result = $conn->query("SHOW TABLES LIKE '$table'");
    return $result->num_rows > 0;
}

// Auto-create tables if they don't exist
if (!tableExists($conn, 'families')) {
    $createFamiliesTable = "
    CREATE TABLE families (
        id INT AUTO_INCREMENT PRIMARY KEY,
        family_id VARCHAR(50) UNIQUE,
        family_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        color_theme VARCHAR(50) DEFAULT 'christmas-red',
        gift_ticket VARCHAR(50) UNIQUE,
        registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_status (status)
    )";
    $conn->query($createFamiliesTable);
}

if (!tableExists($conn, 'family_members')) {
    $createMembersTable = "
    CREATE TABLE family_members (
        id INT AUTO_INCREMENT PRIMARY KEY,
        family_id INT NOT NULL,
        member_name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE CASCADE,
        INDEX idx_family_id (family_id)
    )";
    $conn->query($createMembersTable);
}

if (!tableExists($conn, 'itinerary')) {
    $createItineraryTable = "
    CREATE TABLE itinerary (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255),
        event_date DATE,
        event_time TIME,
        venue VARCHAR(255),
        dress_code VARCHAR(255),
        notes LONGTEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";
    $conn->query($createItineraryTable);
    
    // Insert default itinerary
    $conn->query("INSERT INTO itinerary (title, event_date, event_time, venue, dress_code, notes) VALUES (
        'Christmas Family Celebration 2024',
        '2024-12-20',
        '18:00',
        'Community Center - Main Hall',
        'Festive Christmas Attire',
        'Please arrive 15 minutes early. Children under 12 should be accompanied by adults.'
    )");
}

if (!tableExists($conn, 'program')) {
    $createProgramTable = "
    CREATE TABLE program (
        id INT AUTO_INCREMENT PRIMARY KEY,
        time VARCHAR(50) NOT NULL,
        activity VARCHAR(255) NOT NULL,
        order_num INT DEFAULT 0,
        INDEX idx_order (order_num)
    )";
    $conn->query($createProgramTable);
    
    // Insert default program
    $programs = [
        ['6:00 PM', 'Arrival & Welcome Reception', 1],
        ['6:30 PM', 'Opening Remarks & Caroling', 2],
        ['7:00 PM', 'Dinner Service', 3],
        ['8:00 PM', 'Games & Activities', 4],
        ['8:45 PM', 'Gift Distribution', 5],
        ['9:15 PM', 'Closing Remarks & Departures', 6]
    ];
    
    foreach ($programs as $prog) {
        $conn->query("INSERT INTO program (time, activity, order_num) VALUES ('{$prog[0]}', '{$prog[1]}', {$prog[2]})");
    }
}
?>
