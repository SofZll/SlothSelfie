const Agenda = require('agenda');
//connected users

const agenda = new Agenda({ db: { address: process.env.MONGODB_URI } });

agenda.define('send notification', async job => {
    console.log('Sending notification');
    console.log(job.attrs.data);
    const { activityId, eventId, receivers, message } = job.attrs.data;
    await createNotification({ activityId, eventId, receivers, message });
});

module.exports = agenda;