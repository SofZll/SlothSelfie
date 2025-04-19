import agenda from '../agenda/agenda';

const getScheduledJobs = async (userId, hours = 24) => {
    const now = new Date(); // da cambiare con TM
    const limit = new Date(now.getTime() + hours * 60 * 60 * 1000);

    const jobs = await agenda.jobs({ 
        name: 'send-notification',
        nextRunAt: { $gte: now, $lte: limit },
        'data.userId': userId 
    });

    return jobs;
}

const formatJob = (job) => {
    const { notification } = job.attrs.data;

    return {
        _id: job.attrs._id,
        notificationId: notification._id,
        title: notification.title,
        type: notification.type,
        variant: notification.variant,
        triggerAt: job.attrs.nextRunAt,
        to: new Date(notification.to),
        status: job.attrs.lastFinishedAt ? 'inactive' : 'active',
    };
}

module.exports = {
    getScheduledJobs,
    formatJob,
};