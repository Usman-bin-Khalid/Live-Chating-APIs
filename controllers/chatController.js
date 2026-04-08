const Message = require('../models/Message');
const mongoose = require('mongoose');

// @desc    Get user inbox (all conversations with latest message)
// @route   GET /chat/inbox
exports.getInbox = async (req, res) => {
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
                    timestamp: { $first: "$createdAt" },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$receiver", userId] },
                                        { $eq: ["$isRead", false] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
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
            {
                $project: {
                    _id: 1,
                    lastMessage: 1,
                    timestamp: 1,
                    unreadCount: 1,
                    "contactDetails._id": 1,
                    "contactDetails.username": 1,
                    "contactDetails.email": 1
                }
            },
            { $sort: { timestamp: -1 } }
        ]);

        res.json(inbox);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc    Get messages between two users
// @route   GET /chat/messages/:otherUserId
exports.getMessages = async (req, res) => {
    try {
        const { otherUserId } = req.params;
        const userId = req.user.id;

        // Mark messages as read
        await Message.updateMany(
            { sender: otherUserId, receiver: userId, isRead: false },
            { $set: { isRead: true } }
        );

        const messages = await Message.find({
            $or: [
                { sender: userId, receiver: otherUserId },
                { sender: otherUserId, receiver: userId }
            ]
        }).sort({ createdAt: 1 });

        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// @desc    Send a message via HTTP
// @route   POST /chat/send
exports.sendMessage = async (req, res) => {
    try {
        const { receiver, text } = req.body;
        const sender = req.user.id;

        if (!receiver || !text) {
            return res.status(400).json({ error: "Receiver ID and text are required" });
        }

        const newMessage = new Message({
            sender,
            receiver,
            text
        });

        await newMessage.save();

        // Trigger Socket.io event
        const io = req.app.get('io');
        if (io) {
            io.to(receiver).emit('receive_message', {
                sender,
                text,
                createdAt: newMessage.createdAt
            });
            // Also notify sender if they have multiple tabs open
            io.to(sender).emit('message_sent', newMessage);
        }

        res.status(201).json(newMessage);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
