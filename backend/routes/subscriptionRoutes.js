const express = require('express');

const { subscribe } = require('../controllers/subscriptionController');

const router = express.Router();

// Subscription endpoints
router.post('/subscribe', subscribe);

module.exports = router;