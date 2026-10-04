const express = require('express');
const router = express.Router();
const fosterController = require('../controllers/fosterController');
const auth = require('../middleware/auth');
const { checkPermission } = require('../middleware/checkPermission');

router.get('/', auth, checkPermission('VIEW_PETS'), fosterController.getAllFosterRecords);
router.post('/', auth, checkPermission('EDIT_PET'), fosterController.createFosterPlacement);
router.put('/:id/return', auth, checkPermission('EDIT_PET'), fosterController.returnFromFoster);

module.exports = router;
