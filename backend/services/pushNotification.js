const webPush = require('web-push');
const Subscription = require('../models/subscriptionModel');
const User = require('../models/userModel');

const vapidKeys = {
    publicKey: 'BNI2252O4XvM3IAQ_jF_U-dY_XZG3swWR60TYnUhBF-lTWhOWc2EvkBqaVceiQiF6xu89K8WCAPye4xf6e23EsE',
    privateKey: '_ZbL0MrzKHadQ59Mw2kXum0kNjXoOLxcFGbLhy3Sokk',
};

webPush.setVapidDetails(
    'mailto:kaorijiang88@gmail.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

const pushNotification = async (sender, receiver, message) => {
    const receiverId = await User.findOne({ username: receiver });
    const subscriptions = await Subscription.find({ user: receiverId });

    subscriptions.forEach(subscription => {
        const notificationPayload = JSON.stringify({
            title: `Notification from ${sender}`,
            body: message || 'You have a new notification!',
            icon: '/images/notification-icon.png', // Match the service worker icon
            badge: '/images/notification-badge.png', // Match the service worker badge
            url: 'http://localhost:3000',
        });
        
        console.log('subscription:', subscription);
        webPush.sendNotification(subscription.subscription, notificationPayload)
            .then(() => console.log('Notification sent'))
            .catch(error => console.error('Error sending notification:', error));
    });
}

module.exports = { pushNotification };