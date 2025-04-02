const pomodoroSocket = require('./pomodoroSocket');
const notificationSocket = require('./notificationSocket');
const userSocketMap = require('./userSocketMap');

const socketHandler = (io) => {
    const settingPomodoro = {};
    let intervals = {};

    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);
        
        // Send the current list of online users to the new client
        socket.emit('online-users-list', userSocketMap);
        console.log('Sent online users list:', userSocketMap);

        socket.on('online-user', (userId) => {
            userSocketMap[userId] = true;
            socket.userId = userId;
            console.log('User is online:', userId);
            console.log('sucket map: ', userSocketMap);
            io.emit('status-change', { userId, isOnline: true });
        });

        socket.on('offline-user', () => {
            if (socket.userId) {
                console.log('User is offline:', socket.userId);
                delete userSocketMap[socket.userId];
                io.emit('status-change', { userId: socket.userId, isOnline: false });
            }
        });
        
        socket.on('disconnect', () => {
            if (socket.userId) {
                console.log(`User disconnected: ${socket.userId}`);
                
                // Introduce a delay before marking the user as offline
                setTimeout(() => {
                    if (!io.sockets.sockets.has(socket.id)) {
                        delete userSocketMap[socket.userId];
                        io.emit('status-change', { userId: socket.userId, isOnline: false });
                        console.log(`User removed from online list after disconnect: ${socket.userId}`);
                    }
                }, 5000);
            }
        });
        pomodoroSocket.registerHandlers(socket, io, settingPomodoro, userSocketMap, intervals);
        notificationSocket.registerHandlers(socket, io, userSocketMap);
    });
};

module.exports = socketHandler;