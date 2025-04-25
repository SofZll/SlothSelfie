const { createMessage, markRead } = require('../services/messageServices');

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
                    io.to(participant.id).emit('receive-message', savedMessage);
                });
            } catch (error) {
                console.error('Error in socket message creation:', error);
            }
        });

        socket.on('mark-read', async (data) => {
            console.log('Marking message as read:', data.chatId, data.userId);
            try {
                await markRead(data.chatId, data.userId);
            } catch (error) {
                console.error('Error marking message as read:', error);
            }
        });
    }
}

module.exports = chatSocket;