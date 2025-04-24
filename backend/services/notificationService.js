const Notification = require('../models/notificationModel');
const Subscription = require('../models/subscriptionModel');
const webPush = require('web-push');
const { getIO } = require('../socket/socket');

const sendSystemNotification = async (notification) => {
    // internal notification
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
        notificationId: notification._id,
        url: 'http://localhost:3000',
    };

    io.to(notification.user._id).emit('system-notification', payload);
    console.log('Sending system notification:', payload);

    // web push notification
    webPush.setVapidDetails(
        'mailto:kaorijiang88@gmail.com',
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY,
    );

    const subscriptions = await Subscription.find({ user: notification.user._id });
    subscriptions.forEach(subscription => {
        const pushPayload = JSON.stringify(payload);

        console.log('subscription:', subscription);
        webPush.sendNotification(subscription.subscription, payload)
            .then(() => console.log('Notification sent'))
            .catch(error => console.error('Error sending notification:', error));
    });

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