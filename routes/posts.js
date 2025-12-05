const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Comment = require('../models/Comment');

// Get all approved posts
router.get('/approved', async (req, res) => {
    try {
        const posts = await Post.find({ isApproved: true })
            .populate('authorId', 'fullName username')
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get pending posts
router.get('/pending', async (req, res) => {
    try {
        const posts = await Post.find({ isApproved: false })
            .populate('authorId', 'fullName username')
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Create post
router.post('/', async (req, res) => {
    try {
        const { authorId, type, content, image } = req.body;
        
        // Check if user is admin (admin posts are auto-approved)
        const user = await User.findById(authorId);
        const isApproved = user && user.role === 'admin';
        
        const post = new Post({
            authorId,
            type,
            content,
            image,
            isApproved
        });
        
        await post.save();
        
        if (!isApproved) {
            // Notify admin
            const admin = await User.findOne({ role: 'admin' });
            if (admin) {
                await Notification.create({
                    userId: admin._id,
                    message: `New post request from ${user.fullName}`,
                    type: 'post_request'
                });
            }
        }
        
        const populatedPost = await Post.findById(post._id)
            .populate('authorId', 'fullName username');
        
        res.json({ post: populatedPost, message: isApproved ? 'Post created successfully' : 'Post submitted! Waiting for admin approval.' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Approve post
router.put('/:id/approve', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        
        post.isApproved = true;
        await post.save();
        
        // Notify author
        await Notification.create({
            userId: post.authorId,
            message: 'Your post has been approved!',
            type: 'success'
        });
        
        res.json({ message: 'Post approved successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Decline post
router.delete('/:id/decline', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        
        // Delete associated comments
        await Comment.deleteMany({ postId: post._id });
        
        // Delete post
        await Post.findByIdAndDelete(req.params.id);
        
        res.json({ message: 'Post declined and deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Edit post
router.put('/:id', async (req, res) => {
    try {
        const { content } = req.body;
        const post = await Post.findByIdAndUpdate(
            req.params.id,
            { content },
            { new: true }
        ).populate('authorId', 'fullName username');
        
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        
        res.json(post);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete post
router.delete('/:id', async (req, res) => {
    try {
        // Delete associated comments
        await Comment.deleteMany({ postId: req.params.id });
        
        // Delete post
        await Post.findByIdAndDelete(req.params.id);
        
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;

