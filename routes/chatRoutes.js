// routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Message = require('../models/Message');
const authMiddleware = require('../middleware/auth');

router.get('/inbox', authMiddleware, async (req, res) => {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    try {
        const inbox = await Message.aggregate([
            {
                $match: {
                    $or: [{ sender: userId }, { receiver: userId }]
                }
            },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ["$sender", userId] },
                            "$receiver",
                            "$sender"
                        ]
                    },
                    lastMessage: { $first: "$text" },
                    timestamp: { $first: "$createdAt" }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'contactDetails'
                }
            },
            { $unwind: "$contactDetails" },
            { $sort: { timestamp: -1 } }
        ]);

        res.json(inbox);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all messages between User A and User B
router.get('/messages/:otherUserId', authMiddleware, async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [
                { sender: req.user.id, receiver: req.params.otherUserId },
                { sender: req.params.otherUserId, receiver: req.user.id }
            ]
        }).sort({ createdAt: 1 }); // Sort by time so old messages are at the top

        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;