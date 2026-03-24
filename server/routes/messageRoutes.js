const express = require('express');
const isLoggedIn = require('../middleware/auth');
const { saveMessage, fetchMessages } = require('../controllers/messageController');

const messageRouter = express.Router();

messageRouter.post('/leads/:id/messages', isLoggedIn, saveMessage);
messageRouter.get('/leads/:id/messages', isLoggedIn, fetchMessages);

module.exports = messageRouter;