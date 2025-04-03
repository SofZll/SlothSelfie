const chatSocket = {
    registerHandlers: (socket, io) => {
        socket.on('message', (message) => {
            console.log('Message received:', message);
            const { chatId, sender, content } = message;
            socket.to(chatId).emit('message', message);
        });

        socket.on('join-chatroom', (chatId) => {
            console.log(`${socket.id} joined chat ${chatId}`);
            socket.join(chatId);
        });
        
        socket.on('leave-chatroom', (chatId) => {
            console.log(`${socket.id} left chat ${chatId}`);
            socket.leave(chatId);
        });

        socket.on('typing', (chatId) => {
            socket.to(chatId).emit('typing', { user: socket.id });
        });

        socket.on('stop-typing', (chatId) => {
            socket.to(chatId).emit('stop-typing', { user: socket.id });
        });
    }
}

module.exports = chatSocket;