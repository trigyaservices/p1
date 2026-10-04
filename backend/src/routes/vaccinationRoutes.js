const express = require('express');
const router = express.Router();
const vaccinationController = require('../controllers/vaccinationController');
const auth = require('../middleware/auth');
const { checkPermission } = require('../middleware/checkPermission');
const { vaccineCertUpload } = require('../middleware/upload');

router.get('/', auth, checkPermission('VACCINATION'), vaccinationController.getAllVaccinations);
router.get('/alerts', auth, checkPermission('VACCINATION'), vaccinationController.getVaccinationAlerts);
router.post('/', auth, checkPermission('VACCINATION'), vaccineCertUpload.single('certificate'), vaccinationController.createVaccination);
router.put('/:id', auth, checkPermission('VACCINATION'), vaccineCertUpload.single('certificate'), vaccinationController.updateVaccination);
router.delete('/:id', auth, checkPermission('VACCINATION'), vaccinationController.deleteVaccination);

module.exports = router;
