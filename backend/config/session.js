const session = require('express-session');
const MongoStore = require('connect-mongo');
require('dotenv').config();

const mongoCredentials = {
    user: "site232453",
    pwd: "au8Eevai",
    site: "mongo_site232453"
};

/*
const mongoCredentials = {
    user: "kaorijiang",
    pwd: "dWFd3wNQCJQksWEs",
    site: "cluster0.ynn63.mongodb.net",
    dbname: "slothselfie"
};
*/

const dbName = 'slothselfie';
const uri = `mongodb://${mongoCredentials.user}:${mongoCredentials.pwd}@${mongoCredentials.site}/${dbName}?authSource=admin&writeConcern=majority`;

module.exports = session({
    secret: process.env.SESSION_SECRET || 'defaultsecret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: uri }),
    cookie: {
        secure: false, 
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        sameSite: 'lax',
    }
});