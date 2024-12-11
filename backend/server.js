global.rootDir = __dirname ;
global.startDate = null; 

const cors = require('./config/cors');
const session = require('./config/session');
const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes/index');
const path = require('path');
const connectDB = require('./config/db');
require('dotenv').config();
const socketIo = require('socket.io');
const socketHandler = require('./socket/socket');
const app = express();

const http = require('http');
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: 'http://localhost:3000', // La tua origine
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true // Permetti le credenziali (cookie)
    }
});

//locale:
// Configura CORS per accettare richieste dal frontend locale
app.use(cors);

// Connect to MongoDB
connectDB().catch(error => console.error('Error connecting to MongoDB:', error));

app.use(bodyParser.json());

// Session middleware
app.use(session);

io.use((socket, next) => {
    session(socket.request, {}, next);
});

app.use((req, res, next) => {
    console.log('Session ID:', req.sessionID);
    console.log('Session:', req.session);
    req.io = io;
    next();
});

app.use(routes);

// Static files from frontend
// const frontendPath = path.join(global.rootDir, '..', 'frontend/build');
//locale:
const frontendPath = path.join(global.rootDir, '..', 'sloth-selfie/build');

app.use(express.static(frontendPath));

app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});


socketHandler(io);

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});