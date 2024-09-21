const express = require('express');
const cors = require('cors');
const template = require('./scripts/tpl');
const mymongo = require('./scripts/mongo');
/*
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const path = require('path');

require('dotenv').config();

const app = express();
const dbURI="mongodb://site232453:ahB4ha7j@mongo_site232453/db?authSource=admin&writeConcern=majority"
const port=8000

console.log('MONGO_URI:', dbURI); // Aggiungi questo log
console.log('PORT:', port); // Aggiungi questo log



connectDB();

// Middleware per gestire le API
app.use(express.json());

app.use('/api', userRoutes);

// Static files from frontend
app.use(express.static(path.join(__dirname, '../frontend/build')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});
*/

// Express config & routes

let app = express()
app.use('/js' , express.static('public/js'))

// MONGODB
const mongoCredentials = {
    user: "site232453",
    pwd: "ahB4ha7j",
    site: "mongo_site232453"
};

app.get('/db/create', async function (req, res) {
    res.send(await mymongo.create(mongoCredentials))
});

app.get('/db/search', async function (req, res) {
    res.send(await mymongo.search(req.query, mongoCredentials))
});

// Node server

app.listen(port, function() { 
	global.startDate = new Date() ; 
	console.log(`App listening on port 8000 started ${global.startDate.toLocaleString()}` )
})
