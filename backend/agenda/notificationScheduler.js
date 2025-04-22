const Notification = require('../models/notificationModel');
const Activity = require('../models/activityModel');
const Event = require('../models/eventModel');
const agenda = require('./agenda');

const { sendSystemNotification, sendEmailNotification } = require('../services/notificationService');

const initScheduler = async () => {
    agenda.define('send-notification', async job => {
        const notification = job.attrs.data.notification;
        const now = new Date(); // da cambiare con TM

        if (now < new Date(notification.from) || now > new Date(notification.to)) {
            console.log(`Notification ${notification._id} skipped, out of active window.`);
            return;
        }

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

const scheduleNotification = async (notifications) => {
    if (!notifications) {
        notifications = await Notification.find({ status: 'active' });
        if (!notifications || notifications.length === 0) return;
    }

    console.log('Scheduling notifications:', notifications);
    
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
    console.log("JOB RUNNING", job.attrs.type, job.attrs);
}

const repeatNotification = async (notification) => {
    const rule = `${notification.before} ${notification.variant}s`;

    const existingJobs = await agenda.jobs({ name: 'send-notification', 'data.notification._id': notification._id });

    if (existingJobs.length === 0) {
        agenda.every( rule, 'send-notification', { notification }, { 
            skipImmediate: true, 
            timezone: 'Europe/Rome',
            unique: { 'data.notification._id': notification._id },
        });
        console.log("CREATING REPEATING JOB", {
            rule,
            data: { notificationId: notification._id.toString() }
        });
    } else console.log(`Notification ${notification._id} already scheduled.`);
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

module.exports = {
    initScheduler,
    scheduleNotification,
};