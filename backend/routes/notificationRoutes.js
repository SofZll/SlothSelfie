const express = require('express');

const { setNotifications } = require('../controllers/notificationController')

const router = express.Router();

// Notification endpoints
router.post('/notification', setNotifications);

/*
router.get('/notification/get-notifications', getNotifications);
router.put('/notification/read-notif/:notifId', markNotificationAsRead);
router.put('/notification/status-notif/:notifId', markNotificationStatus);
router.put('/notification/close-all', markAllAsRead);
*/

module.exports = router;