const Notification = require('../models/notificationModel');
const Subscription = require('../models/subscriptionModel');
const User = require('../models/userModel');
const webPush = require('web-push');
const { getIO } = require('../socket/socket');

const sendSystemNotification = async (notification) => {
    // internal notification
    const io = getIO();
    const user = await User.findById(notification.user._id);
    if (!user) {
        console.error('User not found:', notification.user._id);
        return;
    }

    let body = '';
    if (notification.type != 'now') {
        body = `il tuo ${notification.elementType} "${notification.element.title}" scade il ${new Date(notification.to).toLocaleString()}`;
    } else {
        body = `il tuo ${notification.elementType} "${notification.element.title}" è stato modificato`;
    }

    const payload = {
        title: notification.element.title,
        body,
        notificationId: notification.id,
        url: 'http://localhost:3000',
    };

    console.log('user:', user);
    io.to(user.id).emit('system-notification', payload);
    console.log('Sending system notification:', payload);

    // web push notification
    webPush.setVapidDetails(
        'mailto:kaorijiang88@gmail.com',
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY,
    );

    const subscriptions = await Subscription.find({ user: user._id });
    subscriptions.forEach(subscription => {
        const pushPayload = JSON.stringify(payload);

        console.log('subscription:', subscription);
        webPush.sendNotification(subscription.subscription, pushPayload)
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