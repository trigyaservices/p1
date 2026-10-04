const express = require('express');
const router = express.Router();
const activityLogController = require('../controllers/activityLogController');
const auth = require('../middleware/auth');
const { requireAdmin } = require('../middleware/checkPermission');

router.get('/', auth, requireAdmin, activityLogController.getLogs);

module.exports = router;
