const Notification = require('../models/notificationModel');

// Create a new notification
const createNotification = async (req, res) => {
    const {sender, receivers, date, text} = req.body;
    try {
        const notification = new Notification({sender, receivers, date, text, read: false});
        await notification.save();
        res.status(201).json({ success: true, notification });
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({ success: false, message: 'Error creating notification' });
    }
}

// Get all notifications
const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ receivers: req.session.username });
        res.status(200).json({ success: true, notifications });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ success: false, message: 'Error fetching notifications' });
    }
}

// Mark a notification as read


module.exports = {
    createNotification,
    getNotifications,
};