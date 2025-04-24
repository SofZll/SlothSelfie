const notificationSocket = {
    registerHandlers: (socket, io) => {
        socket.on('send-notification', async ({ receiversId, title, body, notificationId }) => {
            receiversId.forEach(receiverId => {
                io.to(receiverId).emit('system-notification', {
                    title,
                    body,
                    notificationId
                });
            });
        });
    }
}

module.exports = notificationSocket;