const pomodoroSocket = require('./pomodoroSocket');
const notificationSocket = require('./notificationSocket');
const userSocketMap = require('./userSocketMap');

const socketHandler = (io) => {
    const settingPomodoro = {};
    let intervals = {};

    io.on('connection', (socket) => {
        pomodoroSocket.registerHandlers(socket, io, settingPomodoro, userSocketMap, intervals);
        notificationSocket.registerHandlers(socket, io, userSocketMap);
    });
};

module.exports = socketHandler;