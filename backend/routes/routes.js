const express = require('express');
const { loginUser, registerUser, logoutUser, getUserImage } = require('../controllers/userController');
const { fetchState, setTime, resetTime } = require('../controllers/timeMachineController');

const router = express.Router();

// User endpoints
router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/logout', logoutUser);
router.get('/user/image/:userId', getUserImage);

// Time machine endpoint
router.post('/set-time', setTime);
router.post('/reset-time', resetTime);
router.get('/fetchState', fetchState);

module.exports = router;