const express = require('express');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const { loginUser, registerUser, logoutUser, editImage, editProfile, getUserProfile, getUsername, getUserId, checkAuth, getUserIdFromUsername, updateUserPreferences, switchNotification, getUsersTools, addRoom, addDevice, editRoom, editDevice } = require('../controllers/userController');

const router = express.Router();

// User endpoints
router.post('/user/login', loginUser);
router.post('/user/register', registerUser);
router.post('/user/logout', logoutUser);
router.post('/user/edit-image', upload.single('image'), editImage);
router.post('/user/edit-profile', editProfile);
router.post('/user/room', addRoom);
router.post('/user/device', addDevice);
router.get('/user/profile/:userId?', getUserProfile);
router.get('/user/username', getUsername);
router.get('/user/userId', getUserId);
router.get('/user/check-auth', checkAuth);
router.put('/user/disable-notifications', switchNotification);
router.put('/user/room/:roomId', editRoom);
router.put('/user/device/:deviceId', editDevice);


router.put('/user/edit-schedule', updateUserPreferences);

router.get('/user/:username', getUserIdFromUsername);
router.get('/users/tools', getUsersTools); 

module.exports = router;