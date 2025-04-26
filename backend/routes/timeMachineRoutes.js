const express = require('express');

const { setTime, resetTime, getIsActive } = require('../controllers/timeMachineController');

const router = express.Router();

// Time machine endpoint
router.post('/time/set', setTime);
router.post('/time/reset', resetTime);
router.get('/time/state', getIsActive);

module.exports = router;