const express = require('express');
const router = express.Router();
const { signup, login, updateProfile } = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// POST /auth/signup - Register a new user
router.post('/signup', signup);

// POST /auth/login - User authentication
router.post('/login', login);

// PUT /auth/profile - Update user profile (requires JWT token)
router.put('/profile', authMiddleware, updateProfile);

module.exports = router;