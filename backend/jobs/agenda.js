const Agenda = require('agenda');
require('dotenv').config();
const { emitNotification } = require('../utils/utils');

const agenda = new Agenda({ db: { address: process.env.MONGO_URI, collection: 'agendaJobs' },
    processEvery: '1 minute',
});

agenda.define('send notification', async job => {
    console.log('Sending notification');
    console.log(job.attrs.data);
    const { sender, receivers, message, type } = job.attrs.data;

    try {
        console.log(`Invio notifica ai destinatari: ${receivers}`);
        if (emitNotification(sender, receivers, message, type)) {
            console.log('Notification sent successfully');
        } else {
            console.error('Error sending notification');
        }
    } catch (error) {
        console.error('Error sending notification:', error);
    }
});

module.exports = agenda;