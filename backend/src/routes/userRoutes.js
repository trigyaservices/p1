const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const { checkPermission, requireAdmin } = require('../middleware/checkPermission');

router.get('/permissions', auth, userController.getPermissionsList);
router.get('/', auth, checkPermission('USER_MANAGEMENT'), userController.getAllUsers);
router.post('/', auth, checkPermission('USER_MANAGEMENT'), userController.createUser);
router.put('/:id', auth, checkPermission('USER_MANAGEMENT'), userController.updateUser);
router.put('/:id/status', auth, checkPermission('USER_MANAGEMENT'), userController.toggleUserStatus);
router.post('/:id/reset-password', auth, checkPermission('USER_MANAGEMENT'), userController.resetUserPassword);
router.delete('/:id', auth, requireAdmin, userController.deleteUser);

module.exports = router;
