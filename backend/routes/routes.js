const express = require('express');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { loginUser, registerUser, logoutUser, editImage, editProfile, getUserProfile, getUsername} = require('../controllers/userController');
const { fetchState, setTime, resetTime } = require('../controllers/timeMachineController');
const { createNote, getNotes, updateNote, deleteNote } = require('../controllers/noteController');
//const { createPost, getPosts } = require('../controllers/hubController');

const router = express.Router();

/*if we want authentication
// Middleware for checking if the user is authenticated
const requireAuth = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    next();
};
*/
// User endpoints
router.post('/user/login', loginUser);
router.post('/user/register', registerUser);
router.post('/user/logout', logoutUser);
router.post('/user/edit-image', upload.single('image'), editImage);
router.post('/user/edit-profile', editProfile);
router.get('/user/profile', getUserProfile);
router.get('/user/username', getUsername);

// Time machine endpoint
router.post('/time/set-time', setTime);
router.post('/time/reset-time', resetTime);
router.get('/time/fetchState', fetchState);

// Hub endpoint
//router.post('/hub/posts', createPost);
//router.get('/hub/posts', getPosts);

// Note endpoints
//router.post('/note', requireAuth, createNote); // if we want authentication
router.post('/note', createNote);
router.get('/notes', getNotes);
router.put('/note/:noteId', updateNote);
router.delete('/note/:noteId', deleteNote);

module.exports = router;