const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// @desc    Login admin
// @route   POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, error: 'Please provide username and password' });
        }

        const admin = await Admin.findOne({ username });
        if (!admin || !(await admin.comparePassword(password))) {
            return res.status(401).json({ success: false, error: 'Invalid username or password' });
        }

        const token = generateToken(admin._id);

        res.json({
            success: true,
            token,
            admin: { id: admin._id, username: admin.username, name: admin.name },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// @desc    Get current logged-in admin
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
    try {
        const admin = await Admin.findById(req.admin.id).select('-password');
        res.json({ success: true, admin });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
};
