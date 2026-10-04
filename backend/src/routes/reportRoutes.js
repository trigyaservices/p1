const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const auth = require('../middleware/auth');
const { checkPermission } = require('../middleware/checkPermission');

router.get('/:type', auth, checkPermission('REPORTS'), reportController.getReportData);

module.exports = router;
