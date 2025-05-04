const User = require('../models/userModel');
const Notification = require('../models/notificationModel');

const { getCurrentNow } = require('./timeMachineService');

const getScheduledJobs = async (userId, hours = 24) => {
    const now = getCurrentNow();
    const limit = new Date(now.getTime() + hours * 60 * 60 * 1000);

    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const notifications = await Notification.find({
        user: user._id,
        type: { $ne: 'now' },
        triggerAt: { $gte: now, $lte: limit },
        status: 'active'
    }).populate('element');

    const jobs = await Promise.all(notifications.map(async (notif) => {
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
            triggerAt: notif.triggerAt,
            to: new Date(notif.to),
            status: 'active',
        };
    }));

    console.log('Scheduled jobs:', jobs);
    return jobs;
}

const snoozeJob = async (notificationId, snoozeTime) => {
    const notification = await Notification.findById(notificationId);
    if (!notification) throw new Error('Notification not found');

    console.log('Snoozing notification:', notification);
    // let the user know that he can snooze only 3 times
    if (notification.snoozeSettings.count >= 3) throw new Error('You can snooze only 3 times');
    
    const snoozeUntil = new Date((notification.triggerAt || new Date()).getTime() + snoozeTime * 60 * 1000);

    if (notification.type === 'default'){
        notification.triggerAt = snoozeUntil;
        notification.snoozeSettings.until = snoozeUntil;
        notification.snoozeSettings.count += 1;
        notification.snooze = true;
        await notification.save();
    } else if (notification.type === 'repeat') {
        const timeString = snoozeUntil.toTimeString().slice(0, 5);

        await Notification.create({
            user: notification.user,
            element: notification.element,
            elementType: notification.elementType,
            type: 'default',
            triggerAt: snoozeUntil,
            time: timeString,
            urgency: notification.urgency,
            snoozeFather: notification._id,
            snoozeSettings: {
                count: 1,
                until: snoozeUntil
            },
            mode: notification.mode,
            status: 'active',
        });

        notification.snooze = true;
        notification.status = 'inactive';
        notification.snoozeSettings.count += 1;
        notification.snoozeSettings.until = snoozeUntil;
        await notification.save();
    }
}

module.exports = {
    getScheduledJobs,
    snoozeJob
};