const express = require('express');
const { validate, schemas } = require('../utils/validation');
const { login, getMe, updateProfile, updatePassword, getAdmins, registerAdmin, removeAdmin } = require('../controllers/authController');
const { protect, ownerOnly, messStaffOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/login', validate(schemas.login), login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, updatePassword);

// Admin Management (Owner only)
router.get('/admins', protect, ownerOnly, getAdmins);
router.post('/register-admin', protect, ownerOnly, registerAdmin);
router.delete('/admins/:id', protect, ownerOnly, removeAdmin);

module.exports = router;