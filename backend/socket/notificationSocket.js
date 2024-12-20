const notificationSocket = {
    registerHandlers: (socket, io, userSocketMap) => {
        socket.on('authenticated', (isAuthenticated) => {
            if (isAuthenticated) {
                const session = socket.request.session;
                console.log('Session data:', session); // Add logging to check the session data
                if (session && session.username) {
                    const username = session.username;
                    userSocketMap[username] = socket.id;
                    console.log(`User authenticated: ${username} -> ${socket.id}`);
                } else {
                    console.log('Username not found in session');
                }
            } else {
                console.log('User not authenticated');
            }
        });

        socket.on('check', () => {
            console.log('Checking socket');
        })

        socket.on('send-notification', (notif) => {
            console.log('Received notification');
            const { receivers, message } = notif;
            const sender = socket.request.session.username;
            console.log('Sender:', sender);

            receivers.forEach((receiver) => {
                const receiverSocketId = userSocketMap[receiver];
                if (receiverSocketId) {
                    console.log(`Sending notification to ${receiver}: ${message}`);
                    io.to(receiverSocketId).emit('notification', {
                        sender: { username: sender },
                        message
                    });
                }
            });
        });

        socket.on('disconnect', () => {
            console.log('User disconnected');
            const session = socket.request.session;
            if (session && session.username) {
                const username = session.username;
                delete userSocketMap[username];
                console.log(`User disconnected: ${username}`);
            }
        });
    }
}

module.exports = notificationSocket;