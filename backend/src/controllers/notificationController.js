/**
 * Notification System Controller
 * Delivers alerts, reminders, and updates for staff and administrators
 */

const db = require('../config/db');

module.exports = {
  async getNotifications(req, res) {
    try {
      const userId = req.user.id;
      // Get notifications either addressed to this user or general admin broadcasts
      const [rows] = await db.query(
        'SELECT * FROM notifications WHERE user_id = ? OR user_id IS NULL ORDER BY is_read ASC, id DESC LIMIT 50',
        [userId]
      );

      const unreadCount = rows.filter(n => !n.is_read).length;

      return res.status(200).json({
        success: true,
        unreadCount,
        data: rows
      });
    } catch (err) {
      console.error('GetNotifications error:', err);
      return res.status(500).json({ success: false, message: 'Failed to retrieve notifications' });
    }
  },

  async markAsRead(req, res) {
    try {
      const { id } = req.params;
      await db.query('UPDATE notifications SET is_read = 1 WHERE id = ?', [id]);
      return res.status(200).json({ success: true, message: 'Notification marked as read.' });
    } catch (err) {
      console.error('MarkAsRead error:', err);
      return res.status(500).json({ success: false, message: 'Failed to update notification' });
    }
  },

  async markAllAsRead(req, res) {
    try {
      const userId = req.user.id;
      await db.query('UPDATE notifications SET is_read = 1 WHERE user_id = ? OR user_id IS NULL', [userId]);
      return res.status(200).json({ success: true, message: 'All notifications marked as read.' });
    } catch (err) {
      console.error('MarkAllAsRead error:', err);
      return res.status(500).json({ success: false, message: 'Failed to clear unread notifications' });
    }
  }
};
