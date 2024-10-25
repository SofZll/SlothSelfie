const express = require('express');
const { loginUser, registerUser, logoutUser, editImage, editProfile, getUserProfile } = require('../controllers/userController');
const { fetchState, setTime, resetTime } = require('../controllers/timeMachineController');

const router = express.Router();

// User endpoints
router.post('/user/login', loginUser);
router.post('/user/register', registerUser);
router.post('/user/logout', logoutUser);
router.post('/user/edit-image', editImage);
router.post('/user/edit-profile', editProfile);
router.get('/user/profile/:userId', getUserProfile);

// Time machine endpoint
router.post('/time/set-time', setTime);
router.post('/time/reset-time', resetTime);
router.get('/time/fetchState', fetchState);


module.exports = router;