const express = require('express');

const { setNotifications, getNotifications, deleteNotification, updateNotification, getScheduledNotifications, snoozeNotification, getPastNotifications } = require('../controllers/notificationController')

const router = express.Router();

// Notification endpoints
router.post('/notification', setNotifications);
router.get('/notifications/upcoming', getScheduledNotifications);
router.get('/notifications/history', getPastNotifications);
router.get('/notifications/:elementId', getNotifications);
router.delete('/notification/:notificationId', deleteNotification);
router.put('/notification/snooze/:notificationId', snoozeNotification);
router.put('/notification/:notificationId', updateNotification);

module.exports = router;