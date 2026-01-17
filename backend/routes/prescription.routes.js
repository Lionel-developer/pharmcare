
const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/auth.middleware');
const isAdmin = require('../middlewares/isAdmin.middleware');
const upload = require('../middlewares/upload.middleware');

const {
    uploadPrescription,
    getAllPrescriptions,
    updatePrescriptionStatus,
} = require('../controllers/prescription.controller');

//User routes

router.post('/upload', authenticate, upload.single('file'), uploadPrescription);

//Admin routes
router.get('/', authenticate, isAdmin, getAllPrescriptions);
router.put('/:id/status', authenticate, isAdmin, updatePrescriptionStatus);
router.patch('/:id/status', authenticate, isAdmin, updatePrescriptionStatus);

module.exports = router;