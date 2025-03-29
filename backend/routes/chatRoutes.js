const express = require('express');

const { createChat, createMessage, getMessages, getChats} = require('../controllers/chatController');

const router = express.Router();

// chat endpoint
router.post('/chat/new-chat', createChat);
router.post('/chat/new-message', createMessage);
router.get('/chat/messages', getMessages);
router.get('/chat/chats', getChats);

module.exports = router;