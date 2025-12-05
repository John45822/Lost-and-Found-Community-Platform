const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Get messages for a user
router.get('/user/:userId', async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [
                { senderId: req.params.userId },
                { recipientId: req.params.userId }
            ]
        })
        .populate('senderId', 'fullName username')
        .populate('recipientId', 'fullName username')
        .sort({ createdAt: -1 });
        
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Send message
router.post('/', async (req, res) => {
    try {
        const { senderId, recipientId, content } = req.body;
        
        const message = new Message({
            senderId,
            recipientId,
            content
        });
        
        await message.save();
        
        // Notify recipient
        const sender = await User.findById(senderId);
        await Notification.create({
            userId: recipientId,
            message: `New message from ${sender.fullName}`,
            type: 'message'
        });
        
        const populatedMessage = await Message.findById(message._id)
            .populate('senderId', 'fullName username')
            .populate('recipientId', 'fullName username');
        
        res.json(populatedMessage);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;

