const express = require('express');
const { getDailyEntries, addDailyEntry, editDailyEntry, deleteDailyEntry } = require('../controllers/dailyEntryController');
const { protect, ownerOnly } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', protect, ownerOnly, getDailyEntries);
router.post('/', protect, ownerOnly, addDailyEntry);
router.put('/:id', protect, ownerOnly, editDailyEntry);
router.delete('/:id', protect, ownerOnly, deleteDailyEntry);

module.exports = router;
