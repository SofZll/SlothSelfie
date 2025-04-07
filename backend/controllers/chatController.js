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

// Get all chats
const getChats = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.session.username });
        const chats = await Chat.find({ participants: user._id }).populate('participants lastMessage');

        if (!chats) {
            res.status(400).json({ success: false, message: 'Chats not found' });
            return;
        }

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
        const messages = await Message.find({ chat: chatId }).populate('sender').sort({ createdAt: 1 });

        if (!messages) {
            res.status(400).json({ success: false, message: 'Messages not found' });
            return;
        }

        res.status(200).json({ success: true, messages: messages });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(400).json({ success: false, message: error.message });
    }
}

module.exports = { createChat, getChats, getMessages };