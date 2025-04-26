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
const socketHandler = require('./socket/socketHandler');
const socket = require('./socket/socket');
const app = express();
const agenda = require('./agenda/agenda');

const http = require('http');
const server = http.createServer(app);
const io = socket.init(server);

io.use((socket, next) => {
    session(socket.request, {}, next);
});

io.on('connection', (socket) => {
    console.log('Client connected');
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

//locale:
// Configura CORS per accettare richieste dal frontend locale
app.use(cors);

// Connect to MongoDB
connectDB().catch(error => console.error('Error connecting to MongoDB:', error));

app.use(bodyParser.json());

// Session middleware
app.use(session);

app.use((req, res, next) => {
    req.io = io;
    next();
});

app.use(routes);

//serve static files from public folder in sloth-selfie
app.use(express.static(path.join(__dirname, '..', 'sloth-selfie', 'public')));

app.get('/projects', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'sloth-selfie', 'public', 'projects.html'));
});

// Static files from frontend
// const frontendPath = path.join(global.rootDir, '..', 'frontend/build');
//locale:
const frontendPath = path.join(global.rootDir, '..', 'sloth-selfie/build');

app.use(express.static(frontendPath));

app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

socketHandler(io);

agenda.on('error', (error) => {
    console.error('Agenda connection error:', error);
});

process.on('SIGINT', async () => {
    await agenda.stop();
    console.log("✅ Agenda chiusa.");
    process.exit(0);
  });

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});