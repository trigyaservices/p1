const express = require('express');
const router = express.Router();
const visitController = require('../controllers/visitController');
const auth = require('../middleware/auth');
const { checkPermission } = require('../middleware/checkPermission');
const { monthlyReportUpload } = require('../middleware/upload');

router.get('/', auth, checkPermission('VISITS'), visitController.getAllVisits);
router.post('/', auth, checkPermission('VISITS'), visitController.scheduleVisit);
router.put('/:id', auth, checkPermission('VISITS'), visitController.updateVisit);
router.post('/:id/report', auth, checkPermission('VISITS'), monthlyReportUpload.single('report_document'), visitController.recordVisitReport);

module.exports = router;
