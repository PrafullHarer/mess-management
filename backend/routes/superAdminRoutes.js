const express = require('express');
const { protect, superAdminOnly } = require('../middleware/authMiddleware');
const {
    listMesses,
    createMessWithOwner,
    editMess,
    suspendMess,
    listOwners,
    removeOwner,
    getPlatformStats
} = require('../controllers/superAdminController');

const router = express.Router();

// All routes require SUPER_ADMIN
router.use(protect, superAdminOnly);

// Platform stats
router.get('/stats', getPlatformStats);

// Mess CRUD
router.get('/messes', listMesses);
router.post('/messes', createMessWithOwner);
router.put('/messes/:id', editMess);
router.delete('/messes/:id', suspendMess);

// Owner management
router.get('/owners', listOwners);
router.delete('/owners/:id', removeOwner);

module.exports = router;
