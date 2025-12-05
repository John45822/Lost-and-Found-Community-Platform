const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Notification = require('../models/Notification');

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username, password });
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        
        if (!user.isApproved && user.role !== 'admin') {
            return res.status(403).json({ error: 'Your account is pending approval. Please wait for admin approval.' });
        }
        
        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;
        
        res.json({ user: userResponse });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Signup
router.post('/signup', async (req, res) => {
    try {
        const { username, password, fullName, location, contactNumber, idPicture } = req.body;
        
        // Check if username exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }
        
        // Create new user
        const newUser = new User({
            username,
            password,
            fullName,
            location,
            contactNumber,
            idPicture,
            isApproved: false
        });
        
        await newUser.save();
        
        // Notify admin
        const admin = await User.findOne({ role: 'admin' });
        if (admin) {
            await Notification.create({
                userId: admin._id,
                message: `New account activation request from ${fullName} (${username})`,
                type: 'account_request'
            });
        }
        
        res.json({ 
            message: 'Registration successful! Your account activation request has been sent to the admin.',
            success: true
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;

