/**
 * Permission Checking Middleware
 * Enforces role-based and granular permission controls across all API endpoints
 */

function checkPermission(requiredPermission) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Admins have full access to all endpoints
    if (req.user.role === 'ADMIN') {
      return next();
    }

    // Check if permission exists in assigned permissions list
    const hasPermission = req.user.permissions && req.user.permissions.includes(requiredPermission);

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: You lack the required permission (${requiredPermission}) to access this resource.`
      });
    }

    next();
  };
}

function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Access restricted to System Administrators only.'
    });
  }

  next();
}

module.exports = {
  checkPermission,
  requireAdmin
};
