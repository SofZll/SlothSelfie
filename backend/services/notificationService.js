const Notification = require('../models/notificationModel');
const { getIO } = require('../socket/socket');

const sendSystemNotification = async (notification) => {
    const io = getIO();

    let body = '';
    if (notification.type != 'now') {
        body = `il tuo ${notification.element.type.toLowerCase()} "${notification.element.title}" scade il ${new Date(notification.to).toLocaleString()}`;
    } else {
        body = `il tuo ${notification.element.type.toLowerCase()} "${notification.element.title}" è stato modificato`;
    }

    const payload = {
        title: notification.element.title,
        body,
        notificationId: notification._id
    };

    io.to(notification.user._id).emit('system-notification', payload);
    console.log('Sending system notification:', payload);

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