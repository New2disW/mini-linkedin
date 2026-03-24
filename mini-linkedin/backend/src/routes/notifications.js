const express = require('express');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/notifications
router.get('/', protect, async (req, res) => {
    try {
        const notifs = await Notification.find({ recipient: req.user._id })
            .populate('sender', 'name avatar')
            .sort({ createdAt: -1 })
            .limit(30);
        res.json(notifs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/notifications/read — mark all as read
router.put('/read', protect, async (req, res) => {
    try {
        await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
        res.json({ message: 'All notifications marked as read' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
