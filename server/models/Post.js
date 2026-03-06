/* eslint-env node */
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    userId: { type: String },
    user: { type: String },
    content: { type: String, required: true },
    time: { type: String, default: "Agora" }
}, { timestamps: true });

const postSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    user: { type: String },
    handle: { type: String },
    avatar: { type: String },
    content: { type: String },
    imageUrl: { type: String },
    likes: { type: Number, default: 0 },
    likedBy: [{ type: String }],
    comments: [commentSchema],
    time: { type: String, default: "Agora" },
    isPinned: { type: Boolean, default: false },
    isRepost: { type: Boolean, default: false },
    originalPostId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null },
    media: [{
        type: { type: String, enum: ['image', 'video'], default: 'image' },
        url: { type: String, required: true }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);
