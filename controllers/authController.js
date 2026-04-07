const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.signup = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        
        // Validate input
        if (!username || !email || !password) {
            return res.status(400).json({ error: "Username, email, and password are required" });
        }

        const user = await User.create({ username, email, password });
        res.status(201).json({ message: "User created successfully", user: { id: user._id, username: user.username, email: user.email } });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.login = async (req, res, next) => {
    try {
        console.log('Login request body:', req.body);
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const user = await User.findOne({ email });
        if (user && (await bcrypt.compare(password, user.password))) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
            res.json({ token, user: { id: user._id, username: user.username } });
        } else {
            console.log('Invalid credentials for email:', email);
            res.status(401).json({ message: "Invalid credentials" });
        }
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: err.message });
    }
};

exports.updateProfile = async (req, res, next) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.user.id, req.body, { new: true });
        res.json(updatedUser);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};