const express = require('express');
const router = express.Router();
const adoptionController = require('../controllers/adoptionController');
const auth = require('../middleware/auth');
const { checkPermission } = require('../middleware/checkPermission');

// Public or User Application Submission
router.post('/apply', (req, res, next) => {
  // If Bearer token is provided, verify it, otherwise proceed anonymously
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return auth(req, res, next);
  }
  next();
}, adoptionController.applyForAdoption);

// Logged-in user view own applications
router.get('/my', auth, adoptionController.getMyApplications);

// Admin & Staff: application management
router.get('/', auth, checkPermission('ADOPTION'), adoptionController.getAllApplications);
router.get('/:id', auth, adoptionController.getApplicationById);
router.put('/:id/status', auth, checkPermission('ADOPTION'), adoptionController.updateStatus);
router.post('/:id/approve', auth, checkPermission('ADOPTION'), adoptionController.approveAdoption);
router.post('/:id/reject', auth, checkPermission('ADOPTION'), adoptionController.rejectAdoption);
router.get('/:id/certificate', auth, adoptionController.getCertificate);

module.exports = router;
