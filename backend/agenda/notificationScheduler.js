const Notification = require('../models/notificationModel');
const Activity = require('../models/activityModel');
const Event = require('../models/eventModel');
const agenda = require('./agenda');

const { sendSystemNotification, sendEmailNotification } = require('../services/notificationService');

const initScheduler = async () => {
    agenda.define('send-notification', async job => {
        const notification = job.attrs.data.notification;
        try {
            if (notification.mode.system) {
                await sendSystemNotification(notification);
            }
            if (notification.mode.email) {
                await sendEmailNotification(notification);
            }
        } catch (error) {
            console.error(`Notification ${notification._id} failed:`, error);
        }
    });
    
    agenda.on('ready', async () => {
        await agenda.start();
        console.log('Notification scheduler started');
    });
};

const scheduleNotification = async () => {
    const notifications = await Notification.find({ status: 'active' });
    
    notifications.forEach(async (notification) => {
        if (notification.type === 'default') {
            defaultNotification(notification);
        } else if (notification.type === 'repeat') {
            repeatNotification(notification);
        }
    });
};

const defaultNotification = async (notification) => {
    const notificationTime = calculateNotificationTime(notification);

    agenda.schedule(notificationTime, 'send-notification', { notification });
}

const repeatNotification = async (notification) => {
    const rule = createRule(notification);

    agenda.every( rule, 'send-notification', { notification }, { skipImmediate: true, timezone: 'Europe/Rome' });
}

const calculateNotificationTime = (notification) => {
    const notificationTime = new Date(notification.to);

    switch (notification.variant) {
        case 'day':
            notificationTime.setDate(notificationTime.getDate() - notification.before);
            break;
        case 'week':
            notificationTime.setDate(notificationTime.getDate() - (notification.before * 7));
            break;
    }

    const [hours, minutes] = notification.time.split(':');
    notificationTime.setHours(hours, minutes, 0, 0);

    return notificationTime;
}

const createRule = (notification) => {
    const rule = {
        startDate: new Date(notification.from),
        endDate: new Date(notification.to),
        skipImmediate: true,
        timezone: 'Europe/Rome'
    };

    console.log('Rule:', rule);
    console.log('Notification:', notification);
    console.log('Notification variant:', notification.variant);

    switch (notification.variant) {
        case 'minute':
            rule.rule = `every ${notification.before} minutes`;
            break;
        case 'hour':
            rule.rule = `every ${notification.before} hours`;
            break;
        case 'day':
            rule.rule = `every ${notification.before} days`;
            break;
        case 'week':
            rule.rule = `every ${notification.before} weeks`;
            break;
        default:
            throw new Error('Invalid variant');
    }

    return rule;
}

module.exports = {
    initScheduler,
    scheduleNotification,
};