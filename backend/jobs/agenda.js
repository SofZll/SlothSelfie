const Agenda = require('agenda');
require('dotenv').config();
const { emitNotification } = require('../utils/utils');

const agenda = new Agenda({ 
    db: { address: process.env.MONGO_URI, collection: 'agendaJobs' },
    processEvery: '1 minute',
});

/**
 * Job to send notification
 */
agenda.define('send notification', async job => {
    console.log('Job: ', job.attrs);
    const now = new Date();
    const { endDate } = job.attrs.data;
    
    if (new Date(endDate) < now) {
        console.log('Event ended. Removing job.');
        await job.remove();
        return;
    }

    console.log('Sending notification');
    const { notificationId } = job.attrs.data;

    try {
        await emitNotification(notificationId);
        console.log('Notification sent successfully');
    } catch (error) {
        console.error('Error sending notification:', error);
    }
});

module.exports = agenda;