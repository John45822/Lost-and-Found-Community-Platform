const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Post = require('../models/Post');

// Get comments for a post
router.get('/post/:postId', async (req, res) => {
    try {
        const comments = await Comment.find({ postId: req.params.postId })
            .populate('authorId', 'fullName username')
            .sort({ createdAt: 1 });
        res.json(comments);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Create comment
router.post('/', async (req, res) => {
    try {
        const { postId, authorId, content } = req.body;
        
        const comment = new Comment({
            postId,
            authorId,
            content
        });
        
        await comment.save();
        
        const populatedComment = await Comment.findById(comment._id)
            .populate('authorId', 'fullName username');
        
        res.json(populatedComment);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Edit comment
router.put('/:id', async (req, res) => {
    try {
        const { content } = req.body;
        const comment = await Comment.findByIdAndUpdate(
            req.params.id,
            { content },
            { new: true }
        ).populate('authorId', 'fullName username');
        
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        
        res.json(comment);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;

