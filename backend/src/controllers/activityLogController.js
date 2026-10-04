/**
 * Activity Log Controller
 * Provides audit trail review for administrators
 */

const db = require('../config/db');

module.exports = {
  async getLogs(req, res) {
    try {
      const { action, search, limit = 50 } = req.query;
      let sql = 'SELECT * FROM activity_logs WHERE 1=1';
      const params = [];

      if (action && action !== 'All') {
        sql += ' AND action = ?';
        params.push(action);
      }
      if (search) {
        sql += ' AND (user_name LIKE ? OR action LIKE ? OR details LIKE ?)';
        const kw = `%${search}%`;
        params.push(kw, kw, kw);
      }

      sql += ` ORDER BY id DESC LIMIT ${parseInt(limit, 10)}`;

      const [rows] = await db.query(sql, params);
      return res.status(200).json({ success: true, count: rows.length, data: rows });
    } catch (err) {
      console.error('GetLogs error:', err);
      return res.status(500).json({ success: false, message: 'Failed to retrieve activity audit trail' });
    }
  }
};
