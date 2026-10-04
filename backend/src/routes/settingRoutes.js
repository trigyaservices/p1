const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const auth = require('../middleware/auth');
const { checkPermission } = require('../middleware/checkPermission');

router.get('/', settingController.getSettings);
router.put('/', auth, checkPermission('SETTINGS'), settingController.updateSettings);

module.exports = router;
