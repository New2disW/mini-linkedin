const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const experienceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: String,
    from: { type: Date, required: true },
    to: Date,
    current: { type: Boolean, default: false },
    description: String,
});

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, required: true },
        avatar: { type: String, default: '' },
        headline: { type: String, default: 'Professional at Mini LinkedIn' },
        about: { type: String, default: '' },
        location: { type: String, default: '' },
        skills: [{ type: String }],
        experience: [experienceSchema],
        followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    },
    { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 12);
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
