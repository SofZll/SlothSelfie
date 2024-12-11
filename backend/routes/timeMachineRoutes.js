const express = require('express');

const { fetchState, setTime, resetTime } = require('../controllers/timeMachineController');

const router = express.Router();

// Time machine endpoint
router.get('/time/fetch-state', fetchState);

module.exports = router;