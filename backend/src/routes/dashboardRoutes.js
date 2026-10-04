const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

router.get('/stats', auth, dashboardController.getStats);
router.get('/charts', auth, dashboardController.getCharts);
router.get('/recent-activity', auth, dashboardController.getRecentActivity);

module.exports = router;
