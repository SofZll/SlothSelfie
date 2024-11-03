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
const socketIo = require('socket.io');


const cors = require('cors');

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
    resave: true,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: {
        secure: false, // Set to `true` if using HTTPS
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // Set a max age for session persistence (24 hours here)
    }
}))



// Routes

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



//Websocket




const { v4: uuidv4 } = require('uuid');


const settingPomodoro = {}
let sessionCode;

let interval = null;



const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('create session', (dataPomodoro, studying) => {
        console.log('Create session');
        sessionCode = uuidv4().slice(0, 6);

        settingPomodoro[sessionCode] = {
            timer: dataPomodoro.studioTime,
            cycles: dataPomodoro.cycles,
            cyclesLeft: dataPomodoro.cyclesLeft,
            breakTime: dataPomodoro.breakTime,
            studyTime: dataPomodoro.studioTime,
            people: 1,
            isStudioTime: dataPomodoro.isStudioTime,
            notStartedYet: dataPomodoro.notStartedYet,
            done: dataPomodoro.done,
            addedCycles: dataPomodoro.addedCycles,
            studioTimeTotal: dataPomodoro.studioTimeTotal,
            play: studying,
        }

        socket.join(sessionCode);
        console.log('Create session');
        socket.emit('session code', sessionCode);
        socket.emit('timerState', settingPomodoro[sessionCode]);

    });

    socket.on('join session', (sessionCode) => {
        console.log('Join session');
        if (settingPomodoro[sessionCode]) {
            socket.join(sessionCode);
            socket.emit('session joined', {success: true, sessionCode});
            settingPomodoro[sessionCode].people++;
            io.to(sessionCode).emit('timerState', settingPomodoro[sessionCode]);
        } else {
            socket.emit('session joined', {success: false});
        }
    });

    socket.on('stop', (sessionCode) => {
        clearInterval(interval);
        delete interval;
        interval = null;
        settingPomodoro[sessionCode].play = false;
        console.log('Stop timer');
        io.to(sessionCode).emit('timerState', settingPomodoro[sessionCode]);
    });

    const passingTime = (sessionCode) => {
        if (settingPomodoro[sessionCode].timer > 0) {
            settingPomodoro[sessionCode].timer--;
            settingPomodoro[sessionCode].studioTimeTotal++;
        } else {
            if (settingPomodoro[sessionCode].isStudioTime) {
                if (settingPomodoro[sessionCode].cyclesLeft > 1) {
                    settingPomodoro[sessionCode].timer = settingPomodoro[sessionCode].breakTime;
                    settingPomodoro[sessionCode].isStudioTime = false;
                } else {
                    settingPomodoro[sessionCode].timer = 0;
                    settingPomodoro[sessionCode].done = true;
                }
            } else {
                settingPomodoro[sessionCode].timer = settingPomodoro[sessionCode].studyTime;
                settingPomodoro[sessionCode].isStudioTime = true;
                settingPomodoro[sessionCode].cyclesLeft--;
            }
        }
    }
    
    socket.on('start', (sessionCode) => {
        if(settingPomodoro[sessionCode].notStartedYet) {
            settingPomodoro[sessionCode].notStartedYet = false;
        }
        

        if (!interval) {
            settingPomodoro[sessionCode].play = true;
            interval = setInterval(() => {
                passingTime(sessionCode);
                io.to(sessionCode).emit('timerState', settingPomodoro[sessionCode]);
                if (settingPomodoro[sessionCode].done) {
                    clearInterval(interval);
                    delete interval;
                    interval = null;
                    console.log('Stop timer');
                    io.to(sessionCode).emit('timerState', settingPomodoro[sessionCode]);
                }
            }, 1000);
        }
    });

    socket.on('reset', (sessionCode) => {
        settingPomodoro[sessionCode].timer = settingPomodoro[sessionCode].studyTime;
        settingPomodoro[sessionCode].cycles = settingPomodoro[sessionCode].cycles - settingPomodoro[sessionCode].addedCycles;
        settingPomodoro[sessionCode].cyclesLeft = settingPomodoro[sessionCode].cycles;
        settingPomodoro[sessionCode].isStudioTime = true;
        settingPomodoro[sessionCode].notStartedYet = true;
        settingPomodoro[sessionCode].done = false;
        settingPomodoro[sessionCode].addedCycles = 0;
        settingPomodoro[sessionCode].studioTimeTotal = 0;
        clearInterval(interval);
        interval = null;
        console.log('Reset timer');
        io.to(sessionCode).emit('timerState', settingPomodoro[sessionCode]);
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
        io.to(sessionCode).emit('timerState', settingPomodoro[sessionCode]);
    });

    socket.on('add', (sessionCode) => {
        settingPomodoro[sessionCode].cycles++;
        settingPomodoro[sessionCode].cyclesLeft++;
        settingPomodoro[settingPomodoro].addedCycles++;
        console.log('Add cycle');
        io.to(sessionCode).emit('timerState', settingPomodoro[sessionCode]);
    });

    socket.on('exit', (sessionCode) => {
        settingPomodoro[sessionCode].people--;
        console.log('Leave session');
        if (settingPomodoro[sessionCode].people === 0) {
            delete settingPomodoro[sessionCode];
            console.log('Delete session');
            socket.emit('session closed');
        } else {
            io.to(sessionCode).emit('timerState', settingPomodoro[sessionCode]);
            socket.leave(sessionCode);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected', sessionCode);

    });

    socket.on('edit', (sessionCode, studying, dataPomodoro) => {
        settingPomodoro[sessionCode] = {
            timer: dataPomodoro.studioTime,
            cycles: dataPomodoro.cycles,
            cyclesLeft: dataPomodoro.cyclesLeft,
            breakTime: dataPomodoro.breakTime,
            studyTime: dataPomodoro.studioTime,
            isStudioTime: dataPomodoro.isStudioTime,
            notStartedYet: dataPomodoro.notStartedYet,
            done: dataPomodoro.done,
            addedCycles: dataPomodoro.addedCycles,
            studioTimeTotal: dataPomodoro.studioTimeTotal,
            play: studying,
        }
        console.log('Edit session');
        io.to(sessionCode).emit('timerState', settingPomodoro[sessionCode]);
    });

});