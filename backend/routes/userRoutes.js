const express = require('express');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const { loginUser, registerUser, logoutUser, editImage, editProfile, getUserProfile, getUsername, getUserId, checkAuth } = require('../controllers/userController');

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

module.exports = router;