const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true
    },
    age: {
        type: Number
    },
    country: {
        type: String
    },
    phoneNumber: {
        type: String
    },
    about: {
        type: String
    },
    profilePic: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);
