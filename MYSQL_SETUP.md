# MySQL Database Setup Instructions

## Prerequisites
- PHP 7.0+ with MySQLi extension
- MySQL Server 5.7+ or MariaDB 10.2+
- Local/Remote MySQL access

---

## Setup Steps

### 1. Create Database
Open your MySQL client (phpMyAdmin, MySQL CLI, or any MySQL manager) and run:

\`\`\`sql
CREATE DATABASE christmas_registration CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
\`\`\`

### 2. Update config.php
Edit `config.php` with your database credentials:

\`\`\`php
define('DB_HOST', 'localhost');      // MySQL host (localhost if local)
define('DB_USER', 'root');           // MySQL username
define('DB_PASS', '');               // MySQL password
define('DB_NAME', 'christmas_registration');
\`\`\`

### 3. Run Application
Tables will be automatically created on first run. Just start the PHP server:

\`\`\`bash
php -S localhost:8000
\`\`\`

Navigate to `http://localhost:8000` - tables will auto-create!

---

## Using with Different Environments

### Local Development (XAMPP/WAMP)
\`\`\`php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');  // Usually blank for local
define('DB_NAME', 'christmas_registration');
\`\`\`

### Remote Server / VPS
\`\`\`php
define('DB_HOST', 'your-server-ip-or-domain');
define('DB_USER', 'your_username');
define('DB_PASS', 'your_password');
define('DB_NAME', 'christmas_registration');
\`\`\`

### AWS RDS / Cloud Database
\`\`\`php
define('DB_HOST', 'your-rds-endpoint.rds.amazonaws.com');
define('DB_USER', 'admin');
define('DB_PASS', 'your_password');
define('DB_NAME', 'christmas_registration');
\`\`\`

---

## Manual Table Creation (If Auto-Creation Fails)

If tables don't auto-create, run these SQL commands manually:

\`\`\`sql
-- Families Table
CREATE TABLE families (
    id INT AUTO_INCREMENT PRIMARY KEY,
    family_id VARCHAR(50) UNIQUE,
    family_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_status (status)
);

-- Family Members Table
CREATE TABLE family_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    family_id INT NOT NULL,
    member_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE CASCADE,
    INDEX idx_family_id (family_id)
);

-- Itinerary Table
CREATE TABLE itinerary (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    event_date DATE,
    event_time TIME,
    venue VARCHAR(255),
    dress_code VARCHAR(255),
    notes LONGTEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Program Table
CREATE TABLE program (
    id INT AUTO_INCREMENT PRIMARY KEY,
    time VARCHAR(50) NOT NULL,
    activity VARCHAR(255) NOT NULL,
    order_num INT DEFAULT 0,
    INDEX idx_order (order_num)
);

-- Insert Default Itinerary
INSERT INTO itinerary (title, event_date, event_time, venue, dress_code, notes) 
VALUES ('Christmas Family Celebration 2024', '2024-12-20', '18:00', 'Community Center - Main Hall', 'Festive Christmas Attire', 'Please arrive 15 minutes early. Children under 12 should be accompanied by adults.');

-- Insert Default Program
INSERT INTO program (time, activity, order_num) VALUES 
('6:00 PM', 'Arrival & Welcome Reception', 1),
('6:30 PM', 'Opening Remarks & Caroling', 2),
('7:00 PM', 'Dinner Service', 3),
('8:00 PM', 'Games & Activities', 4),
('8:45 PM', 'Gift Distribution', 5),
('9:15 PM', 'Closing Remarks & Departures', 6);
\`\`\`

---

## Troubleshooting

### "Connection refused" error
- Check if MySQL service is running
- Verify DB_HOST, DB_USER, DB_PASS in config.php
- Ensure database user has proper permissions

### "Access denied for user 'root'@'localhost'"
- Verify your MySQL credentials are correct
- For local XAMPP: username is usually `root` with blank password
- Update config.php accordingly

### Tables not created automatically
- Run the manual SQL commands above
- Check file permissions on config.php
- Verify MySQLi extension is enabled (`php -m | grep mysqli`)

---

## Backup Database

To backup your database:

\`\`\`bash
mysqldump -u root -p christmas_registration > backup.sql
\`\`\`

To restore:

\`\`\`bash
mysql -u root -p christmas_registration < backup.sql
\`\`\`

---

## Database Schema Summary

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| families | Store family accounts | family_name, email, password, status |
| family_members | Store member names | family_id, member_name |
| itinerary | Store event details | title, event_date, event_time, venue |
| program | Store program schedule | time, activity, order_num |
