const pomodoroSocket = require('./pomodoroSocket');
const notificationSocket = require('./notificationSocket');

const socketHandler = (io) => {
    const settingPomodoro = {};
    const userSocketMap = {};
    let intervals = {};

    io.on('connection', (socket) => {
        pomodoroSocket.registerHandlers(socket, io, settingPomodoro, userSocketMap, intervals);
        notificationSocket.registerHandlers(socket, io, userSocketMap);
    });
};

module.exports = socketHandler;