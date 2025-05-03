const Notification = require('../models/notificationModel');
const agenda = require('./agenda');

const { sendSystemNotification, sendEmailNotification } = require('../services/notificationService');
const { getCurrentNow } = require('../services/timeMachineService');

const initScheduler = async () => {
    agenda.define('send-notification', async job => {
        console.log('🏁 SEND NOTIFICATION FIRED!');
        const notificationId = job.attrs.data.notification;
        const notification = await Notification.findById(notificationId).populate('element');
        if (!notification) {
            console.log(`Notification ${notificationId} not found.`);
            return;
        }
        const now = getCurrentNow();
        console.log('notification', notification);

        if (now < new Date(notification.from) || now > new Date(notification.to)) {
            console.log(`Notification ${notification._id.toString()} skipped, out of active window.`);
            return;
        }

        if (notification.type === 'repeat' && notification.snooze) {
            const snoozeUntil = new Date(notification.snoozeSettings.until);
            if (now < snoozeUntil) {
                console.log(`Notification ${notification._id.toString()} snoozed until ${snoozeUntil}`);
                return;
            } else {
                notification.snooze = false;
                notification.snoozeSettings.until = null;
                notification.snoozeSettings.count = 0;
                await notification.save();
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
            console.error(`Notification ${notification._id.toString()} failed:`, error);
        }
    });

    agenda.define('send-notification-now', async job => {
        const notificationId = job.attrs.data.notification;
        const notification = await Notification.findById(notificationId).populate('element');

        try {
            if (notification.mode.system) {
                await sendSystemNotification(notification);
            }
            if (notification.mode.email) {
                await sendEmailNotification(notification);
            }
            await job.remove();
            console.log(`Notification ${notification._id.toString()} sent and job removed.`);
        } catch (error) {
            console.error(`Notification ${notification._id.toString()} failed:`, error);
        }
    });

    agenda.define('cleanup-notifications', async job => {
        try {
            await cleanupExpiredSnoozes();
            await cleanupOutdatedJobs();
            console.log('Expired snoozes cleaned up');
        } catch (error) {
            console.error('Error cleaning up expired snoozes:', error);
        }
    });
    
    agenda.on('ready', async () => {
        await agenda.start();
        console.log('Notification scheduler started');
        agenda.every('1 hour', 'cleanup-notifications');
    });
};

const cleanupExpiredSnoozes = async () => {
    const now = getCurrentNow();

    const notifications = await Notification.find({ snooze: true, 'snoozeSettings.until': { $lt: now } });

    for (const notification of notifications) {

        notification.snooze = false;
        notification.snoozeSettings.until = null;
        notification.snoozeSettings.count = 0;
        await notification.save();

        const tempJob = await agenda.jobs({
            name: 'send-notification',
            'data.notification': notification._id.toString(),
            'data.isSnoozeJob': true,
        });

        if (tempJob.length > 0) {
            for (const job of tempJob) await job.remove();
        }
    }
}

const cleanupOutdatedJobs = async () => {
    const now = getCurrentNow();

    const jobs = await agenda.jobs({ name: 'send-notification' || 'send-notification-now' });
    for (const job of jobs) {
        const notification = await Notification.findById(job.attrs.data.notification);
        if (!notification) continue;

        if (job.attrs.name === 'send-notification' && (now > new Date(job.attrs.lastFinishedAt))){
            await job.remove();
            console.log(`Removed outdated job for notification ${notification._id.toString()}`);
        }
    }
}

const scheduleNotification = async (notifications) => {
    if (!notifications) {
        notifications = await Notification.find({ status: 'active', type: { $ne: 'now' } })
        if (!notifications || notifications.length === 0) return;
    }

    console.log('Scheduling notifications:', notifications);
    
    for (const notification of notifications) {
        if (notification.type === 'default') {
            defaultNotification(notification);
        } else if (notification.type === 'repeat') {
            repeatNotification(notification);
        } else if (notification.type === 'now') {
            const job = await agenda.schedule(getCurrentNow(), 'send-notification-now', { notification: notification._id.toString() });
            console.log("JOB RUNNING", job.attrs.type, job.attrs);
        }
    };
};

const defaultNotification = async (notification) => {
    const notificationTime = calculateNotificationTime(notification);

    const existingJobs = await agenda.jobs({ name: 'send-notification', 'data.notification': notification._id.toString() });
    if (existingJobs.length == 0) {
        const uniqueId = generateUniqueId();
        console.log('uniqueId', uniqueId);

        const job = await agenda.schedule(notificationTime, 'send-notification', { 
            notification: notification._id.toString(),
            uniqueId
        });
        console.log("JOB RUNNING", job.attrs.type, job.attrs);
    } else {
        console.log(`Notification ${notification._id.toString()} already scheduled.`);
    }
}

const repeatNotification = async (notification) => {
    const rule = `${notification.before} ${notification.variant}s`;

    const existingJobs = await agenda.jobs({ name: 'send-notification', 'data.notification': notification._id.toString() });

    if (existingJobs.length === 0) {
        const uniqueId = await generateUniqueId();
        
        const job = agenda.create('send-notification', {
            notification: notification._id.toString(),
            uniqueId,
        });

        job.repeatEvery(rule, {
            skipImmediate: true,
        });
        job.save();

        console.log("CREATING REPEATING JOB", {
            rule,
            data: { 
                notificationId: notification._id.toString(),
                uniqueId,
            }
        });
    } else console.log(`Notification ${notification._id.toString()} already scheduled.`);
}

const generateUniqueId = async () => {
    const { nanoid } = await import('nanoid');
    return nanoid(10);
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