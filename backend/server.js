global.rootDir = __dirname ;
global.startDate = null; 

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/routes');
const noteRoutes = require('./routes/routes');
const path = require('path');
const connectDB = require('./config/db');

const cors = require('cors');

const app = express();

//locale:
// Configura CORS per accettare richieste dal frontend locale
app.use(cors({
    origin: 'http://localhost:3000', // Origine del tuo frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true // se stai inviando cookie o sessioni
}));

// Connect to MongoDB
connectDB();

app.use(bodyParser.json());

/*
app.use(session({
    secret:
    resave: false;
    saveUninitialized: true;
}))
*/
//app.use('/api', Routes);
app.use('/api', userRoutes);
app.use('/api', noteRoutes);

// Static files from frontend
const frontendPath = path.join(global.rootDir, '..', 'frontend/build');
//locale:
//const frontendPath = path.join(global.rootDir, '..', 'sloth-selfie/build');

app.use(express.static(frontendPath));

app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});