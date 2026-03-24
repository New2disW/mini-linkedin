const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

const router = express.Router();

// GET /api/users/me — current user profile
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('followers', 'name avatar headline')
            .populate('following', 'name avatar headline');
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/users/search?q=term
router.get('/search', protect, async (req, res) => {
    try {
        const q = req.query.q || '';
        const users = await User.find({
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { headline: { $regex: q, $options: 'i' } },
            ],
            _id: { $ne: req.user._id },
        }).select('name avatar headline skills').limit(20);
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/users — all users (for network page)
router.get('/', protect, async (req, res) => {
    try {
        const users = await User.find({ _id: { $ne: req.user._id } })
            .select('name avatar headline skills followers')
            .limit(50);
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/users/:id
router.get('/:id', protect, async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .populate('followers', 'name avatar headline')
            .populate('following', 'name avatar headline')
            .select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/users/profile — update profile
router.put('/profile', protect, async (req, res) => {
    try {
        const { name, headline, about, location, skills, experience } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (name) user.name = name;
        if (headline !== undefined) user.headline = headline;
        if (about !== undefined) user.about = about;
        if (location !== undefined) user.location = location;
        if (skills) user.skills = skills;
        if (experience) user.experience = experience;

        const updated = await user.save();
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/users/avatar — upload avatar via Cloudinary
router.post('/avatar', protect, upload.single('avatar'), async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.avatar = req.file.path;
        await user.save();
        res.json({ avatar: user.avatar });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
