const express = require('express');

const { fetchState, setTime, resetTime } = require('../controllers/timeMachineController');

const router = express.Router();

// Time machine endpoint
router.get('/time/fetch-state', fetchState);
router.post('/time/set-time', setTime);
router.post('/time/reset-time', resetTime);

module.exports = router;