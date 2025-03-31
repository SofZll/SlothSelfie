const express = require('express');

const { createChat, createMessage, getMessages, getChats} = require('../controllers/chatController');

const router = express.Router();

// chat endpoint
router.post('/chat/:chatId/message', createMessage);
router.get('/chat/:chatId', getMessages);
router.get('/chat', getChats);
router.post('/chat', createChat);

module.exports = router;