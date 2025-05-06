const Notification = require('../models/notificationModel');
const User = require('../models/userModel');
const Event = require('../models/eventModel');

const { sendSystemNotification, sendEmailNotification, calculateNotificationTime, getRepeatInterval } = require('../services/notificationService');
const { getCurrentNow } = require('../services/timeMachineService');

const INTERVAL = 10000; // 10 seconds

const startVirtualScheduler = () => {
    setInterval(async () => {
        const now = getCurrentNow();
        const activeNotifications = await Notification.find({
            type: { $ne: 'now' },
            from: { $lte: now },
            to: { $gte: now },
            createdAt: { $lte: now },
        });

        if (!activeNotifications || activeNotifications.length === 0) return;

        for (const notification of activeNotifications) {
            if (await shouldSendNotification(notification, now)) {
                try {
                    if (notification.mode.system) await sendSystemNotification(notification);
                    if (notification.mode.email) await sendEmailNotification(notification);

                    if (notification.type === 'default') {
                        notification.status = 'inactive';
                        await notification.save();
                    }
                } catch (error) {
                    console.error(`Notification ${notification._id.toString()} failed:`, error);
                }
                console.log(`Notification ${notification._id.toString()} sent.`);
            }
        }
    }, INTERVAL);
};

const shouldSendNotification = async (notification, now) => {
    if (notification.status === 'inactive' && getCurrentNow() < notification.to) {
        notification.status = 'active';
        await notification.save();
    }

    const user = await User.findById(notification.user);
    if (!user || user.disableNotifications.all) {
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
            return false;
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
        const scheduledTime = notification.triggerAt;
    
        if (notification.type === 'default') {
            const isDue = now >= scheduledTime && now - scheduledTime < INTERVAL;
            return isDue;
        }
    
        if (notification.type === 'repeat') {
            const startTime = new Date(notification.from);
            const interval = getRepeatInterval(notification);
        
            const timeSinceStart = now - startTime;
            const intervalsPassed = Math.floor(timeSinceStart / interval);
            const lastTrigger = new Date(startTime.getTime() + intervalsPassed * interval);
        
            const isDue = now >= lastTrigger && now - lastTrigger < INTERVAL;
        
            if (isDue) {
                notification.triggerAt = new Date(lastTrigger.getTime() + interval);
                await notification.save();
                return true;
            }
        
            return false;
        }
    }
    

    return false;
}

const sendNotificationNow = async (notification) => {
    const now = getCurrentNow();

    if (notification.mode.system) sendSystemNotification(notification);
    if (notification.mode.email) sendEmailNotification(notification);
    notification.status = 'inactive';
    notification.triggerAt = now;

    await notification.save();
    console.log(`Notification ${notification._id.toString()} sent.`);
}

module.exports = {
    startVirtualScheduler,
    sendNotificationNow
};