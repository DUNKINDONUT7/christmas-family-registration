<?php
session_start();
if (isset($_SESSION['user_id'])) {
    header('Location: user_dashboard.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Family Registration</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <div class="form-card">
            <h1>🎄 Family Registration</h1>
            <p class="form-subtitle">Join us for an unforgettable Christmas celebration</p>
            
            <form id="registerForm" method="POST" action="process_register.php">
                <div class="form-group">
                    <label for="family_name">Family Name *</label>
                    <input type="text" id="family_name" name="family_name" required placeholder="e.g., Garcia Family">
                </div>

                <div class="form-group">
                    <label for="email">Email Address *</label>
                    <input type="email" id="email" name="email" required placeholder="your@email.com">
                </div>

                <div class="form-group">
                    <label for="password">Password *</label>
                    <input type="password" id="password" name="password" required placeholder="Min 6 characters">
                </div>

                <!-- Added color theme picker -->
                <div class="form-group">
                    <label>Choose Your Family's Christmas Color Theme</label>
                    <div class="color-picker-grid">
                        <div class="color-option" data-color="christmas-red">
                            <div class="color-swatch" style="background: linear-gradient(135deg, #c41e3a 0%, #e74c5c 100%);"></div>
                            <span>🎀 Christmas Red</span>
                        </div>
                        <div class="color-option" data-color="pine-green">
                            <div class="color-swatch" style="background: linear-gradient(135deg, #0f5c2e 0%, #1a8c3e 100%);"></div>
                            <span>🎄 Pine Green</span>
                        </div>
                        <div class="color-option" data-color="metallic-gold">
                            <div class="color-swatch" style="background: linear-gradient(135deg, #d4af37 0%, #e5c158 100%);"></div>
                            <span>✨ Metallic Gold</span>
                        </div>
                        <div class="color-option" data-color="snow-white">
                            <div class="color-swatch" style="background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%); border: 2px solid #ddd;"></div>
                            <span>❄️ Snow White</span>
                        </div>
                    </div>
                    <input type="hidden" id="selected_color" name="color_theme" value="christmas-red" required>
                </div>

                <div class="form-group">
                    <label for="member_count">Number of Family Members *</label>
                    <input type="number" id="member_count" name="member_count" min="1" max="20" required value="1">
                    <small>Update this to add/remove member fields</small>
                </div>

                <div id="members-container" style="margin-top: 20px;">
                    <label>Family Member Names *</label>
                    <div class="members-list">
                        <input type="text" name="members[]" class="member-input" placeholder="Member 1 Name" required>
                    </div>
                </div>

                <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 25px;">Register Family</button>
            </form>

            <p style="text-align: center; margin-top: 15px;">
                Already registered? <a href="login.php" style="color: #d4af37; font-weight: bold;">Login here</a>
            </p>
        </div>
    </div>

    <script>
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', function() {
                document.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
                this.classList.add('selected');
                document.getElementById('selected_color').value = this.dataset.color;
            });
        });

        // Set default selected
        document.querySelector('[data-color="christmas-red"]').classList.add('selected');

        // Dynamic member list
        document.getElementById('member_count').addEventListener('change', function() {
            const count = parseInt(this.value);
            const container = document.querySelector('.members-list');
            container.innerHTML = '';
            
            for (let i = 1; i <= count; i++) {
                const input = document.createElement('input');
                input.type = 'text';
                input.name = 'members[]';
                input.className = 'member-input';
                input.placeholder = `Member ${i} Name`;
                input.required = true;
                container.appendChild(input);
            }
        });

        document.getElementById('member_count').dispatchEvent(new Event('change'));

        document.getElementById('registerForm').addEventListener('submit', function(e) {
            const password = document.getElementById('password').value;
            if (password.length < 6) {
                e.preventDefault();
                alert('Password must be at least 6 characters');
            }
        });
    </script>
</body>
</html>
