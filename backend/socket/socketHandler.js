const pomodoroSocket = require('./pomodoroSocket');
const notificationSocket = require('./notificationSocket');
const chatSocket = require('./chatSocket');
const userSocketMap = require('./userSocketMap');
const User = require('../models/userModel');

const socketHandler = (io) => {
    const settingPomodoro = {};
    let intervals = {};

    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        socket.on('online-user', async (userId) => {
            userSocketMap.set(userId, socket.id);
            await User.findByIdAndUpdate(userId, { isOnline: true });
            io.emit('status-change', { userId, isOnline: true });
        });
        
        socket.on('disconnect', async () => {
            const userId = [...userSocketMap.entries()].find(([_, id]) => id === socket.id)?.[0];
            if (userId) {
                userSocketMap.delete(userId);
                await User.findByIdAndUpdate(userId, { isOnline: false });
                io.emit('status-change', { userId, isOnline: false });
                console.log('User disconnected:', userId);
            }
        });
        chatSocket.registerHandlers(socket, io);
        pomodoroSocket.registerHandlers(socket, io, settingPomodoro, userSocketMap, intervals);
        notificationSocket.registerHandlers(socket, io, userSocketMap);
    });
};

module.exports = socketHandler;