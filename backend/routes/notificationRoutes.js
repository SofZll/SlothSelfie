const express = require('express');

const { createNotification, getNotifications, markNotificationAsRead, markNotificationStatus, markAllAsRead} = require('../controllers/notificationController')

const router = express.Router();

// Notification endpoints
router.post('/notification/new-notif', (req, res) => { createNotification(req, res, false) });
router.get('/notification/get-notifications', getNotifications);
router.put('/notification/read-notif/:notifId', markNotificationAsRead);
router.put('/notification/status-notif/:notifId', markNotificationStatus);
router.put('/notification/close-all', markAllAsRead);

module.exports = router;