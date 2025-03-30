const Chat = require('../models/chatModel');
const Message = require('../models/messageModel');
const User = require('../models/userModel');

// Create a new chat
const createChat = async (req, res) => {
    const { username2 } = req.body;
    console.log("username2: ", username2);
    //const { participants } = req.body;

    try {
        const user = await User.findOne({ username: req.session.username });
        const user2 = await User.findOne({ username: username2 });
        console.log("user2: ", user2);

        if ((!user) || (!user2)) {
            res.status(400).json({ message: 'User not found' });
            return;
        }

        const existingChat = await Chat.findOne({
            participants: { $all: [user._id, user2._id] }
        });

        if (existingChat) {
            res.status(400).json({ success: false, message: 'Chat already exists', chat: existingChat });
            return;
        }

        const newChat = await Chat.create({
            isDirectMessage: true,
            participants: [user._id, user2._id]
        });

        res.status(201).json({ success: true, newChat });
    } catch (error) {
        console.error('Error creating chat:', error);
        res.status(400).json({ success: false, message: error.message });
    }
};

// Create a new message
const createMessage = async (req, res) => {
    const { chatId, message } = req.body;

    try {
        const user = await User.findOne({ username: req.session.username });
        const chat = await Chat.findById(chatId);

        if (!chat) {
            res.status(400).json({ message: 'Chat not found' });
            return;
        }

        const newMessage = new Message({
            chat: chat._id,
            sender: user._id,
            message
        });

        const savedMessage = await newMessage.save();
        chat.lastMessage = savedMessage._id;
        chat.lastMessageAt = new Date();
        await chat.save();

        res.status(201).json(savedMessage);
    } catch (error) {
        console.error('Error creating message:', error);
        res.status(400).json({ message: error.message });
    }
};

// Get all chats
const getChats = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.session.username });
        const chats = await Chat.find({ participants: user._id }).populate('participants lastMessage');

        if (!chats) {
            res.status(400).json({ success: false, message: 'Chats not found' });
            return;
        }

        res.status(200).json({ success: true, chats: chats });
    } catch (error) {
        console.error('Error fetching chats:', error);
        res.status(400).json({ success: false, message: error.message });
    }
}

// Get all messages in a chat
const getMessages = async (req, res) => {
    const { chatId } = req.query;

    try {
        const messages = await Message.find({ chat: chatId }).populate('sender');
        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(400).json({ message: error.message });
    }
}

module.exports = { createChat, createMessage, getChats, getMessages };