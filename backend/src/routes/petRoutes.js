const express = require('express');
const router = express.Router();
const petController = require('../controllers/petController');
const auth = require('../middleware/auth');
const { checkPermission } = require('../middleware/checkPermission');
const { petPhotoUpload } = require('../middleware/upload');

// Public endpoints (no auth required)
router.get('/public/catalog', petController.getPublicCatalog);
router.get('/public/:id', petController.getPublicPet);

// Protected endpoints (Staff & Admin)
router.get('/', auth, checkPermission('VIEW_PETS'), petController.getAllPets);
router.get('/:id', auth, checkPermission('VIEW_PETS'), petController.getPetById);
router.post('/', auth, checkPermission('ADD_PET'), petController.createPet);
router.put('/:id', auth, checkPermission('EDIT_PET'), petController.updatePet);
router.delete('/:id', auth, checkPermission('DELETE_PET'), petController.deletePet);

// Photo gallery management
router.post('/:id/photos', auth, checkPermission('UPLOAD_PHOTOS'), petPhotoUpload.single('photo'), petController.uploadPhoto);
router.put('/:id/photos/:photoId/primary', auth, checkPermission('UPLOAD_PHOTOS'), petController.setPrimaryPhoto);
router.delete('/:id/photos/:photoId', auth, checkPermission('UPLOAD_PHOTOS'), petController.deletePhoto);

module.exports = router;
