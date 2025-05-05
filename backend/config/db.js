const mongoose = require('mongoose');

const { startVirtualScheduler } = require('../scheduler/notificationScheduler');
// Mongodb credentials
/*
const mongoCredentials = {
    user: "site232453",
    pwd: "au8Eevai",
    site: "mongo_site232453"
};
*/

const mongoCredentials = {
    user: "kaorijiang",
    pwd: "dWFd3wNQCJQksWEs",
    site: "cluster0.ynn63.mongodb.net",
    dbname: "slothselfie"
};

const dbName = 'slothselfie';
//const uri = `mongodb://${mongoCredentials.user}:${mongoCredentials.pwd}@${mongoCredentials.site}/${dbName}?authSource=admin&writeConcern=majority`;
const uri = `mongodb+srv://${mongoCredentials.user}:${mongoCredentials.pwd}@${mongoCredentials.site}/${dbName}?retryWrites=true&w=majority&appName=Cluster0`;

const connectDB = async () => {
    try {
        await mongoose.connect(uri, {
        //locale:
        //await mongoose.connect('mongodb://localhost:27017/mydb', {
            //useNewUrlParser: true,
            //useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');

        // scheduler for notifications
        startVirtualScheduler();

        const testNotification = {
            _id: '6615c3a427b1e2c5e0c35a7e', // Assicurati che esista nel DB!
            type: 'default'
        };
        console.log('Notification scheduler initialized');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

module.exports = connectDB;