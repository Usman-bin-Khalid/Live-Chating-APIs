const Profile = require('../models/Profile');
const User = require('../models/User');

// @desc    Create or Update Profile
// @route   POST /api/profile
// @access  Private
exports.createProfile = async (req, res) => {
    try {
        const { age, country, phoneNumber, about } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        let profilePic = '';
        if (req.file) {
            profilePic = req.file.path; // This will be the Cloudinary URL
        }

        let profile = await Profile.findOne({ user: userId });

        if (profile) {
            // If profile exists, update it
            profile.age = age || profile.age;
            profile.country = country || profile.country;
            profile.phoneNumber = phoneNumber || profile.phoneNumber;
            profile.about = about || profile.about;
            if (profilePic) profile.profilePic = profilePic;
            
            await profile.save();
            return res.status(200).json({ message: "Profile updated", profile });
        }

        // Create new profile
        profile = new Profile({
            user: userId,
            username: user.username,
            age,
            country,
            phoneNumber,
            about,
            profilePic
        });

        await profile.save();
        res.status(201).json({ message: "Profile created successfully", profile });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc    Get Current User Profile
// @route   GET /api/profile
// @access  Private
exports.getProfile = async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }
        res.status(200).json(profile);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc    Update Profile (Specific for PUT request)
// @route   PUT /api/profile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const { age, country, phoneNumber, about } = req.body;
        const userId = req.user.id;

        let profile = await Profile.findOne({ user: userId });
        if (!profile) {
            return res.status(404).json({ message: "Profile not found. Create one first." });
        }

        profile.age = age !== undefined ? age : profile.age;
        profile.country = country || profile.country;
        profile.phoneNumber = phoneNumber || profile.phoneNumber;
        profile.about = about || profile.about;

        if (req.file) {
            profile.profilePic = req.file.path;
        }

        await profile.save();
        res.status(200).json({ message: "Profile updated successfully", profile });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc    Delete Profile
// @route   DELETE /api/profile
// @access  Private
exports.deleteProfile = async (req, res) => {
    try {
        const profile = await Profile.findOneAndDelete({ user: req.user.id });
        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }
        res.status(200).json({ message: "Profile deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
