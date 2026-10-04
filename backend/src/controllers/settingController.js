/**
 * System Settings & Organization Profile Controller
 * Manages shelter branding, contact channels, and system configuration
 */

const db = require('../config/db');
const { hashPassword } = require('../utils/security');
const { logActivity } = require('../middleware/activityLogger');

module.exports = {
  // Public/Authenticated read of shelter settings
  async getSettings(req, res) {
    try {
      const [rows] = await db.query('SELECT * FROM settings WHERE id = 1');
      if (!rows || rows.length === 0) {
        return res.status(200).json({
          success: true,
          data: {
            shelter_name: 'Paws & Care Animal Shelter & Sanctuary',
            phone: '+91 98765 43210',
            email: 'contact@pawsandcare.org',
            address: 'Plot 45, Green Valley Sanctuary Road, Near Pashan Lake, Pune, Maharashtra 411021, India',
            website_info: 'Compassionate animal care and adoption network',
            currency: 'INR'
          }
        });
      }
      return res.status(200).json({ success: true, data: rows[0] });
    } catch (err) {
      console.error('GetSettings error:', err);
      return res.status(500).json({ success: false, message: 'Failed to load system settings' });
    }
  },

  // Update Settings (Restricted to Admin / SETTINGS permission)
  async updateSettings(req, res) {
    try {
      const {
        shelter_name, phone, email, address, website_info, currency,
        admin_username, admin_new_password
      } = req.body;

      // Update settings table
      await db.query(
        `UPDATE settings SET
          shelter_name = COALESCE(?, shelter_name),
          phone = COALESCE(?, phone),
          email = COALESCE(?, email),
          address = COALESCE(?, address),
          website_info = COALESCE(?, website_info),
          currency = COALESCE(?, currency),
          updated_at = NOW()
         WHERE id = 1`,
        [shelter_name, phone, email, address, website_info, currency]
      );

      // If user also wants to update the main admin credentials from settings
      if (admin_username && req.user.role === 'ADMIN') {
        await db.query('UPDATE users SET username = ? WHERE id = ?', [admin_username.trim(), req.user.id]);
      }
      if (admin_new_password && admin_new_password.length >= 6 && req.user.role === 'ADMIN') {
        const hash = await hashPassword(admin_new_password);
        await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [hash, req.user.id]);
      }

      await logActivity(req.user.id, req.user.username, 'UPDATE_SETTINGS', 'Updated shelter profile and system settings.', req.ip);

      const [updated] = await db.query('SELECT * FROM settings WHERE id = 1');
      return res.status(200).json({
        success: true,
        message: 'System settings and shelter profile updated successfully.',
        data: updated[0]
      });
    } catch (err) {
      console.error('UpdateSettings error:', err);
      return res.status(500).json({ success: false, message: 'Failed to update system settings' });
    }
  }
};
