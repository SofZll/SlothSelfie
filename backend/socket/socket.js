let io;

const init = (server) => {
    io = require('socket.io')(server, {
        cors: {
            origin: 'http://localhost:3000', 
            methods: ['GET', 'POST'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            credentials: true
        }
    });
    return io;
};

const getIO = () => {
    if (!io) {
        console.error("Socket.IO instance not initialized!");
        throw new Error('Socket.IO not initialized!');
    }
    return io;
};

module.exports = { init, getIO };
