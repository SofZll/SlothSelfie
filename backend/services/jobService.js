const User = require('../models/userModel');
const Notification = require('../models/notificationModel');
const Activity = require('../models/activityModel');

const { getCurrentNow } = require('./timeMachineService');
const { getTriggerAt, getUrgencyFrequency } = require('./notificationService');

const getScheduledJobs = async (userId, hours = 24) => {
    const now = getCurrentNow();
    const limit = new Date(now.getTime() + hours * 60 * 60 * 1000); // 24 hours from now

    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const notifications = await Notification.find({
        user: user._id,
        type: { $ne: 'now' },
        from: { $lte: now },
        to: { $gte: now },
        status: 'active',
        createdAt: { $lte: now },
    }).populate('element');

    const filtered = notifications.filter(notif => {
        return !(notif.type === 'repeat' && notif.status === 'inactive' && notif.snooze);
    });

    const jobs = await Promise.all(filtered.map(async (notif) => {
        const triggerAt = new Date(getTriggerAt(notif, now));
        console.log('Trigger at:', triggerAt);

        if (triggerAt > limit || triggerAt < now) return null;

        return {
            _id: notif._id,
            notificationId: notif._id,
            type: notif.type,
            elementType: notif.elementType,
            element: notif.element,
            mode: notif.mode,
            before: notif.before,
            variant: notif.variant,
            urgency: notif.urgency,
            snooze: notif.snooze,
            triggerAt: triggerAt,
            to: new Date(notif.to),
            status: 'active',
        };
    }));

    return jobs.filter(job => job !== null);
}

const snoozeJob = async (notificationId, snoozeTime) => {
    const now = getCurrentNow();
    const notification = await Notification.findById(notificationId);
    if (!notification) throw new Error('Notification not found');

    // let the user know that he can snooze only 3 times
    if (notification.snoozeSettings.count >= 3) throw new Error('You can snooze only 3 times');

    let snoozeUntil = null;
    if (notification.snoozeSettings.until !== null) { // if the notification is already snoozed
        snoozeUntil = new Date(notification.snoozeSettings.until.getTime() + snoozeTime * 60 * 1000);
    } else {
        const triggerAt = new Date(getTriggerAt(notification, now));
        snoozeUntil = new Date(triggerAt.getTime() + snoozeTime * 60 * 1000);
    }

    const timeString = snoozeUntil.toLocaleTimeString('it-IT', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Rome'
    });

    if (notification.type === 'default'){
        notification.snoozeSettings.until = snoozeUntil;
        notification.snoozeSettings.count += 1;
        notification.snooze = true;
        notification.time = timeString;
        notification.updatedAt = now;
        await notification.save();
    } else if (notification.type === 'repeat') {
        const snoozeNotif = await Notification.create({
            user: notification.user,
            element: notification.element,
            elementType: notification.elementType,
            type: 'default',
            time: timeString,
            from: notification.from,
            to: notification.to,
            urgency: notification.urgency,
            snoozeFather: notification._id,
            snoozeSettings: {
                count: 1,
                until: snoozeUntil
            },
            mode: notification.mode,
            status: 'active',
            createdAt: now,
            updatedAt: now
        });

        console.log('Snoozed notification:', snoozeNotif);

        notification.snooze = true;
        notification.status = 'inactive';
        notification.snoozeSettings.count += 1;
        notification.snoozeSettings.until = snoozeUntil;
        notification.updatedAt = now;
        await notification.save();
    }
}

module.exports = {
    getScheduledJobs,
    snoozeJob
};