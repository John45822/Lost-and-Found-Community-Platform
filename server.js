const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lostfound';
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
    console.error('MongoDB connection error:', err);
    // Don't exit - allow server to start even if DB connection fails initially
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/notifications', require('./routes/notifications'));

// 404 handler for API routes (must be before error handler)
app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
});

// Error handling middleware (must be last)
app.use((err, req, res, next) => {
    console.error('Error:', err);
    // Ensure we always return JSON
    if (!res.headersSent) {
        res.status(err.status || 500).json({
            error: err.message || 'Internal server error'
        });
    }
});

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Initialize admin account
const User = require('./models/User');
async function initializeAdmin() {
    try {
        // Wait for MongoDB connection
        if (mongoose.connection.readyState !== 1) {
            console.log('Waiting for MongoDB connection...');
            await new Promise((resolve) => {
                mongoose.connection.once('connected', resolve);
                setTimeout(resolve, 5000); // Timeout after 5 seconds
            });
        }
        
        if (mongoose.connection.readyState === 1) {
            const adminExists = await User.findOne({ username: 'admin', role: 'admin' });
            if (!adminExists) {
                const admin = new User({
                    username: 'admin',
                    password: 'admin123',
                    role: 'admin',
                    fullName: 'Administrator',
                    location: 'Local Government Unit',
                    contactNumber: 'N/A',
                    isApproved: true
                });
                await admin.save();
                console.log('Admin account created');
            }
        } else {
            console.warn('MongoDB not connected. Admin initialization skipped.');
        }
    } catch (error) {
        console.error('Error initializing admin:', error);
    }
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    await initializeAdmin();
});

