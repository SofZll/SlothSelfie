const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const uri = process.env.MONGO_URI;

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