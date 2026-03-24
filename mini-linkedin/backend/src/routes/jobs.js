const express = require('express');
const Job = require('../models/Job');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/jobs
router.get('/', protect, async (req, res) => {
    try {
        const jobs = await Job.find()
            .populate('postedBy', 'name avatar headline')
            .sort({ createdAt: -1 });
        res.json(jobs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/jobs
router.post('/', protect, async (req, res) => {
    try {
        const { title, company, location, type, description, requirements, salary } = req.body;
        if (!title || !company || !location || !description)
            return res.status(400).json({ message: 'Please fill required fields' });

        const job = await Job.create({
            title,
            company,
            location,
            type: type || 'Full-time',
            description,
            requirements: requirements || [],
            salary: salary || 'Not disclosed',
            postedBy: req.user._id,
        });
        const populated = await job.populate('postedBy', 'name avatar headline');
        res.status(201).json(populated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/jobs/:id
router.delete('/:id', protect, async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });
        if (job.postedBy.toString() !== req.user._id.toString())
            return res.status(403).json({ message: 'Not authorized' });
        await job.deleteOne();
        res.json({ message: 'Job deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
