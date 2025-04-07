const { createMessage } = require('../services/messageServices');

const chatSocket = {
    registerHandlers: (socket, io) => {

        socket.on('send-message', async (message) => {
            console.log('Message received:', message);
            try {
                const savedMessage = await createMessage(message);
                console.log('savedMessage: ', savedMessage);
                console.log('savedMessage.chat: ', savedMessage.chat);
                console.log('savedMessage.chat.id: ', savedMessage.chat.id);
                savedMessage.chat.participants.forEach((participant) => {
                    console.log('Participant:', participant);
                    socket.to(participant.id).emit('receive-message', savedMessage);
                });
            } catch (error) {
                console.error('Error in socket message creation:', error);
            }
        });

        socket.on('join-chatroom', (userId) => {
            console.log(`${socket.id} joined chat ${userId}`);
            socket.join(userId);
        });
        
        socket.on('leave-chatroom', (userId) => {
            console.log(`${socket.id} left chat ${userId}`);
            socket.leave(userId);
        });
    }
}

module.exports = chatSocket;