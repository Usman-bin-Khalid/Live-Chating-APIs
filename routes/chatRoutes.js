// routes/chatRoutes.js
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