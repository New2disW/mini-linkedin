const express = require('express');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

const router = express.Router();

// POST /api/follow/:id/follow
router.post('/:id/follow', protect, async (req, res) => {
    try {
        if (req.params.id === req.user._id.toString())
            return res.status(400).json({ message: 'Cannot follow yourself' });

        const targetUser = await User.findById(req.params.id);
        if (!targetUser) return res.status(404).json({ message: 'User not found' });

        const alreadyFollowing = req.user.following.includes(targetUser._id);
        if (alreadyFollowing)
            return res.status(400).json({ message: 'Already following' });

        await User.findByIdAndUpdate(req.user._id, { $push: { following: targetUser._id } });
        await User.findByIdAndUpdate(targetUser._id, { $push: { followers: req.user._id } });

        const notif = await Notification.create({
            recipient: targetUser._id,
            sender: req.user._id,
            type: 'follow',
            message: `${req.user.name} started following you`,
        });
        const io = req.app.get('io');
        if (io) io.to(targetUser._id.toString()).emit('notification', notif);

        res.json({ message: 'Followed successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/follow/:id/unfollow
router.delete('/:id/unfollow', protect, async (req, res) => {
    try {
        const targetUser = await User.findById(req.params.id);
        if (!targetUser) return res.status(404).json({ message: 'User not found' });

        await User.findByIdAndUpdate(req.user._id, { $pull: { following: targetUser._id } });
        await User.findByIdAndUpdate(targetUser._id, { $pull: { followers: req.user._id } });

        res.json({ message: 'Unfollowed successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
