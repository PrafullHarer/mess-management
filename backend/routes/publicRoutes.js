const express = require('express');
const { getLiveStats } = require('../controllers/publicController');

const router = express.Router();

router.get('/stats', getLiveStats);

module.exports = router;
