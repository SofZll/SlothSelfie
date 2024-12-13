const Notification = require('../models/notificationModel');
const User = require('../models/userModel');
const Activity = require('../models/activityModel');
const Event = require('../models/eventModel');
const { calculateDate } = require('../utils/utils');

// Create a new notification: FUNZIONA
const createNotification = async (req, res, internalCall = false) => {
    let activityId, eventId, receivers, message;

    console.log('Request Body:', req.body);
    console.log('Internal Call:', internalCall);

    if (internalCall) ({ activityId, eventId, receivers, message } = req)
    else ({ activityId, eventId, receivers, message } = req.body)

    console.log({ activityId, eventId, receivers, message });
    try {
        const senderUsername = internalCall ? await getSenderUsername({ activityId, eventId }) : req.session.username;
        console.log(senderUsername);
        const senderUser = await User.findOne({ username: senderUsername });
        console.log(senderUser);
        const notificationData = internalCall ? await getDataInternal({ activityId, eventId }) : await getDataStandard({ receivers, message });
        console.log(notificationData);
        const { message: messageVal, receiversObjectId, activity, dateNotif} = notificationData;
        const notification = new Notification({
            sender: senderUser._id,
            receivers: receiversObjectId,
            message: messageVal,
            createdAt: new Date(),
            read: receiversObjectId.map(() => false),
            activity: activity ? activity._id : null,
            dateNotif: dateNotif,
            responses: [],
        });

        // creazione notifica schedule

        console.log(notification);
        await notification.save();
        if (!internalCall) res.status(201).json({ success: true, notification });
    } catch (error) {
        console.error('Error creating notification:', error);
        if (!internalCall) res.status(500).json({ success: false, message: 'Error creating notification' });
    }
}

const getSenderUsername = async ({ activityId, eventId }) => {
    if (activityId) {
        console.log(activityId);
        const activity = await Activity.findOne({ _id: activityId }).populate('user');
        console.log(activity);
        console.log(activity.user);
        return activity.user.username;
    } else {
        /*
        const event = await Event.findOne({ _id: eventId });
        return event.user.username;
        */
    }
}

const getDataInternal = async ({ activityId, eventId }) => {
    if (activityId) {
        const activity = await Activity.findOne({ _id: activityId }).populate('user');
        if (!activity) return null;

        const deadlineDate = new Date(activity.deadline);
        const formattedDeadline = `${deadlineDate.getFullYear()}-${String(deadlineDate.getMonth() + 1).padStart(2, '0')}-${String(deadlineDate.getDate()).padStart(2, '0')} ${String(deadlineDate.getHours()).padStart(2, '0')}:${String(deadlineDate.getMinutes()).padStart(2, '0')}`;
        const message = `Activity: ${activity.title} - Deadline: ${formattedDeadline}`;
        const dateNotif = calculateDate(activity.deadline, activity.notificationTime);

        return {
            message,
            receiversObjectId: [activity.user._id],
            activity,
            dateNotif,
        };
    } else if (eventId) {
        // TODO
    }
    return null;
}

const getDataStandard = async ({ receivers, message }) => {
    if (!receivers || !message) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const receiversObjectId = [];
    for (const receiver of receivers) {
        const receiverUser = await User.findOne({ username: receiver });
        if (!receiverUser) {
            return res.status(400).json({ success: false, message: `Invalid receiver username: ${receiver}` });
        }
        receiversObjectId.push(receiverUser._id);
    }

    return {
        message,
        receiversObjectId,
        activity: null,
        dateNotif: null,
    };
}

// Get all notifications: FUNZIONA
const getNotifications = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.session.username });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid user' });
        }
        
        const notifications = await Notification.find({ receivers: user._id }).populate('sender', 'username').populate('receivers', 'username');

        const notificationsWithDate = notifications.map(notification => ({
            ...notification.toObject(),
            date: notification.createdAt
        }));

        res.status(200).json({ success: true, notifications: notificationsWithDate });
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

const markAllAsRead = async (req, res) => {
    try {
        const username = req.session.username;
        const user = await User.findOne({ username });

        const notifications = await Notification.find({ receivers: user._id });

        for (const notification of notifications) {
            const receiverIndex = notification.receivers.findIndex(r => r.equals(user._id));
            notification.read[receiverIndex] = true;
            await notification.save();
        }

        res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (error){
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ success: false, message: 'Error marking all notifications as read' });
    }
};

module.exports = {
    createNotification,
    getNotifications,
    markNotificationAsRead,
    markNotificationStatus,
    markAllAsRead,
};