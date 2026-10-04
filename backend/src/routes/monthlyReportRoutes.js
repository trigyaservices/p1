const express = require('express');
const router = express.Router();
const monthlyReportController = require('../controllers/monthlyReportController');
const auth = require('../middleware/auth');
const { checkPermission } = require('../middleware/checkPermission');
const { monthlyReportUpload } = require('../middleware/upload');

router.get('/', auth, checkPermission('MONTHLY_REPORTS'), monthlyReportController.getAllReports);
router.get('/:petId/timeline', auth, checkPermission('MONTHLY_REPORTS'), monthlyReportController.getPetTimeline);
router.post('/', auth, checkPermission('MONTHLY_REPORTS'), monthlyReportUpload.single('document'), monthlyReportController.createReport);
router.put('/:id', auth, checkPermission('MONTHLY_REPORTS'), monthlyReportUpload.single('document'), monthlyReportController.updateReport);
router.delete('/:id', auth, checkPermission('MONTHLY_REPORTS'), monthlyReportController.deleteReport);

module.exports = router;
