const mongoose = require('mongoose');

const createDatabase = async (credentials, dbname) => {
    const uri = `mongodb://${credentials.user}:${credentials.pwd}@${credentials.site}/${dbname}?authSource=admin&writeConcern=majority`;
    try {
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`Database ${dbname} created successfully.`);
        await mongoose.connection.close();
    } catch (error) {
        console.error('Error creating database:', error);
    }
};

const credentials = {
    user: "site232453",
    pwd: "ahB4ha7j",
    site: "mongo_site232453"
};

const dbname = 'db';

createDatabase(credentials, dbname);