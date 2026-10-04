/**
 * Activity Logging Utility & Middleware
 * Records audit logs for compliance, security tracking, and administrative review
 */

const db = require('../config/db');

async function logActivity(userId, userName, action, details = '', ipAddress = '127.0.0.1') {
  try {
    await db.query(
      `INSERT INTO activity_logs (user_id, user_name, action, details, ip_address, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [userId || null, userName || 'System', action, details, ipAddress]
    );
  } catch (err) {
    console.error('Failed to write activity log:', err.message);
  }
}

module.exports = {
  logActivity
};
