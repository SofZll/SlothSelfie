const mongoose = require('mongoose');
require('dotenv').config();

const uri="mongodb://site232453:ahB4ha7j@mongo_site232453/db?authSource=admin&writeConcern=majority"

const connectDB = async () => {
    try {
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

module.exports = connectDB;
