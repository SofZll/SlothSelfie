global.rootDir = __dirname ;
global.startDate = null; 

const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/routes');
const noteRoutes = require('./routes/routes');
const path = require('path');
const connectDB = require('./config/db');
require('dotenv').config();

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

console.log('Session Secret:', process.env.SESSION_SECRET);
// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: {
        secure: false, 
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        sameSite: 'lax',
    }
}))

app.use((req, res, next) => {
    console.log('Session ID:', req.sessionID);
    console.log('Session:', req.session);
    if (!req.session.isNew) {
        console.log('Existing session');
    } else {
        console.log('New session');
    }
    next();
});


//app.use('/api', Routes);
app.use('/api', userRoutes);
app.use('/api', noteRoutes);

// Static files from frontend
// const frontendPath = path.join(global.rootDir, '..', 'frontend/build');
//locale:
const frontendPath = path.join(global.rootDir, '..', 'sloth-selfie/build');

app.use(express.static(frontendPath));

app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


//Websocket


const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);
const { v4: uuidv4 } = require('uuid');

let settingPomodoro = {}
const sessionCode = uuidv4().slice(0, 6);

let interval = null;

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('create session', (dataPomodoro, studing) => {
        socket.join(sessionCode);

        settingPomodoro[sessionCode] = {
            timer: dataPomodoro.studioTime,
            cycles: dataPomodoro.cycles,
            cyclesLeft: dataPomodoro.cycles,
            breakTime: dataPomodoro.breakTime,
            studyTime: dataPomodoro.studioTime,   
            isStudioTime: studing,     
        }

        socket.join(sessionCode);
        console.log('Create session');
        socket.emit('session code', sessionCode);


    });

    socket.on('join session', (sessionCode) => {
        if (settingPomodoro[sessionCode]) {
            socket.join(sessionCode);
            socket.emit('session joined', {success: true, sessionCode});
            io.to(sessionCode).emit('timerState', settingPomodoro[sessionCode]);
        } else {
            socket.emit('session joined', {success: false});
        }
    });

    socket.on('edit', (sessionCode, dataPomodoro) => {
        settingPomodoro[sessionCode] = {
            timer: dataPomodoro.studioTime,
            cycles: dataPomodoro.cycles,
            cyclesLeft: dataPomodoro.cycles,
            breakTime: dataPomodoro.breakTime,
            studyTime: dataPomodoro.studioTime,   
            isStudioTime: studing,     
        }
        console.log('Edit timer');
        io.to(sessionCode).emit('timerState', settingPomodoro[sessionCode]);
    });
    
    socket.on('start', (sessionCode) => {
        if (!interval) {
            interval = setInterval(() => {
                settingPomodoro[sessionCode].timer--;
                if (settingPomodoro[sessionCode].timer === 0) {
                    if (settingPomodoro[sessionCode].isStudioTime) {
                        settingPomodoro[sessionCode].timer = settingPomodoro[sessionCode].breakTime;
                        settingPomodoro[sessionCode].isStudioTime = false;
                        settingPomodoro[sessionCode].cyclesLeft--;
                    } else {
                        settingPomodoro[sessionCode].timer = settingPomodoro[sessionCode].studyTime;
                        settingPomodoro[sessionCode].isStudioTime = true;
                    }
                }
                console.log('Play timer');
                io.to(sessionCode).emit('play', settingPomodoro[sessionCode]);
            }, 1000);
        }
    });

    socket.on('stop', (sessionCode) => {
        clearInterval(interval);
        interval = null;
        console.log('Stop timer');
        io.to(sessionCode).emit('stop');
    });

    socket.on('reset', (sessionCode, cycles) => {
        settingPomodoro[sessionCode].timer = settingPomodoro[sessionCode].studyTime;
        settingPomodoro[sessionCode].cycles = cycles;
        settingPomodoro[sessionCode].cyclesLeft = cycles;
        settingPomodoro[sessionCode].isStudioTime = true;
        console.log('Reset timer');
        io.to(sessionCode).emit('reset', settingPomodoro[sessionCode]);
    });

    socket.on('skip', (sessionCode) => {
        if (settingPomodoro[sessionCode].isStudioTime) {
            settingPomodoro[sessionCode].timer = settingPomodoro[sessionCode].breakTime;
            settingPomodoro[sessionCode].isStudioTime = false;
            settingPomodoro[sessionCode].cyclesLeft--;
        } else {
            settingPomodoro[sessionCode].timer = settingPomodoro[sessionCode].studyTime;
            settingPomodoro[sessionCode].isStudioTime = true;
        }

        console.log('Skip timer');
        io.to(sessionCode).emit('skip', settingPomodoro[sessionCode]);
    });

    socket.on('add', (sessionCode) => {
        settingPomodoro[sessionCode].cycles++;
        settingPomodoro[sessionCode].cyclesLeft++;
        console.log('Add cycle');
        io.to(sessionCode).emit('add', settingPomodoro[sessionCode]);
    });

    socket.on('disconnect', (sessionCode) => {
        clearInterval(interval);
        interval = null;
        delete settingPomodoro[sessionCode];
        console.log('Disconnect');
    });

});
