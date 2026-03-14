const express = require('express');
const { getBills, updateBillStatus, downloadBillPDF } = require('../controllers/billController');
const { protect, ownerOnly } = require('../middleware/authMiddleware');
const router = express.Router();
router.get('/', protect, getBills);
router.get('/:id/download', protect, downloadBillPDF);
router.put('/:id/pay', protect, ownerOnly, updateBillStatus);

module.exports = router;