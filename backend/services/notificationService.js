const Notification = require('../models/notificationModel');

const sendSystemNotification = async (notification) => {

    console.log('Sending system notification:', notification);

    if (notification.type === 'default') {
        await Notification.findByIdAndUpdate(notification._id, { status: 'inactive' });
    }
}

const sendEmailNotification = async (notification) => {
    console.log('Sending email notification:', notification);

    if (notification.type === 'default') {
        await Notification.findByIdAndUpdate(notification._id, { status: 'inactive' });
    }
}

module.exports = {
    sendSystemNotification,
    sendEmailNotification,
};