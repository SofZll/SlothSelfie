const pomodoroSocket = require('./pomodoroSocket');
const notificationSocket = require('./notificationSocket');
const chatSocket = require('./chatSocket');
const userSocketMap = require('./userSocketMap');
const pomodoroSessionMap = require('./pomodoroSessionMap');
const User = require('../models/userModel');

const socketHandler = (io) => {

    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);
        const userId = socket.request.session.userId;
        if (!userId) {
            console.log('User ID not found in session');
            return socket.disconnect();
        }

        // multi-device socket
        if (!userSocketMap.has(userId)) userSocketMap.set(userId, new Set());
        userSocketMap.get(userId).add(socket.id);

        if (userSocketMap.get(userId).size == 1) {
            User.findByIdAndUpdate(userId, { isOnline: true })
            io.emit('status-change', { userId, isOnline: true });
        }

        console.log('User ID:', userId);
        socket.join(userId);
        console.log('User joined room:', userId);

        socket.on('disconnect', () => {
            if (userSocketMap.get(userId)) {
                userSocketMap.get(userId).delete(socket.id);
                if (userSocketMap.get(userId).size == 0) {
                    userSocketMap.delete(userId);
                    User.findByIdAndUpdate(userId, { isOnline: false });
                    io.emit('status-change', { userId, isOnline: false });
                    console.log('User disconnected:', socket.id);
                } else {
                    console.log('User disconnected from one device:', socket.id);
                }
            }
        });

        chatSocket.registerHandlers(socket, io);
        pomodoroSocket.registerHandlers(socket, io, pomodoroSessionMap);
        notificationSocket.registerHandlers(socket, io, userSocketMap);
    });
};

module.exports = socketHandler;