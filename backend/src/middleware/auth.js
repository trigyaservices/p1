/**
 * Authentication Middleware
 * Validates JWT bearer token and injects authenticated user into req.user
 */

const { verifyToken } = require('../utils/security');
const db = require('../config/db');

module.exports = async function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authentication token provided.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session token. Please log in again.'
      });
    }

    // Verify user is active in database
    const [rows] = await db.query('SELECT id, name, username, role, status FROM users WHERE id = ?', [decoded.id]);
    if (!rows || rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User account no longer exists.'
      });
    }

    const user = rows[0];
    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been disabled by the Administrator. Please contact support.'
      });
    }

    // Fetch user permissions
    let permissions = [];
    if (user.role === 'ADMIN') {
      // Admins have all permissions implicitly
      const [permRows] = await db.query('SELECT code FROM permissions');
      permissions = permRows.map(p => p.code);
    } else {
      const [userPermRows] = await db.query(
        `SELECT p.code FROM permissions p
         INNER JOIN user_permissions up ON up.permission_id = p.id
         WHERE up.user_id = ?`,
        [user.id]
      );
      permissions = userPermRows.map(p => p.code);
    }

    req.user = {
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
      permissions
    };

    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal authentication error'
    });
  }
};
