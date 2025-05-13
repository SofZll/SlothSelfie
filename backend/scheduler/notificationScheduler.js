const Notification = require('../models/notificationModel');
const User = require('../models/userModel');
const Event = require('../models/eventModel');
const Activity = require('../models/activityModel');

const { sendSystemNotification, sendEmailNotification, calculateNotificationTime, getRepeatInterval, checkUrgency } = require('../services/notificationService');
const { getCurrentNow } = require('../services/timeMachineService');

const INTERVAL = 15000; // 15 seconds

const startVirtualScheduler = () => {
    setInterval(async () => {
        const now = getCurrentNow();
        const activeNotifications = await Notification.find({
            type: { $ne: 'now' },
            from: { $lte: now },
            to: { $gte: now },
            createdAt: { $lte: now },
            urgency: { $ne: true }
        });

        if (activeNotifications && activeNotifications.length > 0) {
            for (const notification of activeNotifications) {
                const user = await User.findById(notification.user);
                if (!user) {
                    console.error('User not found:', notification.user._id);
                    continue;
                }

                if (await shouldSendNotification(notification, now, user)) {
                    try {
                        if (notification.mode.system && !user.disableNotifications.system) await sendSystemNotification(notification);
                        if (notification.mode.email && !user.disableNotifications.email) await sendEmailNotification(notification);

                        if (notification.type === 'default') notification.status = 'inactive';
                        else if (notification.type === 'repeat') notification.lastSentAt = now;

                        await notification.save();
                    } catch (error) {
                        console.error(`Notification ${notification._id.toString()} failed:`, error);
                    }
                    console.log(`Notification ${notification._id.toString()} sent.`);
                }
            }
        }

        const expiredActivities = await Activity.find({
            deadline: { $lt: now },
            completed: false
        });

        if (expiredActivities && expiredActivities.length > 0) {
            for (const activity of expiredActivities) {
                const notification = await Notification.findOne({
                    element: activity._id,
                    elementType: 'Activity',
                    urgency: true,
                });

                if (!notification) {
                    const newNotification = new Notification({
                        user: activity.user,
                        element: activity._id,
                        elementType: 'Activity',
                        type: 'default',
                        mode: { system: true, email: false },
                        urgency: true,
                        urgencySettings: { frequency: '1d' },
                        from: now,
                        to: null,
                        status: 'active',
                        lastSentAt: now,
                        createdAt: now,
                        updatedAt: now
                    });

                    await newNotification.save();
                    console.log(`Urgent notification for activity ${activity._id.toString()} created.`);
                } else {
                    const user = await User.findById(notification.user);
                    if (!user) {
                        console.error('User not found:', notification.user._id);
                        continue;
                    }

                    const shouldSend = checkUrgency(notification.lastSentAt, activity.deadline, now);

                    if (shouldSend && !disabledNotification(notification, user) && !user.disableNotifications.urgency) {
                        try {
                            if (notification.mode.system && !user.disableNotifications.system) await sendSystemNotification(notification);
                            if (notification.mode.email && !user.disableNotifications.email) await sendEmailNotification(notification);
                
                            notification.lastSentAt = now;
                            await notification.save();
                
                            console.log(`Urgency reminder for activity ${activity._id.toString()} resent.`);
                        } catch (err) {
                            console.error(`Urgent resend failed for ${activity._id}:`, err);
                        }
                    }
                }
            }
        }
    }, INTERVAL);
};

const disabledNotification = async (notification, user) => {
    const now = getCurrentNow();

    if (user.disableNotifications.all) {
        return true;
    }

    if (user.disableNotifications.outsideDayHours) {
        const [startHour, startMinute] = user.dayHours.start.split(':').map(Number);
        const [endHour, endMinute] = user.dayHours.end.split(':').map(Number);
    
        const startTime = new Date(now);
        startTime.setHours(startHour, startMinute, 0, 0);
    
        const endTime = new Date(now);
        endTime.setHours(endHour, endMinute, 0, 0);
    
        const nowTime = new Date(now);
    
        if (nowTime < startTime || nowTime > endTime) {
            console.log(`Notification ${notification._id.toString()} skipped, outside day hours.`);
            return true;
        }
    }
}

const shouldSendNotification = async (notification, now, user) => {
    if (notification.status === 'inactive' && getCurrentNow() < notification.to) {
        notification.status = 'active';
        await notification.save();
    }

    if (disabledNotification(notification, user)) {
        console.log(`Notification ${notification._id.toString()} disabled.`);
        return false;
    }

    if (notification.elementType === 'event') {
        const elementId = notification.element;
        const element = await Event.findById(elementId);
        if (!element) {
            console.log(`Element ${elementId} not found.`);
            return false;
        }

        if (element.type === 'work' && user.disableNotifications.outsideWorkingHours) {
            const [startHour, startMinute] = user.workingHours.start.split(':').map(Number);
            const [endHour, endMinute] = user.workingHours.end.split(':').map(Number);
        
            const startTime = new Date(now);
            startTime.setHours(startHour, startMinute, 0, 0);
        
            const endTime = new Date(now);
            endTime.setHours(endHour, endMinute, 0, 0);
        
            const nowTime = new Date(now);
        
            if (nowTime < startTime || nowTime > endTime) {
                console.log(`Notification ${notification._id.toString()} skipped, outside working hours.`);
                return false;
            }
        }
    }

    if (notification.snooze && notification.type === 'repeat') {
        const snoozeUntil = new Date(notification.snoozeSettings.until);
        if (now < snoozeUntil || notification.status === 'inactive') {
            console.log(`Notification ${notification._id.toString()} snoozed until ${snoozeUntil}`);
            return false;
        }

        notification.snooze = false;
        notification.snoozeSettings.until = null;
        notification.snoozeSettings.count = 0;
        await notification.save();
        
        return true;
    } else if (notification.snoozeFather !== null) {
        const snoozeUntil = new Date(notification.snoozeSettings.until);
        if (now < snoozeUntil) {
            console.log(`Snooze job ${notification._id.toString()} not yet due.`);
            return false;
        }

        const originalNotification = await Notification.findById(notification.snoozeFather);
        if (!originalNotification) {
            console.log(`Original notification ${notification.snoozeFather} not found.`);
            return false;
        }
        originalNotification.snooze = false;
        originalNotification.snoozeSettings.until = null;
        originalNotification.snoozeSettings.count = 0;
        originalNotification.status = 'active';
        await originalNotification.save();

        notification.snoozeFather = null;
        notification.snoozeSettings.until = null;
        notification.snoozeSettings.count = 0;
        notification.status = 'inactive';
        await notification.save();

        return true;
    }

    if (notification.type === 'default' || notification.type === 'repeat') {
        if (notification.type === 'default') {
            const scheduledTime = calculateNotificationTime(notification);
            const isDue = now >= scheduledTime && now - scheduledTime < INTERVAL;
            return isDue;
        }
    
        if (notification.type === 'repeat') {
            const startTime = new Date(notification.from);
            const endTime = new Date(notification.to);
            const interval = getRepeatInterval(notification);

            if ( now > endTime) {
                console.log(`Notification ${notification._id.toString()} expired.`);
                notification.status = 'inactive';
                await notification.save();
                return false;
            }

            const timeSinceStart = now - startTime;
            const intervalsPassed = Math.floor(timeSinceStart / interval);
            const lastTrigger = new Date(startTime.getTime() + intervalsPassed * interval);

            const isDue = now >= lastTrigger && now - lastTrigger < INTERVAL;
            return isDue;
        }
    }

    return false;
}

const sendNotificationNow = async (user, notification) => {
    if (notification.mode.system && !user.disableNotifications.system) await sendSystemNotification(notification);
    if (notification.mode.email && !user.disableNotifications.email) await sendEmailNotification(notification);
    notification.status = 'inactive';

    await notification.save();
    console.log(`Notification ${notification._id.toString()} sent.`);
}

module.exports = {
    startVirtualScheduler,
    sendNotificationNow
};