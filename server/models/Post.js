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
    media: [
        {
            type: { type: String, enum: ['image', 'video'] },
            url: String
        }
    ],
    reactions: {
        like: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        love: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        care: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        haha: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        wow: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        sad: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        angry: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    },
    comments: [commentSchema],
    time: { type: String, default: "Agora" },
    isPinned: { type: Boolean, default: false },
    isRepost: { type: Boolean, default: false },
    originalPostId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null }
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);
