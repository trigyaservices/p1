const express = require('express');
const router = express.Router();
const rescueController = require('../controllers/rescueController');
const auth = require('../middleware/auth');
const { checkPermission } = require('../middleware/checkPermission');
const { rescuePhotoUpload } = require('../middleware/upload');

router.get('/', auth, checkPermission('VIEW_PETS'), rescueController.getAllRescues);
router.post('/', auth, checkPermission('ADD_PET'), rescuePhotoUpload.single('photo'), rescueController.createRescue);
router.post('/:id/convert-to-pet', auth, checkPermission('ADD_PET'), rescueController.convertToPet);

module.exports = router;
