const Notification = require('../models/notificationModel');
const User = require('../models/userModel');
const Activity = require('../models/activityModel');
const Event = require('../models/eventModel');

const { combineDateTime } = require('../utils/utils');

const setNotifications = async (req, res) => {
    const { type, elementId, notifications } = req.body;
    const userId = req.session.userId;
    
    if (!notifications || notifications.length === 0) return res.status(400).json({ message: 'No notifications provided' });

    try {
        let element, to;
        if (type === 'Activity') {
            element = await Activity.findById(elementId);
            to = element.deadline;
        } else if (type === 'Event') {
            element = await Event.findById(elementId);
            to = element.endDate;
        }
        if (!element) return res.status(404).json({ message: 'Element not found' });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const newNotifications = notifications.map(notification => {
            const isDefault = notification.type === 'default';

            return {
                user: user._id,
                element: element._id,
                elementType: type,
                type: notification.type,
                mode: notification.mode,
                before: isDefault ? notification.before : undefined,
                variant: notification.variant,
                time: isDefault ? notification.time : undefined,
                from: !isDefault ? combineDateTime(notification.fromDate, notification.fromTime) : undefined,
                to: to
            }
        });

        console.log('New notifications:', newNotifications);

        const savedNotifications = await Notification.insertMany(newNotifications);

        res.status(201).json({ success: true, message: 'Notifications created successfully', notifications: savedNotifications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const getNotifications = async (req, res) => {
    const { elementId } = req.params;
    const userId = req.session.userId;

    if (!elementId) return res.status(400).json({ message: 'No element ID provided' });

    try {
        const notifications = await Notification.find({ element: elementId, user: userId })
            .populate('user', 'username')
            .sort({ createdAt: -1 });

        if (!notifications) return res.status(404).json({ message: 'No notifications found' });

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

    if (!notificationId) return res.status(400).json({ message: 'No notification ID provided' });

    try {
        const notification = await Notification.findByIdAndDelete(notificationId);

        if (!notification) return res.status(404).json({ message: 'Notification not found' });

        res.status(200).json({ success: true, message: 'Notification deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const updateNotification = async (req, res) => {
    const { notificationId } = req.params;
    const { type, mode, variant } = req.body;
    let fromDate, fromTime, before, time;

    if (type === 'default') {
        before = req.body.before;
        time = req.body.time;
        if (!before || !time) return res.status(400).json({ message: 'Before and time are required' });
    } else {
        fromDate = req.body.fromDate;
        fromTime = req.body.fromTime;
        if (!fromDate || !fromTime) return res.status(400).json({ message: 'From date and time are required' });
    }

    if (!notificationId) return res.status(400).json({ message: 'No notification ID provided' });

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
        if (!element) return res.status(404).json({ message: 'Element not found' });
                
        if (!notification) return res.status(404).json({ message: 'Notification not found' });
        
        const isDefault = type === 'default';
        const updatedNotification = await Notification.findByIdAndUpdate(notificationId, {
            type,
            mode,
            variant,
            before: isDefault ? before : undefined,
            time: isDefault ? time : undefined,
            from: !isDefault ? combineDateTime(fromDate, fromTime) : undefined,
            to: to
        }, { new: true });

        res.status(200).json({ success: true, message: 'Notification updated successfully', notification: updatedNotification });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}


module.exports = {
    setNotifications,
    getNotifications,
    deleteNotification, 
    updateNotification
};