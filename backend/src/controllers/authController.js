/**
 * Auth Controller
 * Handles user login, profile retrieval, password changes, and credential updates
 */

const db = require('../config/db');
const { hashPassword, comparePassword, generateToken } = require('../utils/security');
const { logActivity } = require('../middleware/activityLogger');

module.exports = {
  async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username and password are required.'
        });
      }

      const [users] = await db.query(
        'SELECT id, name, username, password_hash, email, phone, role, status, must_change_password FROM users WHERE username = ?',
        [username.trim()]
      );

      if (!users || users.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Invalid username or password.'
        });
      }

      const user = users[0];

      if (user.status !== 'ACTIVE') {
        return res.status(403).json({
          success: false,
          message: 'Account has been disabled. Please contact the Shelter Administrator.'
        });
      }

      const isMatch = await comparePassword(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid username or password.'
        });
      }

      // Fetch user permissions
      let permissions = [];
      if (user.role === 'ADMIN') {
        const [allPerms] = await db.query('SELECT code FROM permissions');
        permissions = allPerms.map(p => p.code);
      } else {
        const [userPerms] = await db.query(
          `SELECT p.code FROM permissions p
           INNER JOIN user_permissions up ON up.permission_id = p.id
           WHERE up.user_id = ?`,
          [user.id]
        );
        permissions = userPerms.map(p => p.code);
      }

      // Update last login
      await db.query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);

      // Record audit log
      await logActivity(user.id, user.username, 'LOGIN', `${user.name} (${user.role}) logged in successfully.`, req.ip);

      const token = generateToken({
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
        permissions
      });

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: {
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            phone: user.phone,
            role: user.role,
            mustChangePassword: Boolean(user.must_change_password),
            permissions
          }
        }
      });
    } catch (err) {
      console.error('Login error:', err);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during login'
      });
    }
  },

  async getMe(req, res) {
    try {
      const [users] = await db.query(
        'SELECT id, name, username, email, phone, role, status, must_change_password, last_login_at, created_at FROM users WHERE id = ?',
        [req.user.id]
      );

      if (!users || users.length === 0) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const user = users[0];
      return res.status(200).json({
        success: true,
        data: {
          ...user,
          permissions: req.user.permissions
        }
      });
    } catch (err) {
      console.error('GetMe error:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch user profile' });
    }
  },

  async changePassword(req, res) {
    try {
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Both current password and new password are required.'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long.'
        });
      }

      const [users] = await db.query('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
      if (!users || users.length === 0) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const isMatch = await comparePassword(oldPassword, users[0].password_hash);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
      }

      const newHash = await hashPassword(newPassword);
      await db.query('UPDATE users SET password_hash = ?, must_change_password = 0 WHERE id = ?', [newHash, req.user.id]);

      await logActivity(req.user.id, req.user.username, 'CHANGE_PASSWORD', 'User updated account password.', req.ip);

      return res.status(200).json({
        success: true,
        message: 'Password changed successfully.'
      });
    } catch (err) {
      console.error('Change password error:', err);
      return res.status(500).json({ success: false, message: 'Failed to update password' });
    }
  },

  async updateProfile(req, res) {
    try {
      const { name, email, phone, username } = req.body;

      // Check if username taken by another user
      if (username && username !== req.user.username) {
        const [existing] = await db.query('SELECT id FROM users WHERE username = ? AND id != ?', [username.trim(), req.user.id]);
        if (existing && existing.length > 0) {
          return res.status(400).json({ success: false, message: 'Username is already taken by another account.' });
        }
      }

      await db.query(
        'UPDATE users SET name = COALESCE(?, name), username = COALESCE(?, username), email = COALESCE(?, email), phone = COALESCE(?, phone) WHERE id = ?',
        [name, username ? username.trim() : null, email, phone, req.user.id]
      );

      await logActivity(req.user.id, req.user.username, 'UPDATE_PROFILE', 'User updated account details.', req.ip);

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully.'
      });
    } catch (err) {
      console.error('Update profile error:', err);
      return res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
  }
};
