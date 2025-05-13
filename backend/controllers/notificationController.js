const Notification = require('../models/notificationModel');
const User = require('../models/userModel');
const Activity = require('../models/activityModel');
const Event = require('../models/eventModel');

const { combineDateTime } = require('../utils/utils');
const { getScheduledJobs, snoozeJob } = require('../services/jobService');
const { calculateNotificationTime, getRepeatInterval } = require('../services/notificationService');
const { getCurrentNow } = require('../services/timeMachineService');

const setNotifications = async (req, res) => {
    const { type, elementId, notifications } = req.body;
    const userId = req.session.userId;
    const now = getCurrentNow();
    
    if (!notifications || notifications.length === 0) return res.status(400).json({ success: false, message: 'No notifications provided' });

    try {
        let element, to;
        if (type === 'Activity') {
            element = await Activity.findById(elementId);
            to = element.deadline;
        } else if (type === 'Event') {
            element = await Event.findById(elementId);
            to = element.endDate;
        }
        if (!element) return res.status(404).json({ success: false, message: 'Element not found' });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const newNotifications = notifications.map(notification => {
            const isDefault = notification.type === 'default';

            return {
                user: user._id,
                element: element._id,
                elementType: type,
                type: notification.type,
                mode: notification.mode,
                before: notification.before,    
                variant: notification.variant,
                time: isDefault ? notification.time : undefined,
                from: !isDefault ? combineDateTime(notification.fromDate, notification.fromTime) : now,
                to: to,
                lastSentAt: isDefault ? undefined : now,
                createdAt: now,
                updatedAt: now
            }
        });

        const savedNotifications = await Notification.insertMany(newNotifications);

        res.status(201).json({ success: true, message: 'Notifications created successfully', notifications: savedNotifications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const getScheduledNotifications = async (req, res) => {
    const userId = req.session.userId;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const scheduledNotifications = await getScheduledJobs(userId);
        
        const filteredNotifications = scheduledNotifications.filter(n => n && n.triggerAt && n.status === 'active');
        filteredNotifications.sort((a, b) => new Date(a.triggerAt) - new Date(b.triggerAt));

        res.status(200).json({ success: true, notifications: scheduledNotifications });
    } catch (error) {
        console.error('Error fetching scheduled notifications:', error);
        res.status(500).json({ success: false, message: error.message });
    }
}

const getPastNotifications = async (req, res) => {
    const userId = req.session.userId;
    const now = getCurrentNow();

    try {
        const notifications = await Notification.find({
            user: userId,
            createdAt: { $lte: now },
            $or: [
                { type: 'default', status: 'inactive' },
                { type: 'repeat', lastSentAt: { $lte: now } },
                { type: 'now' }
            ]
        })
        .populate('element')
        .sort({ createdAt: -1 });

        if (!notifications) return res.status(404).json({ success: false, message: 'No notifications found' });

        const notificationsSelected = notifications.map(notification => {
            return {
                _id: notification._id,
                type: notification.type,
                mode: notification.mode,
                element: notification.element,
                elementType: notification.elementType,
                text: notification.text,
                urgency: notification.urgency,
            }
        });

        res.status(200).json({ success: true, notifications: notificationsSelected });
    } catch (error) {
        console.error('Error fetching past notifications:', error);
        res.status(500).json({ success: false, message: error.message });
    }
}

const getNotifications = async (req, res) => {
    const { elementId } = req.params;
    const userId = req.session.userId;
    const now = getCurrentNow();

    if (!elementId) return res.status(400).json({ success: false, message: 'No element ID provided' });

    try {
        const notifications = await Notification.find({ 
            element: elementId, 
            user: userId, 
            createdAt: { $lte: now },
            urgency: { $ne: true },
            type: { $ne: 'now' }
        })
        .populate('user', 'username')
        .sort({ createdAt: -1 });

        if (!notifications) return res.status(404).json({ success: false, message: 'No notifications found' });

        const notificationsSelected = notifications.map(notification => {
            return {
                _id: notification._id,
                type: notification.type,
                mode: notification.mode,
                variant: notification.variant,
                before: notification.before,
                time: notification.time,
                from: notification.from,
            }
        });

        res.status(200).json({ success: true, notifications: notificationsSelected });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const deleteNotification = async (req, res) => {
    const { notificationId } = req.params;

    if (!notificationId) return res.status(400).json({ success: false, message: 'No notification ID provided' });

    try {
        const notification = await Notification.findByIdAndDelete(notificationId);
        
        if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });

        res.status(200).json({ success: true, message: 'Notification deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const updateNotification = async (req, res) => {
    const { notificationId } = req.params;
    const { type, mode, variant, before } = req.body;
    let fromDate, fromTime, time;

    if (type === 'default') {
        time = req.body.time;
        if (!time) return res.status(400).json({ success: false, message: 'Time is required' });
    } else {
        fromDate = req.body.fromDate;
        fromTime = req.body.fromTime;
        if (!fromDate || !fromTime) return res.status(400).json({ success: false, message: 'From date and time are required' });
    }

    if (!notificationId) return res.status(400).json({ success: false, message: 'No notification ID provided' });

    try {
        const notification = await Notification.findById(notificationId);

        let element, to;
        if (notification.elementType === 'Activity') {
            element = await Activity.findById(notification.element);
            to = element.deadline;
        } else if (notification.elementType === 'Event') {
            element = await Event.findById(notification.element);
            to = element.endDate;
        }
        if (!element) return res.status(404).json({ success: false, message: 'Element not found' });
                
        if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
        
        const isDefault = type === 'default';
        const updatedNotification = await Notification.findByIdAndUpdate(notificationId, {
            type,
            mode,
            variant,
            before,
            time: isDefault ? time : undefined,
            from: !isDefault ? combineDateTime(fromDate, fromTime) : undefined,
            to: to,
            updatedAt: getCurrentNow()
        }, { new: true });
s
        await updatedNotification.save();

        res.status(200).json({ success: true, message: 'Notification updated successfully', notification: updatedNotification });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const snoozeNotification = async (req, res) => {
    const { notificationId } = req.params;
    const { snoozeInterval = 10 } = req.body;

    if (!notificationId) return res.status(400).json({ success: 'false', message: 'No notification ID provided' });
    if (!snoozeInterval) return res.status(400).json({ success: 'false', message: 'Snooze time is required' });

    try {
        await snoozeJob(notificationId, snoozeInterval);
        res.status(200).json({ success: true, message: 'Notification snoozed successfully'});
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = {
    setNotifications,
    getNotifications,
    deleteNotification, 
    updateNotification,
    getScheduledNotifications,
    snoozeNotification,
    getPastNotifications
};