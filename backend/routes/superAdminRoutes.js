const express = require('express');
const { protect, superAdminOnly } = require('../middleware/authMiddleware');
const {
    listMesses,
    createMessWithOwner,
    editMess,
    deleteMess,
    listOwners,
    removeOwner,
    getPlatformStats,
    getSystemHealth
} = require('../controllers/superAdminController');

const router = express.Router();

// All routes require SUPER_ADMIN
router.use(protect, superAdminOnly);

// Platform stats
router.get('/stats', getPlatformStats);

// System health
router.get('/system-health', getSystemHealth);

// Mess CRUD
router.get('/messes', listMesses);
router.post('/messes', createMessWithOwner);
router.put('/messes/:id', editMess);
router.delete('/messes/:id', deleteMess);

// Owner management
router.get('/owners', listOwners);
router.delete('/owners/:id', removeOwner);

module.exports = router;
