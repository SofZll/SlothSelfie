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
                elementId: element._id,
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

module.exports = {
    setNotifications,
};