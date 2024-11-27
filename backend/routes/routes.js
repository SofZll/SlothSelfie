const express = require('express');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { loginUser, registerUser, logoutUser, editImage, editProfile, getUserProfile, getUsername, checkAuth} = require('../controllers/userController');
const { fetchState, setTime, resetTime } = require('../controllers/timeMachineController');
const { createNote, getNotes, updateNote, deleteNote } = require('../controllers/noteController');
const { createNotification, getNotifications, markNotificationAsRead} = require('../controllers/notificationController')
//const { createPost, getPosts } = require('../controllers/hubController');
const { createActivity, getActivities, updateActivity, deleteActivity } = require('../controllers/activityController');
const { createEvent, getEvents, updateEvent, deleteEvent } = require('../controllers/eventController');

const router = express.Router();


// User endpoints
router.post('/user/login', loginUser);
router.post('/user/register', registerUser);
router.post('/user/logout', logoutUser);
router.post('/user/edit-image', upload.single('image'), editImage);
router.post('/user/edit-profile', editProfile);
router.get('/user/profile', getUserProfile);
router.get('/user/username', getUsername);
router.get('/user/check-auth', checkAuth);

// Time machine endpoint
router.post('/time/set-time', setTime);
router.post('/time/reset-time', resetTime);
router.get('/time/fetchState', fetchState);

// Notification endpoints
router.post('/notification/new-notif', createNotification);
router.get('/notification/get-notifications', getNotifications);
router.put('/notification/read-notif/:notifId', markNotificationAsRead);

// Hub endpoint
//router.post('/hub/posts', createPost);
//router.get('/hub/posts', getPosts);

// Note endpoints
router.post('/note', createNote);
router.get('/notes', getNotes);
router.put('/note/:noteId', updateNote);
router.delete('/note/:noteId', deleteNote);


// Activity endpoints
router.post('/activity', createActivity);
router.get('/activities', getActivities);
router.put('/activity/:activityId', updateActivity);
router.delete('/activity/:activityId', deleteActivity);

// Event endpoints
router.post('/event', createEvent);
router.get('/events', getEvents);
router.put('/event/:eventId', updateEvent);
router.delete('/event/:eventId', deleteEvent);

module.exports = router;