const express = require('express');

const { createChat, getMessages, getChats} = require('../controllers/chatController');

const router = express.Router();

// chat endpoint
router.get('/chat/:chatId', getMessages);
router.get('/chat', getChats);
router.post('/chat', createChat);

module.exports = router;