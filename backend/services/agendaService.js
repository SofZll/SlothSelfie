const agenda = require('../agenda/agenda');
const User = require('../models/userModel');

const getScheduledJobs = async (userId, hours = 24) => {
    const now = new Date(); // da cambiare con TM
    const limit = new Date(now.getTime() + hours * 60 * 60 * 1000);

    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    console.log('User:', user);
    console.log('User ID:', user._id);
    console.log('User ID:', userId);
    console.log('Now:', now);
    console.log('Limit:', limit);

    const jobs = await agenda.jobs({ 
        name: 'send-notification',
        nextRunAt: { $gte: now, $lte: limit },
        'data.notification.user': user._id
    });

    console.log('Jobs:', jobs);

    return jobs;
}

const formatJob = (job) => {
    const { notification } = job.attrs.data;

    return {
        _id: job.attrs._id,
        notificationId: notification._id,
        title: notification.element.title,
        type: notification.type,
        elementType: notification.elementType,
        mode: notification.mode,
        variant: notification.variant,
        urgency: notification.urgency,
        snooze: notification.snooze,
        triggerAt: job.attrs.nextRunAt,
        to: new Date(notification.to),
        status: job.attrs.lastFinishedAt ? 'inactive' : 'active',
    };
}

module.exports = {
    getScheduledJobs,
    formatJob,
};