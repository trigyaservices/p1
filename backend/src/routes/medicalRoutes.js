const express = require('express');
const router = express.Router();
const medicalController = require('../controllers/medicalController');
const auth = require('../middleware/auth');
const { checkPermission } = require('../middleware/checkPermission');
const { medicalDocUpload } = require('../middleware/upload');

router.get('/', auth, checkPermission('MEDICAL'), medicalController.getAllMedicalRecords);
router.get('/:id', auth, checkPermission('MEDICAL'), medicalController.getMedicalRecordById);
router.post('/', auth, checkPermission('MEDICAL'), medicalDocUpload.single('document'), medicalController.createMedicalRecord);
router.put('/:id', auth, checkPermission('MEDICAL'), medicalDocUpload.single('document'), medicalController.updateMedicalRecord);
router.delete('/:id', auth, checkPermission('MEDICAL'), medicalController.deleteMedicalRecord);

module.exports = router;
