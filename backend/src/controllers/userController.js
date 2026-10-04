/**
 * User & Permissions Management Controller
 * Handles user creation, role assignment, granular permission toggles, status, and password resets
 */

const db = require('../config/db');
const { hashPassword } = require('../utils/security');
const { logActivity } = require('../middleware/activityLogger');

module.exports = {
  // Get all system permissions list
  async getPermissionsList(req, res) {
    try {
      const [rows] = await db.query('SELECT * FROM permissions ORDER BY id ASC');
      return res.status(200).json({ success: true, data: rows });
    } catch (err) {
      console.error('GetPermissionsList error:', err);
      return res.status(500).json({ success: false, message: 'Failed to retrieve permissions list' });
    }
  },

  // Get all users with assigned permissions
  async getAllUsers(req, res) {
    try {
      const { role, status, search } = req.query;
      let sql = `SELECT u.id, u.name, u.username, u.email, u.phone, u.role, u.status,
                        u.must_change_password, u.last_login_at, u.created_at,
                        a.is_root
                 FROM users u
                 LEFT JOIN admins a ON a.user_id = u.id
                 WHERE 1=1`;
      const params = [];

      if (role && role !== 'All') {
        sql += ` AND u.role = ?`;
        params.push(role);
      }
      if (status && status !== 'All') {
        sql += ` AND u.status = ?`;
        params.push(status);
      }
      if (search) {
        sql += ` AND (u.name LIKE ? OR u.username LIKE ? OR u.email LIKE ?)`;
        const kw = `%${search}%`;
        params.push(kw, kw, kw);
      }

      sql += ` ORDER BY u.id ASC`;

      const [users] = await db.query(sql, params);

      // Attach permissions for each user
      const [allUserPerms] = await db.query(
        `SELECT up.user_id, p.id as permission_id, p.code, p.name as permission_name
         FROM user_permissions up
         INNER JOIN permissions p ON p.id = up.permission_id`
      );

      const enriched = users.map(u => {
        const uPerms = allUserPerms.filter(p => p.user_id === u.id);
        return {
          ...u,
          is_root: Boolean(u.is_root),
          permissions: u.role === 'ADMIN' ? ['ALL'] : uPerms.map(p => p.code),
          permission_ids: uPerms.map(p => p.permission_id)
        };
      });

      return res.status(200).json({ success: true, count: enriched.length, data: enriched });
    } catch (err) {
      console.error('GetAllUsers error:', err);
      return res.status(500).json({ success: false, message: 'Failed to retrieve users list' });
    }
  },

  // Create new user (Staff or Admin)
  async createUser(req, res) {
    try {
      const { name, username, password, email, phone, role = 'STAFF', permission_ids = [] } = req.body;

      if (!name || !username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Full name, unique username, and initial password are required.'
        });
      }

      // Check username duplicate
      const [existing] = await db.query('SELECT id FROM users WHERE username = ?', [username.trim()]);
      if (existing && existing.length > 0) {
        return res.status(400).json({ success: false, message: 'Username is already taken.' });
      }

      const passwordHash = await hashPassword(password);

      const [result] = await db.query(
        `INSERT INTO users (name, username, password_hash, email, phone, role, status, must_change_password, created_at)
         VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', 1, NOW())`,
        [name.trim(), username.trim(), passwordHash, email ? email.trim() : null, phone ? phone.trim() : null, role]
      );

      const newUserId = result.insertId;

      // Assign permissions if not admin
      if (role !== 'ADMIN' && Array.isArray(permission_ids) && permission_ids.length > 0) {
        for (const pId of permission_ids) {
          await db.query(
            'INSERT INTO user_permissions (user_id, permission_id, granted_at) VALUES (?, ?, NOW())',
            [newUserId, pId]
          );
        }
      }

      await logActivity(req.user.id, req.user.username, 'CREATE_USER', `Created user account: ${username} (${role})`, req.ip);

      return res.status(201).json({
        success: true,
        message: `User account '${username}' created successfully.`,
        data: { id: newUserId, username, role }
      });
    } catch (err) {
      console.error('CreateUser error:', err);
      return res.status(500).json({ success: false, message: 'Failed to create user account' });
    }
  },

  // Update User Details & Role
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { name, email, phone, role, permission_ids } = req.body;

      const [users] = await db.query('SELECT u.*, a.is_root FROM users u LEFT JOIN admins a ON a.user_id = u.id WHERE u.id = ?', [id]);
      if (!users || users.length === 0) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const target = users[0];

      // Protect root admin from role demotion
      if (target.is_root && role && role !== 'ADMIN') {
        return res.status(400).json({ success: false, message: 'The primary Root Administrator role cannot be changed.' });
      }

      await db.query(
        `UPDATE users SET
          name = COALESCE(?, name),
          email = COALESCE(?, email),
          phone = COALESCE(?, phone),
          role = COALESCE(?, role)
         WHERE id = ?`,
        [name, email, phone, role, id]
      );

      // Update permissions if provided and user is not admin
      if (permission_ids && Array.isArray(permission_ids)) {
        await db.query('DELETE FROM user_permissions WHERE user_id = ?', [id]);
        for (const pId of permission_ids) {
          await db.query('INSERT INTO user_permissions (user_id, permission_id, granted_at) VALUES (?, ?, NOW())', [id, pId]);
        }
      }

      await logActivity(req.user.id, req.user.username, 'UPDATE_USER', `Updated user account details for ${target.username}`, req.ip);

      return res.status(200).json({ success: true, message: 'User updated successfully.' });
    } catch (err) {
      console.error('UpdateUser error:', err);
      return res.status(500).json({ success: false, message: 'Failed to update user' });
    }
  },

  // Toggle User Status (Enable / Disable)
  async toggleUserStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['ACTIVE', 'DISABLED'].includes(status)) {
        return res.status(400).json({ success: false, message: "Status must be either 'ACTIVE' or 'DISABLED'." });
      }

      const [users] = await db.query('SELECT u.*, a.is_root FROM users u LEFT JOIN admins a ON a.user_id = u.id WHERE u.id = ?', [id]);
      if (!users || users.length === 0) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // Root Admin CAN NEVER be disabled!
      if (users[0].is_root && status === 'DISABLED') {
        return res.status(400).json({
          success: false,
          message: 'Security Policy Violation: The primary Root Administrator account can never be disabled.'
        });
      }

      await db.query('UPDATE users SET status = ? WHERE id = ?', [status, id]);
      await logActivity(req.user.id, req.user.username, 'TOGGLE_USER_STATUS', `Changed status of ${users[0].username} to ${status}`, req.ip);

      return res.status(200).json({
        success: true,
        message: `User account '${users[0].username}' has been ${status === 'ACTIVE' ? 'enabled' : 'disabled'}.`
      });
    } catch (err) {
      console.error('ToggleUserStatus error:', err);
      return res.status(500).json({ success: false, message: 'Failed to toggle user status' });
    }
  },

  // Reset User Password
  async resetUserPassword(req, res) {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;

      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
      }

      const [users] = await db.query('SELECT username FROM users WHERE id = ?', [id]);
      if (!users || users.length === 0) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const newHash = await hashPassword(newPassword);
      await db.query('UPDATE users SET password_hash = ?, must_change_password = 1 WHERE id = ?', [newHash, id]);

      await logActivity(req.user.id, req.user.username, 'RESET_PASSWORD', `Admin reset password for user ${users[0].username}`, req.ip);

      return res.status(200).json({
        success: true,
        message: `Password for '${users[0].username}' reset successfully. User will be prompted to change it on next login.`
      });
    } catch (err) {
      console.error('ResetUserPassword error:', err);
      return res.status(500).json({ success: false, message: 'Failed to reset password' });
    }
  },

  // Delete User (Root Admin NEVER Deletable)
  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      const [users] = await db.query('SELECT u.*, a.is_root FROM users u LEFT JOIN admins a ON a.user_id = u.id WHERE u.id = ?', [id]);
      if (!users || users.length === 0) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      if (users[0].is_root) {
        return res.status(400).json({
          success: false,
          message: 'CRITICAL SECURITY RULE: The Root Admin account must never be deleted under any circumstance.'
        });
      }

      await db.query('DELETE FROM users WHERE id = ?', [id]);
      await logActivity(req.user.id, req.user.username, 'DELETE_USER', `Deleted user account: ${users[0].username}`, req.ip);

      return res.status(200).json({
        success: true,
        message: `User account '${users[0].username}' removed permanently.`
      });
    } catch (err) {
      console.error('DeleteUser error:', err);
      return res.status(500).json({ success: false, message: 'Failed to delete user account' });
    }
  }
};
