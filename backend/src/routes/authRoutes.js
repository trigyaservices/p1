const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/login', authController.login);
router.get('/me', auth, authController.getMe);
router.put('/change-password', auth, authController.changePassword);
router.put('/profile', auth, authController.updateProfile);

module.exports = router;
