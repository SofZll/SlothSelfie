const express = require('express');
const {loginUser, registerUser } = require('../controllers/userController');
const {fetchState} = require('../controllers/timeMachineController');

const router = express.Router();

// User endpoints
router.post('/login', loginUser);
router.post('/register', registerUser);

// Time machine endpoint
router.get('/fetchState', fetchState);

module.exports = router;