const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const { startVirtualScheduler } = require('../scheduler/notificationScheduler');

const uri = process.env.MONGO_URI;

const connectDB = async () => {
    try {
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        // scheduler for notifications
        startVirtualScheduler();

        console.log('Notification scheduler initialized');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

module.exports = connectDB;