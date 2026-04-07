const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.signup = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        
        console.log('Signup request:', { username, email });

        // Validate input
        if (!username || !email || !password) {
            return res.status(400).json({ error: "Username, email, and password are required" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already registered" });
        }

        const user = await User.create({ username, email, password });
        console.log('User created:', user._id);
        
        res.status(201).json({ 
            message: "User created successfully", 
            user: { id: user._id, username: user.username, email: user.email } 
        });
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ error: err.message || 'Signup failed' });
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        
        console.log('Login attempt for:', email);

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        console.log('Login successful for:', email);
        
        res.json({ token, user: { id: user._id, username: user.username } });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: err.message || 'Login failed' });
    }
};

exports.updateProfile = async (req, res, next) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.user.id, req.body, { new: true });
        res.json(updatedUser);
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ error: err.message || 'Profile update failed' });
    }
};