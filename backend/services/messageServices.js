const Chat = require('../models/chatModel');
const Message = require('../models/messageModel');
const User = require('../models/userModel');

const { getCurrentNow } = require('../services/timeMachineService');

const createMessage = async (message) => {
    const { chat, sender, content } = message;
    const user = await User.findById(sender._id);
    const foundChat = await Chat.findById(chat._id);
    const now = getCurrentNow();
    
    if (!foundChat || !user) {
        console.error('Chat or user not found');
        return;
    };

    const statusArray = foundChat.participants.map((participant) => ({
        user: participant._id,
        status: participant._id.equals(user.id) ? 'read' : 'sent'
    }));

    const newMessage = new Message({
        chat: foundChat._id,
        sender: user._id,
        content: { text: content.text },
        status: statusArray,
        createdAt: now,
        updatedAt: now
    });

    const savedMessage = await newMessage.save();

    foundChat.lastMessage = savedMessage._id;
    foundChat.lastMessageAt = now;
    await foundChat.save();

    return await Message.findById(savedMessage._id)
        .populate({
            path: 'chat',
            populate: {
                path: 'participants',
                select: 'id username'
            }
        })
        .populate('sender', 'username');
};

const markRead = async (chatId, userId) => {
    try {
        const chat = await Chat.findById(chatId);
        const user = await User.findById(userId);
        if (!chat || !user) {
            console.error('Chat or user not found');
            return;
        }

        const result = await Message.updateMany(
            {
                chat: chat,
                'status': {
                    $elemMatch: {
                        user: user,
                        status: { $ne: 'read' }
                    }
                }
            },
            {
                $set: {
                    'status.$[elem].status': 'read',
                    'status.$[elem].timestamp': getCurrentNow()
                }
            },
            {
                arrayFilters: [
                    {
                        'elem.user': user,
                        'elem.status': { $ne: 'read' }
                    }
                ]
            }
        );
        
        return result;
    } catch (error) {
        console.error('Errore in markRead:', error);
    }
}

module.exports = { createMessage , markRead }