const Agenda = require('agenda');
require('dotenv').config();

const agenda = new Agenda({ 
    db: { address: process.env.MONGO_URI, collection: 'agendaJobs' },
    processEvery: '1 minute',
});

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

function gracefulShutdown() {
  agenda.stop(() => {
    console.log('Notification scheduler stopped');
    process.exit(0);
  });
}

module.exports = agenda;