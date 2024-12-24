const express = require('express');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const { loginUser, registerUser, logoutUser, editImage, editProfile, getUserProfile, getUsername, getUserId, checkAuth, getNoAvailability, addNoAvailability, removeNoAvailability } = require('../controllers/userController');

const router = express.Router();

// User endpoints
router.post('/user/login', loginUser);
router.post('/user/register', registerUser);
router.post('/user/logout', logoutUser);
router.post('/user/edit-image', upload.single('image'), editImage);
router.post('/user/edit-profile', editProfile);
router.get('/user/profile', getUserProfile);
router.get('/user/username', getUsername);
router.get('/user/userId', getUserId);
router.get('/user/check-auth', checkAuth);
router.get('/user/no-availability', getNoAvailability);
router.post('/user/add-no-availability', addNoAvailability);
router.delete('/user/remove-no-availability/:noAvailabilityId', removeNoAvailability);

module.exports = router;