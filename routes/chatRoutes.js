const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/auth');

// GET /chat/inbox - Get user inbox (all conversations with latest message)
router.get('/inbox', authMiddleware, chatController.getInbox);

// GET /chat/messages/:otherUserId - Get messages between two users
router.get('/messages/:otherUserId', authMiddleware, chatController.getMessages);

// POST /chat/send - Send a message via HTTP
router.post('/send', authMiddleware, chatController.sendMessage);

module.exports = router;