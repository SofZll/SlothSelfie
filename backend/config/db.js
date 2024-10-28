const mongoose = require('mongoose');

// Mongodb credentials
const mongoCredentials = {
    user: "site232453",
    pwd: "au8Eevai",
    site: "mongo_site232453"
};

const dbName = 'slothselfie';
const uri = `mongodb://${mongoCredentials.user}:${mongoCredentials.pwd}@${mongoCredentials.site}/${dbName}?authSource=admin&writeConcern=majority`;

const connectDB = async () => {
    try {
        await mongoose.connect(uri, {
        //locale:
        //await mongoose.connect('mongodb://localhost:27017/mydb', {
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