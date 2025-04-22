const agenda = require('../agenda/agenda');
const User = require('../models/userModel');
const Notification = require('../models/notificationModel');

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

    const populatedJobs = await Promise.all(jobs.map(async (job) => {
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
    }));

    console.log('Jobs:', populatedJobs);

    return populatedJobs;
}

const snoozeJob = async (notificationId, snoozeTime) => {
    const notification = await Notification.findById(notificationId);
    if (!notification) throw new Error('Notification not found');

    if (notification.snoozeCount >= 3) throw new Error('Maximum snooze count reached');
    
    const job = await agenda.jobs({
        name: 'send-notification',
        'data.notification': notification._id
    });

    if (!job || job.length === 0) throw new Error('Job not found');

    const jobToUpdate = job[0];
    const newTime = new Date(jobToUpdate.attrs.nextRunAt + snoozeTime * 60 * 1000);
    await notification.updateOne({ snooze: true, snoozeUntil: newTime, snoozeCount: notification.snoozeCount + 1 });

    if (notification.type === 'default') await jobToUpdate.schedule(newTime).save();
    else if (notification.type === 'repeat') {
        await agenda.schedule(newTime, 'send-notification', { notification });
    }
}

    

module.exports = {
    getScheduledJobs,
    snoozeJob,
};