const { createMessage, markRead } = require('../services/messageServices');

const chatSocket = {
    registerHandlers: (socket, io) => {

        socket.on('send-message', async (message) => {
            try {
                const savedMessage = await createMessage(message);
                savedMessage.chat.participants.forEach((participant) => {
                    io.to(participant.id).emit('receive-message', savedMessage);
                });
            } catch (error) {
                console.error('Error in socket message creation:', error);
            }
        });

        socket.on('mark-read', async (data) => {
            try {
                await markRead(data.chatId, data.userId);
            } catch (error) {
                console.error('Error marking message as read:', error);
            }
        });
    }
}

module.exports = chatSocket;