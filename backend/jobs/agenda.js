const Agenda = require('agenda');
require('dotenv').config();
const { emitNotification } = require('../utils/utils');

const agenda = new Agenda({ db: { address: process.env.MONGO_URI, collection: 'agendaJobs' },
    processEvery: '1 minute',
});

agenda.on('ready', async () => {
    console.log('Agenda ready!');
    await agenda.start();
});

/**
 * Job to send notification
 */
agenda.define('send notification', async job => {
    console.log('Sending notification');
    console.log(job.attrs.data);
    const { notificationId } = job.attrs.data;

    try {
        if (emitNotification(notificationId)) {
            console.log('Notification sent successfully');
        } else {
            console.error('Error sending notification');
        }
    } catch (error) {
        console.error('Error sending notification:', error);
    }
});

module.exports = agenda;