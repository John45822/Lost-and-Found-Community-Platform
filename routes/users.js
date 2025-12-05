const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Notification = require('../models/Notification');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Message = require('../models/Message');

// Get all users (for admin)
router.get('/', async (req, res) => {
    try {
        const users = await User.find().select('-password').lean();
        res.json(users || []);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

// Get approved users (for messaging)
router.get('/approved', async (req, res) => {
    try {
        const users = await User.find({ isApproved: true }).select('-password').lean();
        res.json(users || []);
    } catch (error) {
        console.error('Error fetching approved users:', error);
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

// Get pending users
router.get('/pending', async (req, res) => {
    try {
        const users = await User.find({ isApproved: false, role: 'user' }).select('-password').lean();
        res.json(users || []);
    } catch (error) {
        console.error('Error fetching pending users:', error);
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

// Approve account
router.put('/:id/approve', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        user.isApproved = true;
        await user.save();
        
        // Notify user
        await Notification.create({
            userId: user._id,
            message: 'Your account has been approved! You can now log in.',
            type: 'success'
        });
        
        res.json({ message: 'Account approved successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Decline account
router.delete('/:id/decline', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Account declined and deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete account
router.delete('/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        
        // Delete user's posts
        await Post.deleteMany({ authorId: userId });
        
        // Delete comments on user's posts and user's comments
        const userPosts = await Post.find({ authorId: userId });
        const postIds = userPosts.map(p => p._id);
        await Comment.deleteMany({ $or: [{ postId: { $in: postIds } }, { authorId: userId }] });
        
        // Delete user's messages
        await Message.deleteMany({ $or: [{ senderId: userId }, { recipientId: userId }] });
        
        // Delete user's notifications
        await Notification.deleteMany({ userId });
        
        // Delete user
        await User.findByIdAndDelete(userId);
        
        res.json({ message: 'Account and all associated data deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;

