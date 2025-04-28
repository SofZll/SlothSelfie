const Chat = require('../models/chatModel');
const Message = require('../models/messageModel');
const User = require('../models/userModel');

const { getCurrentNow } = require('../services/timeMachineService');

const now = getCurrentNow();

// Create a new chat
const createChat = async (req, res) => {
    const { username2 } = req.body;
    //const { participants } = req.body;

    try {
        const user = await User.findOne({ username: req.session.username });
        const user2 = await User.findOne({ username: username2 });

        if ((!user) || (!user2)) return res.status(400).json({ success: false, message: 'User not found' });

        const existingChat = await Chat.findOne({ participants: { $all: [user._id, user2._id] } });

        if (existingChat) return res.status(400).json({ success: false, message: 'Chat already exists', chat: existingChat });

        const newChat = await Chat.create({
            isDirectMessage: true,
            participants: [user._id, user2._id],
            createdAt: now
        });

        res.status(201).json({ success: true, newChat });
    } catch (error) {
        console.error('Error creating chat:', error);
        res.status(400).json({ success: false, message: error.message });
    }
};

// Get all chats
const getChats = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.session.username });
        const chats = await Chat.find({ participants: user._id, createdAt: { $lte: now } }).populate('participants lastMessage');

        if (!chats) return res.status(400).json({ success: false, message: 'Chats not found' });

        for (const chat of chats) {
            const unreadCount = await Message.countDocuments({
                chat: chat._id,
                'status': {
                    $elemMatch: {
                        user: user._id,
                        status: { $ne: 'read' }
                    }
                }
            });
            chat.unreadCount = unreadCount;
        }

        res.status(200).json({ success: true, chats: chats });
    } catch (error) {
        console.error('Error fetching chats:', error);
        res.status(400).json({ success: false, message: error.message });
    }
}

// Get all messages in a chat
const getMessages = async (req, res) => {
    const { chatId } = req.params;

    try {
        const messages = await Message.find({ chat: chatId, createdAt: { $lte: now } }).populate('sender').sort({ createdAt: 1 });

        if (!messages) return res.status(400).json({ success: false, message: 'Messages not found' });

        res.status(200).json({ success: true, messages: messages });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(400).json({ success: false, message: error.message });
    }
}

module.exports = { createChat, getChats, getMessages };