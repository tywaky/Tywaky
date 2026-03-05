/* eslint-env node */
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    handle: { type: String, required: true, unique: true },
    bio: { type: String, default: "Olá, estou no Tywaky!" },
    followers: { type: Number, default: 0 },
    following: { type: Number, default: 0 },
    followingIds: [{ type: String }], // Keeping as string to match current ID format if migrating
    avatarUrl: { type: String, default: "" },
    bannerUrl: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
