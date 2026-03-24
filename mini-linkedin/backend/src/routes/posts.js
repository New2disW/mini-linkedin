const express = require('express');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

const router = express.Router();

// GET /api/posts — feed (posts by following + own)
router.get('/', protect, async (req, res) => {
    try {
        const user = req.user;
        const feedUsers = [...user.following, user._id];
        const posts = await Post.find({ author: { $in: feedUsers } })
            .populate('author', 'name avatar headline')
            .populate('comments.user', 'name avatar')
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/posts — create post
router.post('/', protect, upload.single('image'), async (req, res) => {
    try {
        const { content } = req.body;
        if (!content) return res.status(400).json({ message: 'Content is required' });
        
        let image = '';
        if (req.file) {
            image = req.file.path;
        }

        const post = await Post.create({ author: req.user._id, content, image });
        const populated = await post.populate('author', 'name avatar headline');
        res.status(201).json(populated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/posts/:id/like — toggle like
router.put('/:id/like', protect, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const liked = post.likes.includes(req.user._id);
        if (liked) {
            post.likes = post.likes.filter((id) => id.toString() !== req.user._id.toString());
        } else {
            post.likes.push(req.user._id);
            // Notify post author if not self
            if (post.author.toString() !== req.user._id.toString()) {
                const notif = await Notification.create({
                    recipient: post.author,
                    sender: req.user._id,
                    type: 'like',
                    post: post._id,
                    message: `${req.user.name} liked your post`,
                });
                // emit via socket
                const io = req.app.get('io');
                if (io) {
                    io.to(post.author.toString()).emit('notification', notif);
                }
            }
        }
        await post.save();
        res.json({ likes: post.likes });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/posts/:id/comment
router.post('/:id/comment', protect, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ message: 'Comment text required' });

        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        post.comments.push({ user: req.user._id, text });
        await post.save();

        // Notify post author
        if (post.author.toString() !== req.user._id.toString()) {
            const notif = await Notification.create({
                recipient: post.author,
                sender: req.user._id,
                type: 'comment',
                post: post._id,
                message: `${req.user.name} commented on your post`,
            });
            const io = req.app.get('io');
            if (io) io.to(post.author.toString()).emit('notification', notif);
        }

        const updated = await Post.findById(post._id)
            .populate('author', 'name avatar headline')
            .populate('comments.user', 'name avatar');
        res.status(201).json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/posts/:id
router.delete('/:id', protect, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        if (post.author.toString() !== req.user._id.toString())
            return res.status(403).json({ message: 'Not authorized' });
        await post.deleteOne();
        res.json({ message: 'Post deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
