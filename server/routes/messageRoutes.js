const express = require('express');
const isLoggedIn = require('../middleware/auth');
const { saveMessage } = require('../controllers/messageController');

const messageRouter = express.Router();

messageRouter.post('/leads/:id/messages', isLoggedIn, saveMessage);

module.exports = messageRouter;