const Agenda = require('agenda');
require('dotenv').config();
const { emitNotification } = require('../utils/utils');

const agenda = new Agenda({ db: { address: process.env.MONGO_URI, collection: 'agendaJobs' },
    processEvery: '1 minute',
});

agenda.define('send notification', async job => {
    console.log('Sending notification');
    console.log(job.attrs.data);
    const { sender, receivers, message } = job.attrs.data;

    try {
        console.log(`Invio notifica ai destinatari: ${receivers}`);
        if (emitNotification(sender, receivers, message)) {
            console.log('Notification sent successfully');
        } else {
            console.error('Error sending notification');
        }
    } catch (error) {
        console.error('Error sending notification:', error);
    }
});

(async () => {
    await agenda.start();

    const testReceivers = ['Kmoon'];
    const testMessage = 'This is a test notification';
    const testDate = new Date(Date.now() + 10000).toISOString(); // Schedule 10 seconds from now
    console.log('Agenda started');
    console.log('Date:', testDate);

    console.log('Scheduling test notification...');
    await agenda.schedule(testDate, 'send notification', { sender: 'Kmoon', receivers: testReceivers, message: testMessage });
    console.log('Notification scheduled successfully');
})();

module.exports = agenda;