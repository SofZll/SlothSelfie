const Chat = require('../models/chatModel');
const Message = require('../models/messageModel');
const User = require('../models/userModel');

const createMessage = async (message) => {
    const { chat, sender, content } = message;
    console.log('Message content:', content);
    const user = await User.findById(sender._id);
    const foundChat = await Chat.findById(chat._id);
    console.log('Found chat:', foundChat);
    console.log('Found user:', user);

    if (!foundChat || !user) {
        console.error('Chat or user not found');
        return;
    };

    const newMessage = new Message({
        chat: foundChat._id,
        sender: user._id,
        content: { text: content.text }
    });

    console.log('New message:', newMessage);
    const savedMessage = await newMessage.save();
    console.log('Message saved:', savedMessage);

    foundChat.lastMessage = savedMessage._id;
    foundChat.lastMessageAt = new Date();
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

module.exports = { createMessage }