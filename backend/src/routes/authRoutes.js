const express = require('express');
const router = express.Router();
const { login, getMe } = require('../controllers/authController');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Middleware to protect routes
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return res.status(401).json({ success: false, error: 'Not authorized, no token' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = await Admin.findById(decoded.id).select('-password');
        next();
    } catch (err) {
        return res.status(401).json({ success: false, error: 'Not authorized, token failed' });
    }
};

router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;
module.exports.protect = protect;
