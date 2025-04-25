const Notification = require('../models/notificationModel');
const Activity = require('../models/activityModel');
const Event = require('../models/eventModel');
const agenda = require('./agenda');

const { sendSystemNotification, sendEmailNotification } = require('../services/notificationService');

const initScheduler = async () => {
    agenda.define('send-notification', async job => {
        const notificationId = job.attrs.data.notification;
        const notification = await Notification.findById(notificationId).populate('element');
        if (!notification) {
            console.log(`Notification ${notificationId} not found.`);
            return;
        }
        const now = new Date(); // da cambiare con TM
        console.log('notification', notification);

        if (now < new Date(notification.from) || now > new Date(notification.to)) {
            console.log(`Notification ${notification._id} skipped, out of active window.`);
            return;
        }

        if (notification.type === 'repeat' && notification.snooze) {
            const snoozeUntil = new Date(notification.snoozeUntil);
            if (now < snoozeUntil) {
                console.log(`Notification ${notification._id} snoozed until ${snoozeTime}`);
                return;
            } else {
                notification.snooze = false;
                notification.snoozeUntil = null;
                notification.snoozeCount = 0;
                await notification.save();

                const mainJobs = await agenda.jobs({ 
                    name: 'send-notification', 
                    'data.notification._id': notification._id,
                    'attrs.disabled': true
                });

                if (mainJobs.length > 0) {
                    const mainJob = mainJobs[0];
                    mainJob.attrs.disabled = false;
                    await mainJob.save();
                }
            }
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

    agenda.define('send-notification-now', async job => {
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

    agenda.define('cleanup-notifications-snoozes', async job => {
        try {
            await cleanupExpiredSnoozes();
            console.log('Expired snoozes cleaned up');
        } catch (error) {
            console.error('Error cleaning up expired snoozes:', error);
        }
    });
    
    agenda.on('ready', async () => {
        await agenda.start();
        console.log('Notification scheduler started');
        agenda.every('1 hour', 'cleanup-notifications-snoozes');
    });
};

const cleanupExpiredSnoozes = async () => {
    const now = new Date();

    const notifications = await Notification.find({ snooze: true, snoozeUntil: { $lt: now } });

    for (const notification of notifications) {
        const mainJobs = await agenda.jobs({ 
            name: 'send-notification', 
            'data.notification._id': notification._id,
            'attrs.disabled': true
        });

        if (mainJobs.length > 0) {
            const mainJob = mainJobs[0];
            mainJob.attrs.disabled = false;
            await mainJob.save();
        }

        notification.snooze = false;
        notification.snoozeUntil = null;
        notification.snoozeCount = 0;
        await notification.save();

        const tempJob = await agenda.jobs({
            name: 'send-notification',
            'data.notification._id': notification._id,
            nextRunAt: { $lte: now },
        });

        if (tempJob.length > 0) {
            for (const job of tempJob) await job.remove();
        }
    }
    console.log('Expired snoozes cleaned up');
}

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
        } else if (notification.type === 'now') {
            const job = await agenda.schedule(new Date(), 'send-notification-now', { notification: notification._id });
            console.log("JOB RUNNING", job.attrs.type, job.attrs);
        }
    });
};

const defaultNotification = async (notification) => {
    const notificationTime = calculateNotificationTime(notification);

    const existingJobs = await agenda.jobs({ name: 'send-notification', 'data.notification': notification._id });
    if (existingJobs.length == 0) {
        const job = await agenda.schedule(notificationTime, 'send-notification', { notification: notification._id });
        console.log("JOB RUNNING", job.attrs.type, job.attrs);
    } else {
        console.log(`Notification ${notification._id} already scheduled.`);
    }
}

const repeatNotification = async (notification) => {
    const rule = `${notification.before} ${notification.variant}s`;

    const existingJobs = await agenda.jobs({ name: 'send-notification', 'data.notification': notification._id });

    if (existingJobs.length === 0) {
        agenda.every( rule, 'send-notification', { notification: notification._id }, { 
            skipImmediate: true, 
            timezone: 'Europe/Rome',
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
    scheduleNotification
};