global.rootDir = __dirname ;
global.startDate = null; 

const mongoose = require('mongoose');
const express = require('express');
const User = require('./models/userModel')
const path = require('path');
const app = express();

app.use(express.json());
const cors = require('cors');
app.use(cors());


// mongodb credentials
const mongoCredentials = {
    user: "site232453",
    pwd: "au8Eevai",
    site: "mongo_site232453"
};

mongoose.connect(`mongodb://${mongoCredentials.user}:${mongoCredentials.pwd}@${mongoCredentials.site}/?authSource=admin&writeConcern=majority`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Failed to connect to MongoDB', err);
});

app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = new User({ username, password }); // Store password as plain text
        await user.save();
        res.status(201).send('User registered successfully');
    } catch (error) {
        console.error('User registration failed:', error);
        res.status(500).send('User registration failed');
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user || user.password !== password) {
            return res.status(400).send('Invalid username or password');
        }
        res.status(200).send('Login successful');
    } catch (error) {
        console.error('User login failed:', error);
        res.status(500).send('User login failed');
    }
});

// Static files from frontend
const frontendPath = path.join(global.rootDir, '..', 'frontend/build');
app.use(express.static(frontendPath));

app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});


// Node server

app.listen(8000, function() { 
	global.startDate = new Date() ; 
	console.log(`App listening on port 8000 started ${global.startDate.toLocaleString()}` )
})
