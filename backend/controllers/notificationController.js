const Notification = require('../models/notificationModel');
const User = require('../models/userModel');

// Create a new notification: FUNZIONA
const createNotification = async (req, res) => {
    const {receivers, message} = req.body;

    if (!receivers || !message) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    try {
        const senderUsername = req.session.username;
        const senderUser = await User.findOne({ username: senderUsername });
        const senderObjectId = senderUser._id;

        const receiversObjectId = [];
        for (const receiver of receivers) {
            const receiverUser = await User.findOne({ username: receiver });
            if (!receiverUser) {
                return res.status(400).json({ success: false, message: `Invalid receiver username: ${receiver}` });
            }
            receiversObjectId.push(receiverUser._id);
        }

        const notification = new Notification({
            sender: senderObjectId,
            receivers: receiversObjectId,
            message,
            date: new Date(),
            read: receivers.map(() => false),
            responses: [], // array of responses
        });

        console.log(notification);
        await notification.save();
        res.status(201).json({ success: true, notification });
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({ success: false, message: 'Error creating notification' });
    }
}

// Get all notifications: FUNZIONA
const getNotifications = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.session.username });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid user' });
        }
        
        const notifications = await Notification.find({ receivers: user._id }).populate('sender', 'username').populate('receivers', 'username');
        res.status(200).json({ success: true, notifications });
    } catch (error) {
        console.error('Error fetching notifications:', error.message);
        res.status(500).json({ success: false, message: 'Error fetching notifications' });
    }
}

// Mark a notification as read: FUNZIONA
const markNotificationAsRead = async (req, res) => {
    try {
        const { notifId } = req.params;
        const username = req.session.username;
        const notification = await Notification.findById(notifId);

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        const receiver = await User.findOne({ username });
        const receiverIndex = notification.receivers.findIndex(r => r.equals(receiver._id));

        if (receiverIndex === -1) {
            return res.status(400).json({ success: false, message: 'User is not a receiver of the notification' });
        }

        notification.read[receiverIndex] = true;
        await notification.save();

        res.status(200).json({ success: true, notification });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ success: false, message: 'Error marking notification as read' });
    }
}

const markNotificationStatus = async (req, res) => {
    try {
        const { notifId } = req.params;
        const { status } = req.body;
        const username = req.session.username;

        const notification = await Notification.findById(notifId);
        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        const receiver = await User.findOne({ username });
        const receiverIndex = notification.responses.findIndex(r => r.receiver.equals(receiver._id));

        if (receiverIndex !== -1) {
            return res.status(400).json({ success: false, message: 'Response has already been submitted' });
        }

        notification.responses.push({ receiver: receiver._id, status });
        await notification.save();

        res.status(200).json({ success: true, message: 'Notification status marked' });
    } catch (error) {
        console.error('Error marking notification status:', error);
        res.status(500).json({ success: false, message: 'Error marking notification status' });
    }
};

module.exports = {
    createNotification,
    getNotifications,
    markNotificationAsRead,
    markNotificationStatus,
};