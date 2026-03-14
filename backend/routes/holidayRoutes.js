const express = require('express');
const { getHolidays, addHoliday, editHoliday, deleteHoliday } = require('../controllers/holidayController');
const { protect, ownerOnly } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', protect, getHolidays);
router.post('/', protect, ownerOnly, addHoliday);
router.put('/:id', protect, ownerOnly, editHoliday);
router.delete('/:id', protect, ownerOnly, deleteHoliday);

module.exports = router;
