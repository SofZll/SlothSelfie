const agenda = require('../agenda/agenda');
const User = require('../models/userModel');
const Notification = require('../models/notificationModel');

const { scheduleNotification } = require('../agenda/notificationScheduler');

const getScheduledJobs = async (userId, hours = 24) => {
    const now = new Date(); // da cambiare con TM
    const limit = new Date(now.getTime() + hours * 60 * 60 * 1000);

    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    const jobs = await agenda.jobs({ 
        name: 'send-notification',
        nextRunAt: { $gte: now, $lte: limit },
    });

    const populatedJobs = (await Promise.all(jobs.map(async (job) => {
        const notificationId = job.attrs.data.notification;
        const populatedNotification = await Notification.findById(notificationId).populate('element');

        if (!populatedNotification || !populatedNotification.user.equals(user._id)) {
            return null;
        }
        
        return {
            _id: populatedNotification._id,
            notificationId: populatedNotification._id,
            type: populatedNotification.type,
            elementType: populatedNotification.elementType,
            element: populatedNotification.element,
            mode: populatedNotification.mode,
            before: populatedNotification.before,
            variant: populatedNotification.variant,
            urgency: populatedNotification.urgency,
            snooze: populatedNotification.snooze,
            triggerAt: job.attrs.nextRunAt,
            to: new Date(populatedNotification.to),
            status: job.attrs.lastFinishedAt ? 'inactive' : 'active',
        };
    }))).filter(job => job !== null);

    console.log('Jobs:', populatedJobs);

    return populatedJobs;
}

const snoozeJob = async (notificationId, snoozeTime) => {
    const notification = await Notification.findById(notificationId);
    if (!notification) throw new Error('Notification not found');

    console.log('Snoozing notification:', notification);
    // let the user know that he can snooze only 3 times
    if (notification.snoozeSettings.count >= 3) throw new Error('You can snooze only 3 times');
    
    const jobs = await agenda.jobs({
        name: 'send-notification',
        'data.notification': notification._id.toString()
    });

    if (!jobs || jobs.length === 0) throw new Error('Job not found');

    if (notification.type === 'default') {
        const jobToUpdate = jobs[0];
        const newTime = new Date(jobToUpdate.attrs.nextRunAt.getTime() + snoozeTime * 60 * 1000);
        await jobToUpdate.schedule(newTime).save();
        notification.snoozeSettings.until = newTime;
        await notification.save();
    } else if (notification.type === 'repeat') {
        const now = new Date();
        const existingSnoozeJob = jobs.find(job => job.attrs.data && job.attrs.data.isSnoozeJob && job.attrs.nextRunAt > now);

        if (existingSnoozeJob) {
            const newTime = new Date(existingSnoozeJob.attrs.nextRunAt.getTime() + snoozeTime * 60 * 1000);
            await existingSnoozeJob.schedule(newTime).save();
            notification.snoozeSettings.until = newTime;
            await notification.save();
        } else {
            const mainJob = jobs.find(job => job.attrs.data && !job.attrs.data.isSnoozeJob);
            const newTime = new Date(jobs[0].attrs.nextRunAt.getTime() + snoozeTime * 60 * 1000);
            await agenda.schedule(newTime, 'send-notification', {
                notification: notification._id.toString(),
                isSnoozeJob: true,
                originalJobId: mainJob?._id,
            });
            notification.snoozeSettings.until = newTime;
            await notification.save();
        }
    }

    await notification.updateOne({
        snooze: true,
        'snoozeSettings.count': notification.snoozeSettings.count + 1
    });
}

const updateJobs = async (notificationId) => {
    const notification = await Notification.findById(notificationId);
    if (!notification) throw new Error('Notification not found');

    await agenda.cancel({ 
        name: 'send-notification',
        'data.notification': notification._id.toString()
    });

    await scheduleNotification([notification]);
}

const deleteJobs = async (notificationId) => {
    const notification = await Notification.findById(notificationId);
    if (!notification) throw new Error('Notification not found');

    await agenda.cancel({ 
        name: 'send-notification',
        'data.notification': notification._id.toString()
    });
}

module.exports = {
    getScheduledJobs,
    snoozeJob,
    updateJobs,
    deleteJobs
};